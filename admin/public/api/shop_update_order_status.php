<?php
// Enable Error Reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$order_id = intval($data['order_id'] ?? 0);
$status = $data['status'] ?? '';
$owner_id = intval($data['owner_id'] ?? 0);

if ($order_id <= 0 || empty($status) || $owner_id <= 0) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

$allowed_statuses = ['pending', 'active', 'completed', 'cancelled'];
if (!in_array($status, $allowed_statuses)) {
    echo json_encode(["status" => "error", "message" => "Invalid status value"]);
    exit;
}

if (isset($conn) && $conn instanceof mysqli) {
    // 1. Verify that the order belongs to an item owned by this owner
    $sql = "SELECT r.id FROM rentals r JOIN items i ON r.item_id = i.id WHERE r.id = ? AND i.owner_id = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        exit;
    }

    $stmt->bind_param("ii", $order_id, $owner_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "Order not found or access denied"]);
        $stmt->close();
        exit;
    }
    $stmt->close();

    // 2. Update the status
    $updateSql = "UPDATE rentals SET status = ? WHERE id = ?";
    $updateStmt = $conn->prepare($updateSql);
    
    if (!$updateStmt) {
        echo json_encode(["status" => "error", "message" => "Prepare update failed: " . $conn->error]);
        exit;
    }

    $updateStmt->bind_param("si", $status, $order_id);
    
    if ($updateStmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Order updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update database: " . $updateStmt->error]);
    }
    $updateStmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Database connection error"]);
}

$conn->close();
?>
