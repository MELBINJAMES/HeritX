<?php
include 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    echo json_encode(["status" => "error", "message" => "Email, Full Name and Password are required"]);
    exit();
}

$email = $conn->real_escape_string($data->email);
$fullName = isset($data->full_name) ? $conn->real_escape_string($data->full_name) : '';
$role = isset($data->role) ? $conn->real_escape_string($data->role) : 'Finder';
$rawPassword = $data->password;

// Password Validation
if (strlen($rawPassword) < 8 || !preg_match("/[A-Z]/", $rawPassword) || !preg_match("/[a-z]/", $rawPassword)) {
    echo json_encode(["status" => "error", "message" => "Password must be at least 8 characters long, include an uppercase letter and a lowercase letter."]);
    exit();
}

$password = password_hash($rawPassword, PASSWORD_DEFAULT);

// Check if email already exists
$table = ($role === 'Shop Owner' || $role === 'Owner') ? 'shopowners' : 'users';

$check_sql = "SELECT id FROM $table WHERE email = '$email'";
$result = $conn->query($check_sql);

if ($result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Email already registered in $table. Please login."]);
} else {
    // Insert into respective table
    $sql = "INSERT INTO $table (email, name, password, role) VALUES ('$email', '$fullName', '$password', '$role')";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Account created successfully in $table!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error: " . $conn->error]);
    }
}

$conn->close();
?>
