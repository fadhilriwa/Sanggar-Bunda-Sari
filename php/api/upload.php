<?php
/**
 * File Upload API
 * Handles image uploads for gallery, banners, etc.
 * Returns the URL path of the uploaded file.
 */
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST only']);
    exit;
}

// Upload directory
$uploadDir = __DIR__ . '/../../uploads/';
$webPath = '../uploads/';

// Create directory if not exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Check if file was uploaded
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errors = [
        UPLOAD_ERR_INI_SIZE => 'File terlalu besar (max server)',
        UPLOAD_ERR_FORM_SIZE => 'File terlalu besar',
        UPLOAD_ERR_PARTIAL => 'Upload tidak lengkap',
        UPLOAD_ERR_NO_FILE => 'Tidak ada file',
        UPLOAD_ERR_NO_TMP_DIR => 'Folder temp tidak ada',
        UPLOAD_ERR_CANT_WRITE => 'Gagal menulis file',
    ];
    $errCode = $_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE;
    echo json_encode(['success' => false, 'message' => $errors[$errCode] ?? 'Upload gagal']);
    exit;
}

$file = $_FILES['file'];
$maxSize = 5 * 1024 * 1024; // 5MB
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
$allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

// Validate size
if ($file['size'] > $maxSize) {
    echo json_encode(['success' => false, 'message' => 'File terlalu besar. Maksimal 5MB.']);
    exit;
}

// Validate type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    echo json_encode(['success' => false, 'message' => 'Tipe file tidak diizinkan. Hanya JPG, PNG, GIF, WebP, SVG.']);
    exit;
}

// Validate extension
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExts)) {
    echo json_encode(['success' => false, 'message' => 'Ekstensi file tidak diizinkan.']);
    exit;
}

// Generate unique filename
$category = $_POST['category'] ?? 'general';
$safeCategory = preg_replace('/[^a-zA-Z0-9_-]/', '', $category);
$filename = $safeCategory . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;

$targetPath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    echo json_encode([
        'success' => true,
        'url' => $webPath . $filename,
        'filename' => $filename,
        'size' => $file['size'],
        'type' => $mimeType,
        'message' => 'Upload berhasil'
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan file.']);
}
