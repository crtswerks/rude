<?php
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

require __DIR__.'/config.php';

$key = isset($_GET['key']) ? trim($_GET['key']) : '';

if ($key === '') {
    error_log("Missing key in get request");
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'Key is required'
    ]);
    exit;
}

try {
    $stmt = $conn->prepare('SELECT v FROM kv_store WHERE k = ?');
    
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        throw new Exception("Database prepare failed");
    }
    
    $stmt->bind_param('s', $key);
    
    if (!$stmt->execute()) {
        error_log("Execute failed for key '$key': " . $stmt->error);
        throw new Exception("Database execute failed");
    }
    
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            'ok' => true,
            'value' => $row['v']
        ]);
    } else {
        echo json_encode([
            'ok' => true,
            'value' => null
        ]);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    error_log("Get error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}