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

function debug_log($message) {
    file_put_contents('debug_log.txt', date('[Y-m-d H:i:s] ') . print_r($message, true) . "\n", FILE_APPEND);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

$item_id = intval($_POST['item_id'] ?? 0);
$owner_id = intval($_POST['owner_id'] ?? 0);

if ($item_id <= 0 || $owner_id <= 0) {
    echo json_encode(["status" => "error", "message" => "Item ID and Owner ID are required"]);
    exit;
}

$name = $_POST['name'] ?? '';
$category = $_POST['category'] ?? '';
$quality = $_POST['quality'] ?? 'Good';
$occasion = $_POST['occasion'] ?? 'General';
$quantity = intval($_POST['quantity'] ?? 1);
$price = floatval($_POST['price'] ?? 0);
$deposit = floatval($_POST['deposit'] ?? 0);
$description = $_POST['description'] ?? '';

// Image Upload Logic
$image_clause = "";
// name, category, quality, quantity, price, deposit, description, occasion, owner_id, item_id
$bind_types = "sssiddssii"; 
$bind_params = [$name, $category, $quality, $quantity, $price, $deposit, $description, $occasion, $owner_id, $item_id];

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../../../user-dashboard/frontend/public/uploads/';
    if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
    
    $fileName = 'item_' . time() . '_' . basename($_FILES['image']['name']);
    $targetFile = $uploadDir . $fileName;
    
    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
        $image_url = 'uploads/' . $fileName;
        $image_clause = ", image_url = ?";
        
        // Insert image_url into bind params before IDs
        // New order: name, category, quality, quantity, price, deposit, description, image_url, occasion, owner_id, item_id
        $bind_types = "sssiddsssii"; 
        array_splice($bind_params, 7, 0, $image_url);
    }
}

// Update Query
// Verify ownership first implicitly by WHERE clause
$sql = "UPDATE items SET name=?, category=?, quality=?, quantity=?, price_per_day=?, deposit_amount=?, description=? $image_clause, occasion=? WHERE owner_id=? AND id=?";

if (isset($conn) && $conn instanceof mysqli) {
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        exit;
    }
    
    $stmt->bind_param($bind_types, ...$bind_params);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows >= 0) {
            echo json_encode(["status" => "success", "message" => "Item updated successfully"]);
        } else {
             // affected_rows can be 0 if no changes made, but query success
             // If implicit ownership check failed (id exists but not for this owner), rows would be 0 too.
             // Usually acceptable to say success.
             echo json_encode(["status" => "success", "message" => "Item updated (or no changes detected)"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Update failed: " . $stmt->error]);
    }
    $stmt->close();
} else {
    // PDO Fallback (omitted for brevity as primary is mysqli now, but good to keep in mind)
    echo json_encode(["status" => "error", "message" => "Database connection error (PDO not implemented for update)"]);
}

$conn->close();
?>
