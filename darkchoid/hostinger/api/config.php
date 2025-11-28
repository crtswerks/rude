<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database credentials
$DB_HOST = 'localhost';
$DB_USER = 'u933178595_sundakagetest';
$DB_PASS = '3tH4n0l10%';
$DB_NAME = 'u933178595_konohatest';

// Create connection with error handling
$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false,
        'error' => 'Database connection failed'
    ]);
    exit;
}

$conn->set_charset('utf8mb4');

// Create table if not exists with proper error handling
$createTableSQL = "CREATE TABLE IF NOT EXISTS kv_store (
    k VARCHAR(255) PRIMARY KEY,
    v LONGTEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if (!$conn->query($createTableSQL)) {
    error_log("Table creation failed: " . $conn->error);
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false,
        'error' => 'Table creation failed: ' . $conn->error
    ]);
    exit;
}

// Verify table exists
$tableCheck = $conn->query("SHOW TABLES LIKE 'kv_store'");
if ($tableCheck->num_rows === 0) {
    error_log("Table kv_store does not exist after creation attempt");
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false,
        'error' => 'Table verification failed'
    ]);
    exit;
}

// Start session
session_start();