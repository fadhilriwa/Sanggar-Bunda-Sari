<?php
/**
 * Admin V2 API — Payments, Gallery, Testimonials, Contacts, Events, ActivityLog, Users
 * 
 * Usage: ?module=payments|gallery|testimonials|contacts|events|activity_log|users
 * Methods: GET, POST, PUT, DELETE, PATCH
 */
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../db.php';

$module = $_GET['module'] ?? '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

$allowed = ['payments','gallery','testimonials','contacts','events','locations','activity_log','users','stats'];
if (!in_array($module, $allowed)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid module']);
    exit;
}

try {
    $pdo = get_pdo();
    autoCreateTables($pdo);

    if ($module === 'stats') { handleStats($pdo); exit; }
    if ($module === 'activity_log' && $method === 'GET') { handleActivityLog($pdo); exit; }
    if ($module === 'users') { handleUsers($pdo, $method, $id); exit; }

    switch ($method) {
        case 'GET': handleGet($pdo, $module, $id); break;
        case 'POST': handlePost($pdo, $module); break;
        case 'PUT': handlePut($pdo, $module, $id); break;
        case 'DELETE': handleDelete($pdo, $module, $id); break;
        case 'PATCH': handlePatch($pdo, $module, $id, $action); break;
        default: http_response_code(405); echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

function autoCreateTables(PDO $pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS payments (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, student_id INT UNSIGNED NOT NULL, class_id INT UNSIGNED DEFAULT NULL, amount DECIMAL(12,2) DEFAULT 0, payment_date DATE NOT NULL, payment_method ENUM('cash','transfer','qris') DEFAULT 'cash', status ENUM('paid','unpaid','partial') DEFAULT 'unpaid', period VARCHAR(20) DEFAULT NULL, notes TEXT DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS gallery (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, image_url VARCHAR(500) DEFAULT '', category VARCHAR(100) DEFAULT 'Kegiatan', event_date DATE DEFAULT NULL, location VARCHAR(255) DEFAULT NULL, is_active TINYINT(1) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    try { @$pdo->exec("ALTER TABLE gallery ADD COLUMN event_date DATE DEFAULT NULL AFTER category"); } catch(\Throwable $e) {}
    try { @$pdo->exec("ALTER TABLE gallery ADD COLUMN location VARCHAR(255) DEFAULT NULL AFTER event_date"); } catch(\Throwable $e) {}
    $pdo->exec("CREATE TABLE IF NOT EXISTS testimonials (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, parent_name VARCHAR(255) NOT NULL, student_name VARCHAR(255) DEFAULT NULL, rating TINYINT DEFAULT 5, message TEXT NOT NULL, is_visible TINYINT(1) DEFAULT 1, admin_reply TEXT DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS contacts (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) DEFAULT NULL, phone VARCHAR(20) DEFAULT NULL, subject VARCHAR(255) DEFAULT NULL, message TEXT NOT NULL, status ENUM('unread','read','replied') DEFAULT 'unread', admin_reply TEXT DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS events (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, event_date DATE NOT NULL, event_time TIME DEFAULT NULL, end_date DATE DEFAULT NULL, type ENUM('class','event','holiday','meeting') DEFAULT 'event', color VARCHAR(20) DEFAULT '#4f46e5', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS locations (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, address TEXT DEFAULT NULL, phone VARCHAR(30) DEFAULT NULL, map_embed_url TEXT DEFAULT NULL, is_active TINYINT(1) DEFAULT 1, sort_order INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS activity_log (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id INT UNSIGNED DEFAULT NULL, username VARCHAR(50) DEFAULT NULL, action VARCHAR(100) NOT NULL, detail TEXT DEFAULT NULL, ip_address VARCHAR(45) DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    // Ensure students has status column
    try { @$pdo->exec("ALTER TABLE students ADD COLUMN status ENUM('active','inactive') DEFAULT 'active'"); } catch(\Throwable $e) {}
    // Ensure classes has instructor column
    try { @$pdo->exec("ALTER TABLE classes ADD COLUMN instructor VARCHAR(255) DEFAULT NULL"); } catch(\Throwable $e) {}
    // Ensure users has role column
    try { @$pdo->exec("ALTER TABLE users ADD COLUMN role ENUM('admin','staff','keuangan') DEFAULT 'admin' AFTER password"); } catch(\Throwable $e) {}
}

function getInput() {
    $data = json_decode(file_get_contents('php://input'), true);
    return $data ?: $_POST;
}

function logActivity(PDO $pdo, string $action, string $detail = '') {
    try {
        $stmt = $pdo->prepare("INSERT INTO activity_log (username, action, detail, ip_address) VALUES (?, ?, ?, ?)");
        $stmt->execute(['admin', $action, $detail, $_SERVER['REMOTE_ADDR'] ?? '']);
    } catch(Exception $e) {}
}

// ===== STATS =====
function handleStats(PDO $pdo) {
    $stats = [];
    // Monthly registration trend (last 6 months)
    $stmt = $pdo->query("SELECT DATE_FORMAT(registration_date, '%Y-%m') as month, COUNT(*) as count FROM registrations WHERE registration_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) GROUP BY month ORDER BY month");
    $stats['monthly_trend'] = $stmt->fetchAll();
    // Payment stats
    try {
        $stmt = $pdo->query("SELECT status, COUNT(*) as count, SUM(amount) as total FROM payments GROUP BY status");
        $stats['payment_summary'] = $stmt->fetchAll();
    } catch(Exception $e) { $stats['payment_summary'] = []; }
    // Unread contacts
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM contacts WHERE status = 'unread'");
        $stats['unread_contacts'] = (int)$stmt->fetch()['count'];
    } catch(Exception $e) { $stats['unread_contacts'] = 0; }
    // Class capacity
    $stmt = $pdo->query("SELECT c.id, c.name, c.capacity, COUNT(r.id) as enrolled FROM classes c LEFT JOIN registrations r ON c.id = r.class_id GROUP BY c.id ORDER BY enrolled DESC LIMIT 10");
    $stats['class_capacity'] = $stmt->fetchAll();
    echo json_encode(['success' => true, 'data' => $stats]);
}

// ===== ACTIVITY LOG =====
function handleActivityLog(PDO $pdo) {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $stmt = $pdo->prepare("SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?");
    $stmt->execute([$limit]);
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
}

// ===== USERS =====
function handleUsers(PDO $pdo, string $method, ?int $id) {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT id, username, role, created_at FROM users ORDER BY id");
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    } elseif ($method === 'POST') {
        $d = getInput();
        $hash = password_hash($d['password'] ?? 'password123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
        $stmt->execute([trim($d['username'] ?? ''), $hash, $d['role'] ?? 'staff']);
        logActivity($pdo, 'user_created', 'User: ' . ($d['username'] ?? ''));
        echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
    } elseif ($method === 'PUT' && $id) {
        $d = getInput();
        if (!empty($d['password'])) {
            $hash = password_hash($d['password'], PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE users SET username=?, password=?, role=? WHERE id=?");
            $stmt->execute([trim($d['username'] ?? ''), $hash, $d['role'] ?? 'staff', $id]);
        } else {
            $stmt = $pdo->prepare("UPDATE users SET username=?, role=? WHERE id=?");
            $stmt->execute([trim($d['username'] ?? ''), $d['role'] ?? 'staff', $id]);
        }
        echo json_encode(['success' => true]);
    } elseif ($method === 'DELETE' && $id) {
        if ($id === 1) { echo json_encode(['success' => false, 'message' => 'Cannot delete primary admin']); return; }
        $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$id]);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid request']);
    }
}

// ===== GENERIC GET =====
function handleGet(PDO $pdo, string $module, ?int $id) {
    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM `{$module}` WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        echo json_encode(['success' => true, 'data' => $row ?: null]);
    } else {
        $order = 'ORDER BY created_at DESC';
        if ($module === 'events') $order = 'ORDER BY event_date ASC';
        // Add student/class names for payments
        if ($module === 'payments') {
            $stmt = $pdo->query("SELECT p.*, s.name as student_name, c.name as class_name FROM payments p LEFT JOIN students s ON p.student_id = s.id LEFT JOIN classes c ON p.class_id = c.id ORDER BY p.created_at DESC");
        } else {
            $stmt = $pdo->query("SELECT * FROM `{$module}` {$order}");
        }
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    }
}

// ===== GENERIC POST =====
function handlePost(PDO $pdo, string $module) {
    $d = getInput();
    $cols = []; $vals = []; $placeholders = [];
    
    $schema = [
        'payments' => ['student_id','class_id','amount','payment_date','payment_method','status','period','notes'],
        'gallery' => ['title','description','image_url','category','event_date','location','is_active'],
        'testimonials' => ['parent_name','student_name','rating','message','is_visible','admin_reply'],
        'contacts' => ['name','email','phone','subject','message','status'],
        'events' => ['title','description','event_date','event_time','end_date','type','color'],
        'locations' => ['name','address','phone','map_embed_url','is_active','sort_order'],
    ];
    
    foreach (($schema[$module] ?? []) as $col) {
        if (isset($d[$col])) {
            $cols[] = $col; $vals[] = $d[$col]; $placeholders[] = '?';
        }
    }
    
    if (empty($cols)) { echo json_encode(['success' => false, 'message' => 'No data']); return; }
    
    $sql = "INSERT INTO `{$module}` (" . implode(',', $cols) . ") VALUES (" . implode(',', $placeholders) . ")";
    $pdo->prepare($sql)->execute($vals);
    logActivity($pdo, "{$module}_created", json_encode($d));
    echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
}

// ===== GENERIC PUT =====
function handlePut(PDO $pdo, string $module, ?int $id) {
    if (!$id) { echo json_encode(['success' => false, 'message' => 'ID required']); return; }
    $d = getInput();
    $sets = []; $vals = [];
    
    $schema = [
        'payments' => ['student_id','class_id','amount','payment_date','payment_method','status','period','notes'],
        'gallery' => ['title','description','image_url','category','event_date','location','is_active'],
        'testimonials' => ['parent_name','student_name','rating','message','is_visible','admin_reply'],
        'contacts' => ['name','email','phone','subject','message','status','admin_reply'],
        'events' => ['title','description','event_date','event_time','end_date','type','color'],
        'locations' => ['name','address','phone','map_embed_url','is_active','sort_order'],
    ];
    
    foreach (($schema[$module] ?? []) as $col) {
        if (array_key_exists($col, $d)) {
            $sets[] = "{$col} = ?"; $vals[] = $d[$col];
        }
    }
    
    if (empty($sets)) { echo json_encode(['success' => false, 'message' => 'No data']); return; }
    $vals[] = $id;
    $pdo->prepare("UPDATE `{$module}` SET " . implode(',', $sets) . " WHERE id = ?")->execute($vals);
    logActivity($pdo, "{$module}_updated", "ID: {$id}");
    echo json_encode(['success' => true]);
}

// ===== GENERIC DELETE =====
function handleDelete(PDO $pdo, string $module, ?int $id) {
    if (!$id) { echo json_encode(['success' => false, 'message' => 'ID required']); return; }
    $pdo->prepare("DELETE FROM `{$module}` WHERE id = ?")->execute([$id]);
    logActivity($pdo, "{$module}_deleted", "ID: {$id}");
    echo json_encode(['success' => true]);
}

// ===== PATCH (toggle, status change) =====
function handlePatch(PDO $pdo, string $module, ?int $id, string $action) {
    if (!$id) { echo json_encode(['success' => false, 'message' => 'ID required']); return; }
    $d = getInput();
    
    if ($action === 'toggle') {
        $field = $module === 'testimonials' ? 'is_visible' : 'is_active';
        $pdo->prepare("UPDATE `{$module}` SET {$field} = NOT {$field} WHERE id = ?")->execute([$id]);
        echo json_encode(['success' => true]);
    } elseif ($action === 'status') {
        $status = $d['status'] ?? '';
        $pdo->prepare("UPDATE `{$module}` SET status = ? WHERE id = ?")->execute([$status, $id]);
        echo json_encode(['success' => true]);
    } elseif ($action === 'reply') {
        $reply = $d['admin_reply'] ?? '';
        $statusField = $module === 'contacts' ? ", status = 'replied'" : '';
        $pdo->prepare("UPDATE `{$module}` SET admin_reply = ? {$statusField} WHERE id = ?")->execute([$reply, $id]);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}
