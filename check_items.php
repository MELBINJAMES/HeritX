<?php
require_once 'c:/xampp/htdocs/HertiX/user-dashboard/backend/config/db.php';

try {
    $stmt = $pdo->query("SELECT * FROM items");
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Total Items Found: " . count($items) . "\n";
    if (count($items) > 0) {
        echo "First item sample:\n";
        print_r($items[0]);
    } else {
        echo "The items table is empty.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
