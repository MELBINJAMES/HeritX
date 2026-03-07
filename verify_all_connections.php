<?php
header('Content-Type: application/json');

$results = [
    'main_db' => false,
    'admin_db' => false,
    'tables_exist' => []
];

// Test Main DB Connection
try {
    include_once 'public/api/db.php';
    if ($conn) {
        $results['main_db'] = true;
        $res = $conn->query("SHOW TABLES");
        while ($row = $res->fetch_array()) {
            $results['tables_exist'][] = $row[0];
        }
    }
} catch (Exception $e) {
    $results['main_db_error'] = $e->getMessage();
}

// Test Admin DB Connection
try {
    include_once 'admin/public/api/db.php';
    if ($conn) {
        $results['admin_db'] = true;
    }
} catch (Exception $e) {
    $results['admin_db_error'] = $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>
