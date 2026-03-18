<?php
include 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    echo json_encode(["status" => "error", "message" => "Email and Password are required"]);
    exit();
}

$email = $conn->real_escape_string($data->email);
$password = $data->password;

$sql = "SELECT id, full_name, password FROM users WHERE email = '$email'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if (password_verify($password, $row['password'])) {
        // In a real app, you would generate a JWT token here
        echo json_encode([
            "status" => "success", 
            "message" => "Login successful",
            "user" => [
                "id" => $row['id'],
                "full_name" => $row['full_name'],
                "email" => $email
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
}

$conn->close();
?>
