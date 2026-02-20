<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config/db.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    echo json_encode(["error" => "Invalid User ID"]);
    exit;
}

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
