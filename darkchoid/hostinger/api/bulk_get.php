<?php
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

require __DIR__.'/config.php';

// Get keys from query string (comma-separated)
$keysParam = isset($_GET['keys']) ? $_GET['keys'] : '';

if ($keysParam === '') {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'Keys parameter is required'
    ]);
    exit;
}

$keys = array_map('trim', explode(',', $keysParam));

if (count($keys) === 0) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'No keys provided'
    ]);
    exit;
}

try {
    // Prepare placeholders for IN clause
    $placeholders = implode(',', array_fill(0, count($keys), '?'));
    
    $stmt = $conn->prepare("SELECT k, v FROM kv_store WHERE k IN ($placeholders)");
    
    if (!$stmt) {
        throw new Exception("Database prepare failed: " . $conn->error);
    }
    
    // Bind parameters dynamically
    $types = str_repeat('s', count($keys));
    $stmt->bind_param($types, ...$keys);
    
    if (!$stmt->execute()) {
        throw new Exception("Database execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    // Build result object
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[$row['k']] = $row['v'];
    }
    
    // Add null for keys not found
    foreach ($keys as $key) {
        if (!isset($data[$key])) {
            $data[$key] = null;
        }
    }
    
    echo json_encode([
        'ok' => true,
        'data' => $data,
        'count' => count(array_filter($data))
    ]);
    
    $stmt->close();
    
} catch (Exception $e) {
    error_log("Bulk get error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}