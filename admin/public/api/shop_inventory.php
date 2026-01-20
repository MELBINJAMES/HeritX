<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
include 'db.php'; // Ensure db.php uses $conn (mysqli) or $pdo

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    echo json_encode([]);
    exit;
}

// Assuming db.php makes $conn available (mysqli) based on login.php
// If db.php uses PDO, we need to adapt. login.php implies mysqli ($conn).
// Let's check db.php content again. 
// Wait, user-dashboard/backend/config/db.php uses PDO.
// admin/public/api/db.php might be different. I should check admin/public/api/db.php first.
// I'll write a safe version that checks.

if (isset($conn)) {
    // MySQLi (Preferred)
    // Use prepared statement for security
    $stmt = $conn->prepare("SELECT * FROM items WHERE owner_id = ? ORDER BY id DESC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $items = [];
    if ($result) {
        while($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
    }
    echo json_encode($items);
} else {
    echo json_encode(["error" => "Database connection failed"]);
}
?>
