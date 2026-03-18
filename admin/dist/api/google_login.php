<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->token)) {
    echo json_encode(["status" => "error", "message" => "Token is required"]);
    exit();
}

$token = $data->token;

// Verify token with Google
$url = "https://www.googleapis.com/oauth2/v3/userinfo";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$googleUser = json_decode($response, true);

if (!isset($googleUser['email'])) {
    echo json_encode(["status" => "error", "message" => "Invalid Google Token"]);
    exit();
}

$email = $googleUser['email'];
$name = $googleUser['name'];

// Security: Block Admin from using Google Login
if ($email === 'admin@heritx.com') {
    echo json_encode(["status" => "error", "message" => "Admin cannot login via Google. Please use password."]);
    exit();
}

// Check if user exists
$stmt = $conn->prepare("SELECT id, name, email, phone, address, location, gender, dob, bio, profile_image, role FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // User exists, log them in
    $user = $result->fetch_assoc();

    // Role Validation
    $required_role = $data->required_role ?? null;
    if ($required_role) {
        if ($required_role === 'Finder' && ($user['role'] === 'Shop Owner' || $user['role'] === 'admin')) {
            echo json_encode(["status" => "error", "message" => "This email is registered as a Shop Owner. Please use another email."]);
            exit();
        }
        if ($required_role === 'Shop Owner' && $user['role'] === 'Finder') {
            echo json_encode(["status" => "error", "message" => "This email is registered as a Renter. Please use another email."]);
            exit();
        }
    }

    echo json_encode([
        "status" => "success",
        "message" => "Login successful",
        "user" => $user
    ]);
    exit();
} else {
    // User does not exist, AUTO-REGISTER them
    $role = 'Finder';
    $password_hash = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT); // Generate random password
    $created_at = date('Y-m-d H:i:s');

    $insert_stmt = $conn->prepare("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)");
    $insert_stmt->bind_param("sssss", $name, $email, $password_hash, $role, $created_at);

    if ($insert_stmt->execute()) {
        $new_user_id = $insert_stmt->insert_id;
        
        // Return success with new user data
        echo json_encode([
            "status" => "success",
            "message" => "Account created and logged in",
            "user" => [
                "id" => $new_user_id,
                "name" => $name,
                "email" => $email,
                "role" => $role
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to create account: " . $insert_stmt->error]);
    }
    $insert_stmt->close();
}

$stmt->close();
$conn->close();
?>
