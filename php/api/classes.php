<?php
/**
 * Classes API
 * Handles CRUD operations for classes table
 */

// Suppress errors to ensure clean JSON output
error_reporting(0);
ini_set('display_errors', 0);

// Load database connection
require_once __DIR__ . '/../db.php';

// Set JSON headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS request (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Get database connection
try {
    $pdo = get_pdo();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection failed',
        'error' => $e->getMessage()
    ]);
    exit;
}

// GET: Retrieve all classes
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Auto-seed default classes if table is empty
        $countStmt = $pdo->query('SELECT COUNT(*) AS c FROM classes');
        $row = $countStmt->fetch();
        
        if ((int)$row['c'] === 0) {
            $defaults = [
                // === CALISTUNG (TK/PAUD) ===
                ['Calistung — Matematika Dasar', 'Calistung', 'Senin & Rabu 10:00', 15, 150000.00],
                ['Calistung — Bahasa Inggris Dasar', 'Calistung', 'Selasa & Kamis 10:00', 15, 150000.00],
                // === SD — MATEMATIKA ===
                ['Matematika SD Kelas 1-2', 'SD — Matematika', 'Senin 15:00', 20, 200000.00],
                ['Matematika SD Kelas 3-4', 'SD — Matematika', 'Selasa 15:00', 20, 200000.00],
                ['Matematika SD Kelas 5-6', 'SD — Matematika', 'Rabu 15:00', 20, 200000.00],
                // === SD — BAHASA INGGRIS ===
                ['Bahasa Inggris SD Kelas 1-2', 'SD — Bahasa Inggris', 'Kamis 15:00', 20, 200000.00],
                ['Bahasa Inggris SD Kelas 3-4', 'SD — Bahasa Inggris', 'Jumat 15:00', 20, 200000.00],
                ['Bahasa Inggris SD Kelas 5-6', 'SD — Bahasa Inggris', 'Sabtu 09:00', 20, 200000.00],
                // === SMP — MATEMATIKA ===
                ['Matematika SMP Kelas 7', 'SMP — Matematika', 'Senin 16:30', 20, 250000.00],
                ['Matematika SMP Kelas 8', 'SMP — Matematika', 'Selasa 16:30', 20, 250000.00],
                ['Matematika SMP Kelas 9', 'SMP — Matematika', 'Rabu 16:30', 20, 250000.00],
                // === SMP — BAHASA INGGRIS ===
                ['Bahasa Inggris SMP Kelas 7', 'SMP — Bahasa Inggris', 'Kamis 16:30', 20, 250000.00],
                ['Bahasa Inggris SMP Kelas 8', 'SMP — Bahasa Inggris', 'Jumat 16:30', 20, 250000.00],
                ['Bahasa Inggris SMP Kelas 9', 'SMP — Bahasa Inggris', 'Sabtu 11:00', 20, 250000.00],
                // === MELUKIS ===
                ['Melukis — Kelas Anak (5-8 Tahun)', 'Melukis', 'Sabtu 09:00', 15, 180000.00],
                ['Melukis — Kelas Remaja (9-15 Tahun)', 'Melukis', 'Minggu 09:00', 15, 180000.00],
            ];
            
            $insertStmt = $pdo->prepare('
                INSERT INTO classes (name, category, schedule, capacity, price) 
                VALUES (?, ?, ?, ?, ?)
            ');
            
            foreach ($defaults as $class) {
                $insertStmt->execute($class);
            }
        }
        
        // Fetch all classes
        $stmt = $pdo->query('
            SELECT id, name, category, schedule, capacity, price 
            FROM classes 
            ORDER BY id ASC
        ');
        $classes = $stmt->fetchAll();
        echo json_encode($classes);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// POST: Create new class
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON body']);
        exit;
    }

    // Validate required fields
    $required = ['name', 'category', 'schedule', 'capacity', 'price'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || $input[$field] === '') {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
            exit;
        }
    }

    try {
        $stmt = $pdo->prepare('
            INSERT INTO classes (name, category, schedule, capacity, price) 
            VALUES (?, ?, ?, ?, ?)
        ');
        
        $stmt->execute([
            trim($input['name']),
            trim($input['category']),
            trim($input['schedule']),
            (int)$input['capacity'],
            (float)$input['price']
        ]);
        
        echo json_encode([
            'success' => true, 
            'id' => (int)$pdo->lastInsertId(),
            'message' => 'Class created successfully'
        ]);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// PUT: Update existing class
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON body or missing ID']);
        exit;
    }

    $id = (int)$input['id'];
    
    // Validate required fields
    $required = ['name', 'category', 'schedule', 'capacity', 'price'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || $input[$field] === '') {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
            exit;
        }
    }

    try {
        // Check if class exists
        $checkStmt = $pdo->prepare('SELECT id FROM classes WHERE id = ?');
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Class not found']);
            exit;
        }

        // Update class
        $stmt = $pdo->prepare('
            UPDATE classes 
            SET name = ?, category = ?, schedule = ?, capacity = ?, price = ? 
            WHERE id = ?
        ');
        
        $stmt->execute([
            trim($input['name']),
            trim($input['category']),
            trim($input['schedule']),
            (int)$input['capacity'],
            (float)$input['price'],
            $id
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Class updated successfully']);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// DELETE: Remove class
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = isset($input['id']) ? (int)$input['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : null);
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Class ID required']);
        exit;
    }

    try {
        $pdo->beginTransaction();
        
        // Check if class exists
        $checkStmt = $pdo->prepare('SELECT id FROM classes WHERE id = ?');
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Class not found']);
            exit;
        }

        // Delete related registrations first
        $deleteRegStmt = $pdo->prepare('DELETE FROM registrations WHERE class_id = ?');
        $deleteRegStmt->execute([$id]);

        // Delete class
        $deleteStmt = $pdo->prepare('DELETE FROM classes WHERE id = ?');
        $deleteStmt->execute([$id]);

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Class deleted successfully']);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// Method not allowed
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);