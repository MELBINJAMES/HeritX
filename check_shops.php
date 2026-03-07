<?php
require_once 'user-dashboard/backend/config/db.php';
$stmt = $pdo->query("SELECT id, name, role, latitude, longitude FROM users WHERE role = 'Shop Owner'");
$shops = $stmt->fetchAll(PDO::FETCH_ASSOC);

$stmt2 = $pdo->query("SELECT id, owner_id, is_approved FROM items");
$items = $stmt2->fetchAll(PDO::FETCH_ASSOC);

echo "SHOPS:\n";
print_r($shops);

echo "\nITEMS:\n";
print_r($items);
?>
