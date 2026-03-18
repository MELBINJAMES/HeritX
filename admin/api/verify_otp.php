<?php
include 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->otp)) {
    echo json_encode(["status" => "error", "message" => "Email and OTP are required"]);
    exit();
}

$email = $conn->real_escape_string($data->email);
$otp = $conn->real_escape_string($data->otp);
$now = date("Y-m-d H:i:s");

$sql = "SELECT id FROM users WHERE email = '$email' AND reset_token = '$otp' AND reset_token_expiry > '$now'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo json_encode(["status" => "success", "message" => "OTP verified"]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid or expired OTP"]);
}

$conn->close();
?>
