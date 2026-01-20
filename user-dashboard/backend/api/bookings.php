<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config/db.php';

$user_id = 1; // Mock User ID

try {
    $stmt = $pdo->prepare("
        SELECT b.*, i.name as item_name 
        FROM bookings b 
        JOIN items i ON b.item_id = i.id 
        WHERE b.user_id = ? 
        ORDER BY b.created_at DESC
    ");
    $stmt->execute([$user_id]);
    echo json_encode($stmt->fetchAll());
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
