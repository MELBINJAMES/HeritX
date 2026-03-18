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
$item_condition = $_POST['item_condition'] ?? 'Good';
$quality = $item_condition; 
$price = floatval($_POST['price'] ?? 0);
$deposit = floatval($_POST['deposit'] ?? 0);
$description = $_POST['description'] ?? '';
$dos = $_POST['dos'] ?? '';
$donts = $_POST['donts'] ?? '';
$quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 1;

// Server-side Validation
if (strlen($name) < 3) {
    echo json_encode(["status" => "error", "message" => "Product Name must be at least 3 characters"]);
    exit;
}
if ($quantity < 1) {
    echo json_encode(["status" => "error", "message" => "Quantity must be at least 1"]);
    exit;
}
if ($price <= 0) {
    echo json_encode(["status" => "error", "message" => "Daily Rent must be positive"]);
    exit;
}
if ($deposit < $price) {
    echo json_encode(["status" => "error", "message" => "Deposit amount must be equal to or greater than Daily Rent"]);
    exit;
}
if (strlen($description) < 10) {
    echo json_encode(["status" => "error", "message" => "Description must be at least 10 characters"]);
    exit;
}

// Handle Image Upload
$image_url = '';
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../../../uploads/';
    
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
    // Basic validation requires image for new items
    echo json_encode(["status" => "error", "message" => "Image is required"]);
    exit;
}

// Database Insert
try {
    global $conn;
    
    if (isset($conn) && $conn instanceof mysqli) {
        // Insert into item_condition instead of quality, and is_approved = 1 (Auto-Approved)
        $stmt = $conn->prepare("INSERT INTO items (owner_id, name, category, item_condition, quantity, price_per_day, deposit_amount, description, image_url, occasion, is_available, is_approved, dos, donts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)");
        if (!$stmt) {
             throw new Exception("Prepare failed: " . $conn->error);
        }
        // types: i (owner), s (name), s (cat), s (cond), i (qty), d (price), d (dep), s (desc), s (img), s (occasion), s (dos), s (donts)
        $stmt->bind_param("isssiddsssss", $owner_id, $name, $category, $item_condition, $quantity, $price, $deposit, $description, $image_url, $occasion, $dos, $donts);
        
        if ($stmt->execute()) {
            debug_log("Item inserted via Mysqli");
            echo json_encode(["status" => "success", "message" => "Item submitted successfully"]);
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
