<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Helper to log actions
function logAction($conn, $action, $details) {
    $stmt = $conn->prepare("INSERT INTO audit_logs (action, details) VALUES (?, ?)");
    $stmt->bind_param("ss", $action, $details);
    $stmt->execute();
}

$data = json_decode(file_get_contents("php://input"));
if ($data && isset($data->action)) {
    // If action is in body, prioritize it
    $action = $data->action;
}

if ($method === 'GET') {
    if ($action === 'stats') {
        $users = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'Finder'")->fetch_assoc()['count'];
        $owners = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'Shop Owner'")->fetch_assoc()['count'];
        $items = $conn->query("SELECT COUNT(*) as count FROM items")->fetch_assoc()['count'];
        $rentals = $conn->query("SELECT COUNT(*) as count FROM rentals WHERE status = 'active'")->fetch_assoc()['count'];
        
        // Notification Counts
        $pending_owners = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'Shop Owner' AND is_approved = 0")->fetch_assoc()['count'];
        $pending_items = $conn->query("SELECT COUNT(*) as count FROM items WHERE is_approved = 0")->fetch_assoc()['count'];

        echo json_encode([
            "status" => "success",
            "stats" => [
                "users" => $users, 
                "owners" => $owners, 
                "items" => $items, 
                "rentals" => $rentals,
                "pending_owners" => $pending_owners,
                "pending_items" => $pending_items
            ]
        ]);
    }
    elseif ($action === 'users') {
        $result = $conn->query("SELECT id, name, email, created_at FROM users WHERE role = 'Finder' ORDER BY created_at DESC");
        echo json_encode(["status" => "success", "users" => $result->fetch_all(MYSQLI_ASSOC)]);
    }
    elseif ($action === 'owners') {
        // Fetch all owners (approved/verified ones mostly, or all)
        // Adjust query if 'is_approved' column exists in users or shopowners
        // Assuming users table handles login, we check if they are verified.
        // For now list all shop_owners
        $result = $conn->query("SELECT id, name, email, created_at, is_approved FROM users WHERE role = 'Shop Owner' ORDER BY created_at DESC");
        echo json_encode(["status" => "success", "owners" => $result->fetch_all(MYSQLI_ASSOC)]);
    }
    elseif ($action === 'pending_owners') {
        // Fetch only pending owners
         $result = $conn->query("SELECT id, name, email, created_at, shop_address, shop_city, shop_phone, shop_proof FROM users WHERE role = 'Shop Owner' AND is_approved = 0 ORDER BY created_at DESC");
         echo json_encode(["status" => "success", "owners" => $result->fetch_all(MYSQLI_ASSOC)]);
    }
    elseif ($action === 'pending_items') {
        $result = $conn->query("SELECT i.id, i.name, i.category, i.price_per_day, i.image_url, u.name as owner_name FROM items i JOIN users u ON i.owner_id = u.id WHERE i.is_approved = 0 ORDER BY i.created_at DESC");
        echo json_encode(["status" => "success", "items" => $result->fetch_all(MYSQLI_ASSOC)]);
    }
    elseif ($action === 'all_items') {
        $result = $conn->query("SELECT i.id, i.name, i.category, i.price_per_day, i.image_url, i.is_approved, u.name as owner_name FROM items i JOIN users u ON i.owner_id = u.id ORDER BY i.created_at DESC");
        echo json_encode(["status" => "success", "items" => $result->fetch_all(MYSQLI_ASSOC)]);
    }
    elseif ($action === 'get_categories') {
        $result = $conn->query("SELECT * FROM categories ORDER BY type, name");
        echo json_encode(["status" => "success", "categories" => $result->fetch_all(MYSQLI_ASSOC)]);
    }
    elseif ($action === 'get_logs') {
        $result = $conn->query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50");
        echo json_encode(["status" => "success", "logs" => $result->fetch_all(MYSQLI_ASSOC)]);
    }
}
elseif ($method === 'POST') {
    // Handling POST actions
    $id = isset($data->id) ? $conn->real_escape_string($data->id) : null;
    $details = "";

    if ($action === 'delete_user') {
        $conn->query("DELETE FROM users WHERE id = '$id'");
        logAction($conn, "Deleted User", "Deleted ID: $id");
        echo json_encode(["status" => "success", "message" => "User deleted successfully"]);
    }
    elseif ($action === 'approve_item') {
        $conn->query("UPDATE items SET is_approved = 1 WHERE id = '$id'");
        logAction($conn, "Approved Item", "Item ID: $id");
        echo json_encode(["status" => "success", "message" => "Item approved"]);
    }
    elseif ($action === 'reject_item') {
        $conn->query("DELETE FROM items WHERE id = '$id'");
        logAction($conn, "Rejected Item", "Item ID: $id");
        echo json_encode(["status" => "success", "message" => "Item rejected"]);
    }
    elseif ($action === 'approve_owner') {
        $conn->query("UPDATE users SET is_approved = 1 WHERE id = '$id'");
        
        // Notification Logic
        $user = $conn->query("SELECT email, name FROM users WHERE id = '$id'")->fetch_assoc();
        $to = $user['email'];
        $subject = "Shop Registration Approved - HeritX";
        $body = "Dear {$user['name']},\n\nYour shop registration has been approved on " . date('Y-m-d H:i:s') . ". You can now log in to your dashboard.\n\nWelcome to HeritX!";
        
        // 1. Attempt Real Email
        $headers = "From: admin@heritx.com";
        @mail($to, $subject, $body, $headers);

        // 2. Local Fallback: Log to file
        // 2. Local Fallback: Log to file with Absolute Path
        $logFile = __DIR__ . '/../uploads/email_logs.txt';
        $logEntry = "--- EMAIL SENT [" . date('Y-m-d H:i:s') . "] ---\nTo: $to\nSubject: $subject\nBody:\n$body\n----------------------------------\n\n";
        file_put_contents($logFile, $logEntry, FILE_APPEND);
        
        logAction($conn, "Approved Owner", "Owner ID: $id - Email Sent to $to");
        echo json_encode(["status" => "success", "message" => "Owner approved & verification email sent"]);
    }
    elseif ($action === 'reject_owner') {
        $user = $conn->query("SELECT email, name FROM users WHERE id = '$id'")->fetch_assoc();
        $conn->query("DELETE FROM users WHERE id = '$id'"); // Or update status
        
        // Notification Logic
        $to = $user['email'];
        $subject = "Shop Registration Rejected - HeritX";
        $body = "Dear {$user['name']},\n\nYour shop registration request has been rejected. Please contact support for further details.";
        
        // 1. Attempt Real Email
        $headers = "From: admin@heritx.com";
        @mail($to, $subject, $body, $headers);

        // 2. Local Fallback: Log to file
        // 2. Local Fallback: Log to file with Absolute Path
        $logFile = __DIR__ . '/../uploads/email_logs.txt';
        $logEntry = "--- EMAIL SENT [" . date('Y-m-d H:i:s') . "] ---\nTo: $to\nSubject: $subject\nBody:\n$body\n----------------------------------\n\n";
        file_put_contents($logFile, $logEntry, FILE_APPEND);
        
        logAction($conn, "Rejected Owner", "Owner ID: $id - Email Sent to $to");
        echo json_encode(["status" => "success", "message" => "Owner rejected & notification email sent"]);
    }
    elseif ($action === 'toggle_shop_status') {
         // Assuming we toggle is_approved or a new 'is_active' column. modifying is_approved for now.
         $current = $conn->query("SELECT is_approved FROM users WHERE id = '$id'")->fetch_assoc()['is_approved'];
         $newStatus = $current ? 0 : 1;
         $conn->query("UPDATE users SET is_approved = $newStatus WHERE id = '$id'");
         logAction($conn, "Toggled Shop Status", "Owner ID: $id to $newStatus");
         echo json_encode(["status" => "success", "message" => "Status updated"]);
    }
    elseif ($action === 'add_category') {
        $name = $conn->real_escape_string($data->name);
        $type = $conn->real_escape_string($data->type);
        $conn->query("INSERT INTO categories (name, type) VALUES ('$name', '$type')");
        logAction($conn, "Added Category", "$name ($type)");
        echo json_encode(["status" => "success"]);
    }
    elseif ($action === 'delete_category') {
        $conn->query("DELETE FROM categories WHERE id = '$id'");
        logAction($conn, "Deleted Category", "ID: $id");
        echo json_encode(["status" => "success"]);
    }
}

$conn->close();
?>
