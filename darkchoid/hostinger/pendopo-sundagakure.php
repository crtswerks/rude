<?php
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
require __DIR__.'/api/config.php';
if (session_status() === PHP_SESSION_NONE) { session_start(); }
if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
  header('Location: /gerbang-sundagakure');
  exit;
}
?><!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konoha Admin Dashboard</title>
  <base href="/">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="../style.css">
  <meta name="robots" content="noindex, nofollow">
  <script>
    document.documentElement.style.visibility = 'hidden';
    window.addEventListener('remoteDataLoaded', function(){ document.documentElement.style.visibility = ''; });
  </script>
  <style>html{background:#fff}</style>
  <script>
    try { localStorage.removeItem('adminLoggedIn'); } catch(e){}
  </script>
  <script src="/hostinger/bridge.js"></script>
  <script>
    try { localStorage.setItem('adminLoggedIn','true'); } catch(_){}
  </script>
</head>
<body class="bg-amber-50 text-gray-800 dark:bg-white dark:text-gray-300 min-h-screen">
  <header class="bg-gradient-to-r from-green-700 to-green-600 text-white p-4 shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <img src="../assets/konoha-logo.png" alt="Logo" class="w-10 h-10 rounded-full bg-white p-1">
        <h1 class="text-2xl font-bold">Konoha Admin Dashboard</h1>
      </div>
      <div class="flex items-center space-x-3">
        <span class="text-sm">👤 Admin</span>
        <button id="logoutBtn" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition shadow-md">Logout</button>
      </div>
    </div>
  </header>
  
  <main class="container mx-auto p-6 space-y-10 max-w-7xl">
    <section class="bg-white rounded-xl shadow-xl border-t-4 border-blue-600 p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-blue-700">Monitor Live</h2>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input id="autoRefreshToggle" type="checkbox" class="w-4 h-4">
            <span>Auto Refresh</span>
          </label>
          <div class="flex items-center gap-2">
            <label for="autoRefreshInterval" class="text-sm text-gray-700">Interval (s)</label>
            <input id="autoRefreshInterval" type="number" min="3" value="15" class="w-20 border rounded px-2 py-1" />
          </div>
          <button id="liveRefreshBtn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold">Refresh</button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-4 bg-gray-50 rounded-lg border">
          <h3 class="text-lg font-semibold mb-3 text-gray-800">Keranjang Aktif</h3>
          <div id="liveCartContainer" class="space-y-2 text-sm text-gray-700"></div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg border">
          <h3 class="text-lg font-semibold mb-3 text-gray-800">Kode Diskon Diterapkan</h3>
          <div id="liveDiscountsContainer" class="space-y-2 text-sm text-gray-700"></div>
        </div>
      </div>
    </section>
    
    <div id="adminApp">
      <div class="text-center py-8">
        <div class="spinner mx-auto mb-3"></div>
        <p class="text-gray-500">Memuat dashboard...</p>
      </div>
    </div>
  </main>
  
  <footer class="bg-amber-900 text-amber-50 text-center p-6 mt-16">
    <div class="max-w-6xl mx-auto">
      <p class="text-lg font-semibold mb-2">KONOHA Catering</p>
      <p class="text-sm mb-2">Layanan Catering Premium untuk Acara Spesial Anda</p>
      <p class="text-xs opacity-75">Copyright © 2025 created by crtswerks. All rights reserved.</p>
    </div>
  </footer>
  
  <script>
    document.addEventListener('DOMContentLoaded',()=>{
      const b=document.getElementById('logoutBtn');
      if(b){ b.addEventListener('click',()=>{ fetch('/hostinger/api/logout.php').then(()=>{ localStorage.removeItem('adminLoggedIn'); window.location.href='/gerbang-sundagakure'; }); }); }
    });
  </script>
  
  <script>
    document.addEventListener('DOMContentLoaded', async ()=>{
      try{
        const res = await fetch('/hostinger/api/admin_content.php');
        if(res.ok){
          const html = await res.text();
          const adminApp = document.getElementById('adminApp');
          if (adminApp) {
            adminApp.innerHTML = html;
          }
          
          const s = document.createElement('script');
          s.src = '/admin.js';
          s.onload = function(){ try { window.dispatchEvent(new Event('adminJsLoaded')); } catch(_){} };
          document.body.appendChild(s);
        }
      }catch(e){ console.error('Failed to load admin content', e); }
    });
  </script>
  
  <script>
    async function loadLive(){
      const cartRes=await fetch('/hostinger/api/get.php?key=cart');
      const discRes=await fetch('/hostinger/api/get.php?key=appliedDiscounts');
      const cartJson=await cartRes.json();
      const discJson=await discRes.json();
      const cart=cartJson&&cartJson.value?JSON.parse(cartJson.value):[];
      const discounts=discJson&&discJson.value?JSON.parse(discJson.value):[];
      const cartEl=document.getElementById('liveCartContainer');
      const discEl=document.getElementById('liveDiscountsContainer');
      cartEl.innerHTML='';
      discEl.innerHTML='';
      if(Array.isArray(cart)&&cart.length){
        cart.forEach(item=>{
          const pv=item.primaryVariant?` [${item.primaryVariant}]`:'';
          const addSel=item.additionalSelections&&Object.keys(item.additionalSelections).length?` {${Object.entries(item.additionalSelections).map(([g,v])=>`${g}: ${v}`).join('; ')}}`:'';
          const div=document.createElement('div');
          div.className='flex justify-between items-center';
          const unit=(item.primaryVariants&&item.primaryVariants.options?item.primaryVariants.options.find(o=>o.name==='normal')?.price:item.price)||item.price;
          div.innerHTML=`<span>${item.name}${pv}${addSel} x ${item.qty}</span><span class='font-bold text-yellow-600'>Rp ${(item.qty*unit).toLocaleString()}</span>`;
          cartEl.appendChild(div);
        });
      } else {
        cartEl.innerHTML='<div class="text-gray-500">Tidak ada keranjang aktif</div>';
      }
      if(Array.isArray(discounts)&&discounts.length){
        discounts.forEach(code=>{
          const d=document.createElement('div');
          d.textContent=code;
          discEl.appendChild(d);
        });
      } else {
        discEl.innerHTML='<div class="text-gray-500">Tidak ada kode diskon</div>';
      }
    }
    document.getElementById('liveRefreshBtn').addEventListener('click',loadLive);
    document.addEventListener('DOMContentLoaded',loadLive);
    let autoRefreshId=null;
    function startAutoRefresh(){
      const s=document.getElementById('autoRefreshInterval');
      const sec=Math.max(3,parseInt(s.value||'15',10));
      if(autoRefreshId){ clearInterval(autoRefreshId); }
      autoRefreshId=setInterval(loadLive,sec*1000);
    }
    function stopAutoRefresh(){
      if(autoRefreshId){ clearInterval(autoRefreshId); autoRefreshId=null; }
    }
    const t=document.getElementById('autoRefreshToggle');
    const i=document.getElementById('autoRefreshInterval');
    t.addEventListener('change',()=>{ if(t.checked){ startAutoRefresh(); } else { stopAutoRefresh(); } });
    i.addEventListener('change',()=>{ if(t.checked){ startAutoRefresh(); } });
  </script>
</body>
</html>