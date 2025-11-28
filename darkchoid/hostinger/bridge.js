(() => {
  const API_BASE = '/hostinger/api';  // Fixed path
  const syncKeys = ['packages', 'dishes', 'orders', 'discountCodes', 'settings', 'cmsContent', 'articles', 'globalVariantTemplates', 'cart', 'appliedDiscounts'];
  
  // Save original localStorage methods
  const nativeSetItem = localStorage.setItem.bind(localStorage);
  const nativeGetItem = localStorage.getItem.bind(localStorage);
  
  let syncInProgress = false;
  let syncQueue = [];
  
  // Enhanced save with retry logic
  async function saveRemote(key, value, retries = 3) {
    // Ensure value is a string (don't double-encode)
    const valueToSend = typeof value === 'string' ? value : JSON.stringify(value);
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${API_BASE}/save.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: valueToSend })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.ok) {
          console.error(`Save failed for key '${key}':`, result.error);
          throw new Error(result.error || 'Save failed');
        }
        
        console.log(`✓ Saved to remote: ${key}`);
        return true;
        
      } catch (error) {
        console.error(`Save attempt ${i + 1}/${retries} failed for key '${key}':`, error);
        if (i === retries - 1) {
          console.error(`Failed to save '${key}' after ${retries} attempts`);
          return false;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return false;
  }
  
  // Process sync queue
  async function processSyncQueue() {
    if (syncInProgress || syncQueue.length === 0) return;
    
    syncInProgress = true;
    
    while (syncQueue.length > 0) {
      const { key, value } = syncQueue.shift();
      await saveRemote(key, value);
    }
    
    syncInProgress = false;
  }
  
  // Override localStorage.setItem
  localStorage.setItem = function(key, value) {
    nativeSetItem(key, value);
    
    if (syncKeys.includes(key)) {
      // Add to queue instead of immediate save
      syncQueue.push({ key, value });
      
      // Debounce queue processing
      setTimeout(() => {
        if (!syncInProgress) {
          processSyncQueue();
        }
      }, 100);
    }
  };
  
  // Load remote data on initialization
  async function loadRemoteData() {
    console.log('⚡ Loading remote data (bulk mode)...');
    const startTime = Date.now();
    
    try {
      // Check session first
      const sessionResponse = await fetch(`${API_BASE}/session.php`);
      const sessionData = await sessionResponse.json();
      
      if (sessionData && sessionData.loggedIn) {
        nativeSetItem('adminLoggedIn', 'true');
        console.log('✓ Admin session active');
      } else {
        localStorage.removeItem('adminLoggedIn');
      }
      
    } catch (error) {
      console.error('Session check failed:', error);
    }
    
    try {
      // Use bulk fetch for all keys in ONE request
      const keysToLoad = syncKeys.join(',');
      const response = await fetch(`${API_BASE}/bulk_get.php?keys=${encodeURIComponent(keysToLoad)}&_=${Date.now()}`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.ok && result.data) {
          let loadedCount = 0;
          
          for (const [key, value] of Object.entries(result.data)) {
            if (value !== null) {
              nativeSetItem(key, value);
              loadedCount++;
            }
          }
          
          const duration = Date.now() - startTime;
          console.log(`✓ Loaded ${loadedCount}/${syncKeys.length} keys in ${duration}ms (bulk fetch)`);
        }
      } else {
        console.warn('Bulk fetch failed, falling back to individual requests...');
        await loadRemoteDataFallback();
      }
    } catch (error) {
      console.error('Bulk fetch error:', error);
      console.log('Falling back to individual requests...');
      await loadRemoteDataFallback();
    }
    
    const totalDuration = Date.now() - startTime;
    console.log(`✅ Remote data load complete (${totalDuration}ms)`);
    
    // Dispatch event to notify app that data is loaded
    window.dispatchEvent(new CustomEvent('remoteDataLoaded'));
  }
  
  // Fallback: Load keys individually (parallel)
  async function loadRemoteDataFallback() {
    const loadPromises = syncKeys.map(async (key) => {
      try {
        const response = await fetch(`${API_BASE}/get.php?key=${encodeURIComponent(key)}&_=${Date.now()}`);
        
        if (!response.ok) {
          console.warn(`Failed to fetch '${key}': HTTP ${response.status}`);
          return;
        }
        
        const result = await response.json();
        
        if (result.ok && result.value !== null) {
          nativeSetItem(key, result.value);
          console.log(`✓ Loaded from remote: ${key}`);
        }
        
      } catch (error) {
        console.error(`Failed to load '${key}':`, error);
      }
    });
    
    await Promise.all(loadPromises);
  }
  
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRemoteData);
  } else {
    loadRemoteData();
  }
  
  // Sync local changes to remote on page load
  window.addEventListener('load', async () => {
    console.log('Syncing local changes to remote...');
    
    for (const key of syncKeys) {
      const value = nativeGetItem(key);
      if (value !== null) {
        await saveRemote(key, value, 1); // Single attempt for initial sync
      }
    }
    
    console.log('Initial sync complete');
  });
  
  // Expose utility functions
  window.konohaSync = {
    forceSave: async (key) => {
      const value = nativeGetItem(key);
      if (value !== null) {
        return await saveRemote(key, value);
      }
      return false;
    },
    forceLoad: async (key) => {
      try {
        const response = await fetch(`${API_BASE}/get.php?key=${encodeURIComponent(key)}&_=${Date.now()}`);
        const result = await response.json();
        if (result.ok && result.value !== null) {
          nativeSetItem(key, result.value);
          return true;
        }
      } catch (error) {
        console.error(`Failed to force load '${key}':`, error);
      }
      return false;
    },
    syncAll: async () => {
      await loadRemoteData();
      for (const key of syncKeys) {
        const value = nativeGetItem(key);
        if (value !== null) {
          await saveRemote(key, value);
        }
      }
    }
  };
})();