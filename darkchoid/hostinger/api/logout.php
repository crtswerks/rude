<?php
header('Content-Type: application/json');
require __DIR__.'/config.php';
$_SESSION = [];
if (session_id()) { session_destroy(); }
echo json_encode(['ok'=>true]);