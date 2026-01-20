<?php
// Enable Error Reporting for Debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Handle Preflight Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Debug Log Function
function debug_log($message) {
    file_put_contents('debug_log.txt', date('[Y-m-d H:i:s] ') . print_r($message, true) . "\n", FILE_APPEND);
}

debug_log("Request Received");
debug_log($_POST);
debug_log($_FILES);

include 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    debug_log("Invalid Method: " . $_SERVER['REQUEST_METHOD']);
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

// Check for owner_id
if (!isset($_POST['owner_id']) || empty($_POST['owner_id'])) {
    debug_log("Missing Owner ID");
    echo json_encode(["status" => "error", "message" => "Owner ID is required"]);
    exit;
}

$owner_id = intval($_POST['owner_id']);
$name = $_POST['name'] ?? 'Untitled Item';
$category = $_POST['category'] ?? 'General';
$occasion = $_POST['occasion'] ?? 'General';
$quality = $_POST['quality'] ?? 'Good';
$price = floatval($_POST['price'] ?? 0);
$deposit = floatval($_POST['deposit'] ?? 0);
$description = $_POST['description'] ?? '';

// Handle Image Upload
$image_url = '';
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../../../user-dashboard/frontend/public/uploads/';
    
    // Create directory if not exists
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            debug_log("Failed to create directory: " . $uploadDir);
            echo json_encode(["status" => "error", "message" => "Failed to create upload directory"]);
            exit;
        }
    }

    $fileName = 'item_' . time() . '_' . basename($_FILES['image']['name']);
    $targetFile = $uploadDir . $fileName;

    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
        $image_url = 'uploads/' . $fileName;
        debug_log("File uploaded to: " . $targetFile);
    } else {
        debug_log("Move uploaded file failed");
        echo json_encode(["status" => "error", "message" => "Failed to move uploaded file"]);
        exit;
    }
} else {
    $image_url = 'default_item.png'; 
    debug_log("No file uploaded or error: " . ($_FILES['image']['error'] ?? 'Unset'));
}

// Database Insert
try {
    // Check if $conn exists (mysqli) from db.php
    global $conn;
    
    // Capture quantity
    $quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 1;

    if (isset($conn) && $conn instanceof mysqli) {
        $stmt = $conn->prepare("INSERT INTO items (owner_id, name, category, quality, quantity, price_per_day, deposit_amount, description, image_url, occasion, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
        if (!$stmt) {
             throw new Exception("Prepare failed: " . $conn->error);
        }
        // Correct types: i (owner), s (name), s (cat), s (quality), i (quantity), d (price), d (deposit), s (desc), s (img), s (occasion)
        $stmt->bind_param("isssiddsss", $owner_id, $name, $category, $quality, $quantity, $price, $deposit, $description, $image_url, $occasion);
        
        if ($stmt->execute()) {
            debug_log("Item inserted via Mysqli");
            echo json_encode(["status" => "success", "message" => "Item added successfully"]);
        } else {
             throw new Exception("Execute failed: " . $stmt->error);
        }
        $stmt->close();
    } else {
        throw new Exception("Database connection not available.");
    }

} catch (Exception $e) {
    debug_log("Database Error: " . $e->getMessage());
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
