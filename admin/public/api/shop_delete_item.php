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

include 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->item_id) || !isset($data->owner_id)) {
    echo json_encode(["status" => "error", "message" => "Item ID and Owner ID are required"]);
    exit;
}

$item_id = intval($data->item_id);
$owner_id = intval($data->owner_id);

// Verify ownership and delete
// We use a prepared statement to ensure the user can only delete their own item
$stmt = $conn->prepare("DELETE FROM items WHERE id = ? AND owner_id = ?");
$stmt->bind_param("ii", $item_id, $owner_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["status" => "success", "message" => "Item deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Item not found or permission denied"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Database error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
