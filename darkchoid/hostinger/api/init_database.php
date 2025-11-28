<?php
/**
 * Database Initialization Script
 * Run this ONCE to set up your database
 * Access: https://your-domain.com/hostinger/api/init_database.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Security: Uncomment this after first run to disable the script
// die('Database already initialized. Delete this file or comment out this line.');

$DB_HOST = 'localhost';
$DB_USER = 'u933178595_sundakagetest';
$DB_PASS = '3tH4n0l10%';
$DB_NAME = 'u933178595_konohatest';

echo "<!DOCTYPE html><html><head><title>Database Init</title><style>
body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
.success { color: #0f0; } .error { color: #f00; } .info { color: #0af; }
h1 { color: #ff0; } pre { background: #000; padding: 10px; border: 1px solid #333; }
</style></head><body>";

echo "<h1>🚀 KONOHA Catering - Database Initialization</h1>";

// Test connection
echo "<h2>Step 1: Testing Database Connection</h2>";
$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    echo "<p class='error'>❌ Connection failed: " . $conn->connect_error . "</p>";
    echo "<p class='info'>💡 Check your database credentials in config.php</p>";
    die("</body></html>");
}

echo "<p class='success'>✓ Connected successfully to database '$DB_NAME'</p>";

// Set charset
$conn->set_charset('utf8mb4');
echo "<p class='success'>✓ Charset set to utf8mb4</p>";

// Create table
echo "<h2>Step 2: Creating kv_store Table</h2>";

$createTableSQL = "CREATE TABLE IF NOT EXISTS kv_store (
    k VARCHAR(255) PRIMARY KEY,
    v LONGTEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($createTableSQL)) {
    echo "<p class='success'>✓ Table 'kv_store' created successfully</p>";
} else {
    echo "<p class='error'>❌ Error creating table: " . $conn->error . "</p>";
    die("</body></html>");
}

// Verify table exists
echo "<h2>Step 3: Verifying Table Structure</h2>";

$result = $conn->query("DESCRIBE kv_store");
if ($result) {
    echo "<p class='success'>✓ Table structure verified</p>";
    echo "<pre>";
    while ($row = $result->fetch_assoc()) {
        echo json_encode($row, JSON_PRETTY_PRINT) . "\n";
    }
    echo "</pre>";
} else {
    echo "<p class='error'>❌ Could not describe table: " . $conn->error . "</p>";
}

// Check and add updated_at column if missing
echo "<h2>Step 4: Updating Table Structure</h2>";

$columnsResult = $conn->query("SHOW COLUMNS FROM kv_store");
$columns = [];
while ($row = $columnsResult->fetch_assoc()) {
    $columns[] = $row['Field'];
}

if (!in_array('updated_at', $columns)) {
    echo "<p class='info'>⚠️ Column 'updated_at' missing, adding it...</p>";
    $alterSQL = "ALTER TABLE kv_store ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP";
    if ($conn->query($alterSQL)) {
        echo "<p class='success'>✓ Column 'updated_at' added successfully</p>";
    } else {
        echo "<p class='error'>❌ Failed to add column: " . $conn->error . "</p>";
    }
} else {
    echo "<p class='success'>✓ Column 'updated_at' already exists</p>";
}

// Add index if not exists
echo "<p class='info'>Checking indexes...</p>";
$indexResult = $conn->query("SHOW INDEX FROM kv_store WHERE Key_name = 'idx_updated'");
if ($indexResult->num_rows === 0) {
    if ($conn->query("ALTER TABLE kv_store ADD INDEX idx_updated (updated_at)")) {
        echo "<p class='success'>✓ Index 'idx_updated' added</p>";
    }
} else {
    echo "<p class='success'>✓ Index 'idx_updated' already exists</p>";
}

// Check if table has data
echo "<h2>Step 5: Checking Existing Data</h2>";

$countResult = $conn->query("SELECT COUNT(*) as count FROM kv_store");
$countRow = $countResult->fetch_assoc();
$recordCount = $countRow['count'];

echo "<p class='info'>📊 Current records in database: $recordCount</p>";

if ($recordCount > 0) {
    echo "<h3>Existing Keys:</h3><pre>";
    $keysResult = $conn->query("SELECT k, LENGTH(v) as value_length, updated_at FROM kv_store ORDER BY k");
    while ($row = $keysResult->fetch_assoc()) {
        echo sprintf("%-30s | %10d bytes | %s\n", 
            $row['k'], 
            $row['value_length'], 
            $row['updated_at']
        );
    }
    echo "</pre>";
}

// Test insert
echo "<h2>Step 6: Testing Insert Operation</h2>";

$testKey = 'test_' . time();
$testValue = json_encode(['test' => true, 'timestamp' => time()]);

$stmt = $conn->prepare('INSERT INTO kv_store (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)');
$stmt->bind_param('ss', $testKey, $testValue);

if ($stmt->execute()) {
    echo "<p class='success'>✓ Test insert successful (key: $testKey)</p>";
    
    // Test select
    $stmt2 = $conn->prepare('SELECT v FROM kv_store WHERE k = ?');
    $stmt2->bind_param('s', $testKey);
    $stmt2->execute();
    $result = $stmt2->get_result();
    
    if ($row = $result->fetch_assoc()) {
        echo "<p class='success'>✓ Test select successful</p>";
        echo "<pre>" . htmlspecialchars($row['v']) . "</pre>";
        
        // Clean up test record
        $conn->query("DELETE FROM kv_store WHERE k = '$testKey'");
        echo "<p class='info'>✓ Test record cleaned up</p>";
    }
} else {
    echo "<p class='error'>❌ Test insert failed: " . $stmt->error . "</p>";
}

// Final summary
echo "<h2>✅ Initialization Complete!</h2>";
echo "<p class='success'>Your database is ready to use.</p>";
echo "<p class='info'><strong>Next Steps:</strong></p>";
echo "<ol>";
echo "<li>Delete or disable this init_database.php file for security</li>";
echo "<li>Test saving data from your admin panel</li>";
echo "<li>Check if data persists across browser refreshes</li>";
echo "<li>Test from different devices/browsers</li>";
echo "</ol>";

echo "<h3>📝 API Endpoints:</h3>";
echo "<ul>";
echo "<li>Save: <code>/hostinger/api/save.php</code></li>";
echo "<li>Get: <code>/hostinger/api/get.php?key=YOUR_KEY</code></li>";
echo "<li>Session: <code>/hostinger/api/session.php</code></li>";
echo "</ul>";

echo "<h3>🔍 Debugging Tips:</h3>";
echo "<ul>";
echo "<li>Check error.log file in /hostinger/api/ directory</li>";
echo "<li>Use browser console to see sync messages</li>";
echo "<li>Use <code>window.konohaSync.syncAll()</code> in console to force sync</li>";
echo "<li>Check Network tab in DevTools for API call failures</li>";
echo "</ul>";

$conn->close();

echo "<p style='margin-top: 40px; padding: 20px; background: #333; border: 2px solid #ff0;'>";
echo "<strong style='color: #ff0;'>⚠️ SECURITY WARNING:</strong><br>";
echo "Comment out or delete this file after successful initialization!";
echo "</p>";

echo "</body></html>";