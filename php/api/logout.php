<?php
/**
 * Logout API
 */

error_reporting(0);
ini_set('display_errors', 0);

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_destroy();

echo json_encode(['success' => true, 'message' => 'Logout berhasil']);
