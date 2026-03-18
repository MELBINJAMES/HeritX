<?php
require_once 'user-dashboard/backend/config/db.php';
try {
    $stmt = $pdo->query("SELECT id, name, email, role FROM users WHERE role='admin' LIMIT 5");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($rows) === 0) {
        echo "NO ADMIN USERS FOUND\n";
    } else {
        foreach ($rows as $row) {
            echo "ID:{$row['id']} | {$row['name']} | {$row['email']} | {$row['role']}\n";
        }
    }
} catch (Exception $e) {
    echo "DB Error: " . $e->getMessage() . "\n";
}
