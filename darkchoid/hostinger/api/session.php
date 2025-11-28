<?php
header('Content-Type: application/json');
require __DIR__.'/config.php';
$logged = isset($_SESSION['admin']) && $_SESSION['admin'] === true;
echo json_encode(['ok'=>true,'loggedIn'=>$logged]);