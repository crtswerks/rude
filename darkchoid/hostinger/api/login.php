<?php
header('Content-Type: application/json');
require __DIR__.'/config.php';
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$u = isset($data['username']) ? $data['username'] : '';
$p = isset($data['password']) ? $data['password'] : '';
if ($u === 'sundakage' && $p === 'K0n0h4m4ru17!') { $_SESSION['admin']=true; echo json_encode(['ok'=>true]); } else { http_response_code(401); echo json_encode(['ok'=>false]); }
