<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$order_id = intval($data['order_id'] ?? 0);
$owner_id = intval($data['owner_id'] ?? 0);

if ($order_id <= 0 || $owner_id <= 0) {
    echo json_encode(["status" => "error", "message" => "Missing order_id or owner_id"]);
    exit;
}

// Verify the order belongs to this owner before deleting
$check = $conn->prepare("SELECT r.id FROM rentals r JOIN items i ON r.item_id = i.id WHERE r.id = ? AND i.owner_id = ?");
$check->bind_param("ii", $order_id, $owner_id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Order not found or access denied"]);
    exit;
}
$check->close();

$del = $conn->prepare("DELETE FROM rentals WHERE id = ?");
$del->bind_param("i", $order_id);

if ($del->execute()) {
    echo json_encode(["status" => "success", "message" => "Order #$order_id deleted"]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}
$del->close();
?>
