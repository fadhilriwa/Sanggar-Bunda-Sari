<?php
/**
 * Apriori Analysis API
 * Returns frequent itemsets and association rules for dashboard display
 */

error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../apriori.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $pdo = get_pdo();
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

try {
    // Get all registration transactions
    $sql = 'SELECT r.student_id, GROUP_CONCAT(r.class_id ORDER BY r.class_id) as class_ids
            FROM registrations r
            GROUP BY r.student_id
            HAVING COUNT(r.class_id) > 0';
    
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();
    
    // Transform to transaction format
    $transactions = [];
    foreach ($rows as $row) {
        $classIds = array_map('intval', explode(',', $row['class_ids']));
        if (count($classIds) > 0) {
            $transactions[] = $classIds;
        }
    }
    
    // Get class names for display
    $classNames = [];
    $classStmt = $pdo->query('SELECT id, name, category FROM classes');
    while ($class = $classStmt->fetch()) {
        $classNames[$class['id']] = [
            'name' => $class['name'],
            'category' => $class['category']
        ];
    }
    
    // Not enough data
    if (count($transactions) < 2) {
        echo json_encode([
            'success' => true,
            'message' => 'Minimal 2 transaksi diperlukan untuk analisis',
            'total_transactions' => count($transactions),
            'frequent_itemsets' => [],
            'association_rules' => [],
            'popular_combinations' => []
        ]);
        exit;
    }
    
    // Run Apriori with lower thresholds for small datasets
    $minSupport = max(0.1, 1 / count($transactions)); // At least 1 occurrence
    $minConfidence = 0.3;
    
    $apriori = new AprioriAlgorithm($transactions, $minSupport, $minConfidence);
    $frequentItemsets = $apriori->generateFrequentItemsets();
    $rules = $apriori->generateAssociationRules($frequentItemsets);
    
    // Format frequent itemsets for display
    $formattedItemsets = [];
    foreach ($frequentItemsets as $level => $itemsets) {
        if ($level >= 2) { // Only show combinations (2+ items)
            foreach ($itemsets as $itemset) {
                $names = array_map(function($id) use ($classNames) {
                    return isset($classNames[$id]) ? $classNames[$id]['name'] : "Kelas $id";
                }, $itemset['items']);
                
                $formattedItemsets[] = [
                    'items' => $itemset['items'],
                    'names' => $names,
                    'support' => round($itemset['support'] * 100, 1),
                    'count' => $itemset['count']
                ];
            }
        }
    }
    
    // Sort by support descending
    usort($formattedItemsets, function($a, $b) {
        return $b['support'] <=> $a['support'];
    });
    
    // Format association rules for display
    $formattedRules = [];
    foreach (array_slice($rules, 0, 10) as $rule) { // Top 10 rules
        $antecedentNames = array_map(function($id) use ($classNames) {
            return isset($classNames[$id]) ? $classNames[$id]['name'] : "Kelas $id";
        }, $rule['antecedent']);
        
        $consequentNames = array_map(function($id) use ($classNames) {
            return isset($classNames[$id]) ? $classNames[$id]['name'] : "Kelas $id";
        }, $rule['consequent']);
        
        $formattedRules[] = [
            'antecedent' => $rule['antecedent'],
            'antecedent_names' => $antecedentNames,
            'consequent' => $rule['consequent'],
            'consequent_names' => $consequentNames,
            'support' => round($rule['support'] * 100, 1),
            'confidence' => round($rule['confidence'] * 100, 1),
            'lift' => round($rule['lift'], 2)
        ];
    }
    
    echo json_encode([
        'success' => true,
        'total_transactions' => count($transactions),
        'min_support' => round($minSupport * 100, 1),
        'min_confidence' => round($minConfidence * 100, 1),
        'frequent_itemsets' => array_slice($formattedItemsets, 0, 5), // Top 5
        'association_rules' => $formattedRules,
        'class_names' => $classNames
    ]);
    
} catch (Throwable $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
