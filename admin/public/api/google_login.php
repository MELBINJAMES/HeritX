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

// Check if user exists
$stmt = $conn->prepare("SELECT id, name, email, role FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // User exists, log them in
    $user = $result->fetch_assoc();
    echo json_encode([
        "status" => "success",
        "message" => "Login successful",
        "user" => $user
    ]);
} else {
    // Optional: Auto-register functionality could go here
    // For now, fail if not registered
    echo json_encode(["status" => "error", "message" => "User with email ($email) is not registered. Please register first."]);
}

$stmt->close();
$conn->close();
?>
