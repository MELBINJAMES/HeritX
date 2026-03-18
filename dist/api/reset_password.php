<?php
include 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->otp) || !isset($data->password)) {
    echo json_encode(["status" => "error", "message" => "All fields are required"]);
    exit();
}

$email = $conn->real_escape_string($data->email);
$otp = $conn->real_escape_string($data->otp);
$password = password_hash($data->password, PASSWORD_DEFAULT);
$now = date("Y-m-d H:i:s");

// Verify OTP again before resetting
$sql = "SELECT id FROM users WHERE email = '$email' AND reset_token = '$otp' AND reset_token_expiry > '$now'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $update_sql = "UPDATE users SET password = '$password', reset_token = NULL, reset_token_expiry = NULL WHERE email = '$email'";
    
    if ($conn->query($update_sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Password changed successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update password"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
}

$conn->close();
?>
