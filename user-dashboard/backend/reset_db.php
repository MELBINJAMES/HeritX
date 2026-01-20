<?php
require_once 'config/db.php';

try {
    // Disable FK checks to allow dropping referenced table
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("DROP TABLE IF EXISTS items");
    // Re-enable FK checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    echo "Items table dropped successfully (referenced tables preserved, but links broken until re-seed).";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
