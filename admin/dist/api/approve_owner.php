<?php
include 'db.php';

// Allows automated testing to approve a shop owner by email via a GET request
// Usage: http://localhost/HertiX/admin/public/api/approve_owner.php?email=test@example.com

if (isset($_GET['email'])) {
    $email = $conn->real_escape_string($_GET['email']);
    $sql = "UPDATE users SET is_approved = 1 WHERE email = '$email' AND role = 'Shop Owner'";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Owner $email approved successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "No email provided."]);
}

$conn->close();
?>
