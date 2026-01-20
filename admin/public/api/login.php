<?php
include 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    echo json_encode(["status" => "error", "message" => "Email and Password are required"]);
    exit();
}

$email = $conn->real_escape_string($data->email);
$password = $data->password;

// 1. Check Shop Owners Table
$sql = "SELECT id, name, password, role FROM shopowners WHERE email = '$email'";
$result = $conn->query($sql);

if ($result->num_rows == 0) {
    // 2. If not in owners, Check Users Table
    $sql = "SELECT id, name, password, role FROM users WHERE email = '$email'";
    $result = $conn->query($sql);
}

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if (password_verify($password, $row['password'])) {
        // In a real app, you would generate a JWT token here
        echo json_encode([
            "status" => "success", 
            "message" => "Login successful",
            "user" => [
                "id" => $row['id'],
                "name" => $row['name'],
                "role" => $row['role'],
                "email" => $email
            ]
        ]);
        exit();
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
        exit();
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
    exit();
}

$conn->close();
?>
