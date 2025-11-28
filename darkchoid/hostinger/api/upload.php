<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
  }

  $category = isset($_POST['category']) ? $_POST['category'] : '';
  $allowed = ['menu', 'payment-proof', 'content'];
  if (!in_array($category, $allowed, true)) {
    echo json_encode(['ok' => false, 'error' => 'Kategori tidak valid']);
    exit;
  }

  if (!isset($_FILES['file'])) {
    echo json_encode(['ok' => false, 'error' => 'File tidak ditemukan']);
    exit;
  }

  $file = $_FILES['file'];
  if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['ok' => false, 'error' => 'Gagal upload (error code ' . $file['error'] . ')']);
    exit;
  }

  // Validate size (max 5MB)
  if ($file['size'] > 5 * 1024 * 1024) {
    echo json_encode(['ok' => false, 'error' => 'File terlalu besar (max 5MB)']);
    exit;
  }

  // Validate MIME type
  $finfo = new finfo(FILEINFO_MIME_TYPE);
  $mime = $finfo->file($file['tmp_name']);
  $validMimes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
  if (!array_key_exists($mime, $validMimes)) {
    echo json_encode(['ok' => false, 'error' => 'Hanya gambar (JPG, PNG, GIF, WEBP) yang diizinkan']);
    exit;
  }

  // Prepare directories
  $baseDir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads';
  $targetDir = $baseDir . DIRECTORY_SEPARATOR . $category;
  if (!is_dir($baseDir)) {
    mkdir($baseDir, 0775, true);
  }
  if (!is_dir($targetDir)) {
    mkdir($targetDir, 0775, true);
  }

  // Sanitize filename and make unique
  $ext = $validMimes[$mime];
  $name = pathinfo($file['name'], PATHINFO_FILENAME);
  $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '-', $name);
  $filename = $safeName . '-' . date('YmdHis') . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
  $targetPath = $targetDir . DIRECTORY_SEPARATOR . $filename;

  if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    echo json_encode(['ok' => false, 'error' => 'Tidak bisa menyimpan file']);
    exit;
  }

  // Build public URL path (relative)
  $publicPath = '/uploads/' . $category . '/' . $filename;

  echo json_encode(['ok' => true, 'path' => $publicPath, 'mime' => $mime, 'size' => $file['size']]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Server error: ' . $e->getMessage()]);
}
?>
