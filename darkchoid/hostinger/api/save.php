<?php
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

require __DIR__.'/config.php';

// Get and validate input
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("JSON decode error: " . json_last_error_msg() . " | Raw: " . substr($raw, 0, 200));
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'Invalid JSON: ' . json_last_error_msg()
    ]);
    exit;
}

$key = isset($data['key']) ? trim($data['key']) : '';
$value = isset($data['value']) ? $data['value'] : null;

// Validate input
if ($key === '' || $value === null) {
    error_log("Missing key or value in save request");
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'Key and value are required'
    ]);
    exit;
}

// Validate key length
if (strlen($key) > 255) {
    error_log("Key too long: " . $key);
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'Key too long (max 255 characters)'
    ]);
    exit;
}

// Ensure value is string
if (!is_string($value)) {
    $value = json_encode($value);
}

try {
    $stmt = $conn->prepare('INSERT INTO kv_store (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)');
    
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        throw new Exception("Database prepare failed");
    }
    
    $stmt->bind_param('ss', $key, $value);
    
    if (!$stmt->execute()) {
        error_log("Execute failed for key '$key': " . $stmt->error);
        throw new Exception("Database execute failed");
    }
    
    $stmt->close();
    
    echo json_encode([
        'ok' => true,
        'key' => $key
    ]);
    
} catch (Exception $e) {
    error_log("Save error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}