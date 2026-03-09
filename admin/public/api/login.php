<?php
include 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    echo json_encode(["status" => "error", "message" => "Email and Password are required"]);
    exit();
}

$email = $conn->real_escape_string($data->email);
$password = $data->password;

// 0. Hardcoded Admin Check (Bypasses DB)
if ($email === 'admin@heritx.com' && $password === 'admin123') {
    echo json_encode([
        "status" => "success", 
        "message" => "Admin Login successful",
        "user" => [
            "id" => "admin_001",
            "name" => "Super Admin",
            "role" => "admin",
            "email" => $email
        ]
    ]);
    exit();
}

// 1. Check Users Table (Unified)
$sql = "SELECT id, name, email, phone, address, location, gender, dob, bio, profile_image, role, is_approved FROM users WHERE email = '$email'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if (password_verify($password, $row['password'])) {
        
        // Approval Check
        if ($row['is_approved'] == 0 && $row['role'] !== 'admin') {
             echo json_encode(["status" => "error", "message" => "Your account is pending approval. Please check your email."]);
             exit();
        }

        // Return ALL fields for the frontend context
        unset($row['password']); // Extra security

        // Role Validation
        $required_role = $data->required_role ?? null;
        if ($required_role) {
            if ($required_role === 'Finder' && ($row['role'] === 'Shop Owner' || $row['role'] === 'admin')) {
                echo json_encode(["status" => "error", "message" => "This email is registered as a Shop Owner. Please use another email."]);
                exit();
            }
            if ($required_role === 'Shop Owner' && $row['role'] === 'Finder') {
                echo json_encode(["status" => "error", "message" => "This email is registered as a Renter. Please use another email."]);
                exit();
            }
        }

        echo json_encode([
            "status" => "success", 
            "message" => "Login successful",
            "user" => $row
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
