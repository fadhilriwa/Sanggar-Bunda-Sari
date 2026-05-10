<?php
/**
 * CMS API — Banners, Promos, Announcements
 * Sanggar Bunda Sari
 * 
 * Endpoints:
 *   GET    ?type=banners|promos|announcements          — List all (public: active only)
 *   GET    ?type=banners&all=1                          — List all (admin: include inactive)
 *   POST   ?type=banners                                — Create
 *   PUT    ?type=banners&id=X                            — Update
 *   DELETE ?type=banners&id=X                            — Delete
 *   PATCH  ?type=banners&id=X&action=toggle              — Toggle active
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../db.php';

$type = $_GET['type'] ?? '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$action = $_GET['action'] ?? '';
$showAll = isset($_GET['all']) && $_GET['all'] == '1';

// Validate type
$allowedTypes = ['banners', 'promos', 'announcements'];
if (!in_array($type, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid type. Must be: banners, promos, or announcements']);
    exit;
}

try {
    $pdo = get_pdo();
    
    // === Auto-create CMS tables if they don't exist ===
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS banners (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            subtitle VARCHAR(500) DEFAULT NULL,
            image_url VARCHAR(500) DEFAULT NULL,
            link_url VARCHAR(500) DEFAULT NULL,
            is_active TINYINT(1) DEFAULT 1,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS promos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT NULL,
            discount_text VARCHAR(100) DEFAULT NULL,
            image_url VARCHAR(500) DEFAULT NULL,
            start_date DATE DEFAULT NULL,
            end_date DATE DEFAULT NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS announcements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type ENUM('info','warning','success') DEFAULT 'info',
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    // === End auto-create ===
    
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            handleGet($pdo, $type, $showAll);
            break;
        case 'POST':
            handlePost($pdo, $type);
            break;
        case 'PUT':
            if (!$id) { error(400, 'ID is required for update'); }
            handlePut($pdo, $type, $id);
            break;
        case 'DELETE':
            if (!$id) { error(400, 'ID is required for delete'); }
            handleDelete($pdo, $type, $id);
            break;
        case 'PATCH':
            if (!$id) { error(400, 'ID is required'); }
            if ($action === 'toggle') {
                handleToggle($pdo, $type, $id);
            } else {
                error(400, 'Invalid PATCH action');
            }
            break;
        default:
            error(405, 'Method not allowed');
    }
} catch (Exception $e) {
    error(500, 'Server error: ' . $e->getMessage());
}

// ========================
// HANDLERS
// ========================

function handleGet(PDO $pdo, string $type, bool $showAll): void {
    $where = $showAll ? '' : ' WHERE is_active = 1';
    
    // For promos, also filter by date if not admin
    if ($type === 'promos' && !$showAll) {
        $where = " WHERE is_active = 1 AND (start_date IS NULL OR start_date <= CURDATE()) AND (end_date IS NULL OR end_date >= CURDATE())";
    }
    
    $order = $type === 'banners' ? ' ORDER BY sort_order ASC, created_at DESC' : ' ORDER BY created_at DESC';
    
    $stmt = $pdo->query("SELECT * FROM `{$type}`{$where}{$order}");
    $rows = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'data' => $rows, 'count' => count($rows)]);
}

function handlePost(PDO $pdo, string $type): void {
    $data = getInput();
    
    switch ($type) {
        case 'banners':
            $stmt = $pdo->prepare("INSERT INTO banners (title, subtitle, image_url, link_url, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['title'] ?? '',
                $data['subtitle'] ?? null,
                $data['image_url'] ?? null,
                $data['link_url'] ?? null,
                $data['is_active'] ?? 1,
                $data['sort_order'] ?? 0
            ]);
            break;
            
        case 'promos':
            $stmt = $pdo->prepare("INSERT INTO promos (title, description, discount_text, image_url, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['title'] ?? '',
                $data['description'] ?? null,
                $data['discount_text'] ?? null,
                $data['image_url'] ?? null,
                $data['start_date'] ?? null,
                $data['end_date'] ?? null,
                $data['is_active'] ?? 1
            ]);
            break;
            
        case 'announcements':
            $stmt = $pdo->prepare("INSERT INTO announcements (title, message, type, is_active) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $data['title'] ?? '',
                $data['message'] ?? '',
                $data['type'] ?? 'info',
                $data['is_active'] ?? 1
            ]);
            break;
    }
    
    $id = $pdo->lastInsertId();
    echo json_encode(['success' => true, 'id' => (int)$id, 'message' => ucfirst($type) . ' created successfully']);
}

function handlePut(PDO $pdo, string $type, int $id): void {
    $data = getInput();
    
    switch ($type) {
        case 'banners':
            $stmt = $pdo->prepare("UPDATE banners SET title=?, subtitle=?, image_url=?, link_url=?, is_active=?, sort_order=? WHERE id=?");
            $stmt->execute([
                $data['title'] ?? '',
                $data['subtitle'] ?? null,
                $data['image_url'] ?? null,
                $data['link_url'] ?? null,
                $data['is_active'] ?? 1,
                $data['sort_order'] ?? 0,
                $id
            ]);
            break;
            
        case 'promos':
            $stmt = $pdo->prepare("UPDATE promos SET title=?, description=?, discount_text=?, image_url=?, start_date=?, end_date=?, is_active=? WHERE id=?");
            $stmt->execute([
                $data['title'] ?? '',
                $data['description'] ?? null,
                $data['discount_text'] ?? null,
                $data['image_url'] ?? null,
                $data['start_date'] ?? null,
                $data['end_date'] ?? null,
                $data['is_active'] ?? 1,
                $id
            ]);
            break;
            
        case 'announcements':
            $stmt = $pdo->prepare("UPDATE announcements SET title=?, message=?, type=?, is_active=? WHERE id=?");
            $stmt->execute([
                $data['title'] ?? '',
                $data['message'] ?? '',
                $data['type'] ?? 'info',
                $data['is_active'] ?? 1,
                $id
            ]);
            break;
    }
    
    echo json_encode(['success' => true, 'message' => ucfirst($type) . ' updated successfully']);
}

function handleDelete(PDO $pdo, string $type, int $id): void {
    $stmt = $pdo->prepare("DELETE FROM `{$type}` WHERE id = ?");
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() === 0) {
        error(404, 'Item not found');
    }
    
    echo json_encode(['success' => true, 'message' => ucfirst($type) . ' deleted successfully']);
}

function handleToggle(PDO $pdo, string $type, int $id): void {
    $stmt = $pdo->prepare("UPDATE `{$type}` SET is_active = NOT is_active WHERE id = ?");
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() === 0) {
        error(404, 'Item not found');
    }
    
    // Get updated state
    $stmt = $pdo->prepare("SELECT is_active FROM `{$type}` WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    
    echo json_encode(['success' => true, 'is_active' => (bool)$row['is_active'], 'message' => 'Status updated']);
}

// ========================
// HELPERS
// ========================

function getInput(): array {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (!$data) {
        $data = $_POST;
    }
    return $data;
}

function error(int $code, string $message): void {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}
