<?php
/**
 * Recommendations API - Apriori-based class recommendations
 */

// Suppress errors to ensure clean JSON
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../apriori.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

try {
    $pdo = get_pdo();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Support both 'selected_classes' and 'classes' keys for flexibility
$selectedClasses = [];
if (isset($input['selected_classes']) && is_array($input['selected_classes'])) {
    $selectedClasses = array_map('intval', $input['selected_classes']);
} elseif (isset($input['classes']) && is_array($input['classes'])) {
    $selectedClasses = array_map('intval', $input['classes']);
}

if (empty($selectedClasses)) {
    echo json_encode(['success' => true, 'recommendations' => []]);
    exit;
}

try {
    // Get all registration transactions (NO status column - fixed!)
    $sql = 'SELECT r.student_id, GROUP_CONCAT(r.class_id ORDER BY r.class_id) as class_ids
            FROM registrations r
            GROUP BY r.student_id
            HAVING COUNT(r.class_id) > 0';
    
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();
    
    // Transform to transaction format for Apriori
    $transactions = [];
    foreach ($rows as $row) {
        $classIds = array_map('intval', explode(',', $row['class_ids']));
        if (count($classIds) > 0) {
            $transactions[] = $classIds;
        }
    }
    
    // Not enough data
    if (count($transactions) < 3) {
        echo json_encode([
            'success' => true,
            'recommendations' => [],
            'message' => 'Data transaksi masih kurang (minimum 3 transaksi)'
        ]);
        exit;
    }
    
    // Initialize Apriori
    $minSupport = isset($input['min_support']) ? (float)$input['min_support'] : 0.2;
    $minConfidence = isset($input['min_confidence']) ? (float)$input['min_confidence'] : 0.4;
    
    $apriori = new AprioriAlgorithm($transactions, $minSupport, $minConfidence);
    $recommendations = $apriori->getRecommendations($selectedClasses);
    
    // Get class details
    $recommendationsWithDetails = [];
    foreach ($recommendations as $rec) {
        $classId = $rec['class_id'];
        $stmt = $pdo->prepare('SELECT id, name, category, schedule, capacity, price FROM classes WHERE id = ?');
        $stmt->execute([$classId]);
        $class = $stmt->fetch();
        
        if ($class) {
            $recommendationsWithDetails[] = [
                'class_id' => $class['id'],
                'class_name' => $class['name'],
                'category' => $class['category'],
                'schedule' => $class['schedule'],
                'price' => (float)$class['price'],
                'confidence' => round($rec['confidence'] * 100, 2),
                'support' => round($rec['support'] * 100, 2)
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'recommendations' => $recommendationsWithDetails
    ]);
    
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}