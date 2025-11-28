<?php
header('Content-Type: text/html; charset=UTF-8');
require __DIR__.'/config.php';
if (session_status() === PHP_SESSION_NONE) { session_start(); }
if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
  http_response_code(404);
  exit;
}
$root = dirname(__DIR__, 2);
$file = $root . DIRECTORY_SEPARATOR . 'admin.html';
if (!is_file($file)) {
  http_response_code(404);
  exit;
}
$html = file_get_contents($file);
if ($html === false) {
  http_response_code(404);
  exit;
}

// Extract content between <main> opening and </body>
preg_match('/<main[^>]*>(.*?)<\/body>/s', $html, $matches);
if (!isset($matches[1])) {
  http_response_code(404);
  exit;
}

$content = $matches[1];

// Remove the closing </main> tag and footer
$content = preg_replace('/<\/main>.*?<\/html>/s', '', $content);

echo $content;
?>