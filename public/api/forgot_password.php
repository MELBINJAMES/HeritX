<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'db.php';
require 'config_email.php';
require 'lib/Exception.php';
require 'lib/PHPMailer.php';
require 'lib/SMTP.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email)) {
    echo json_encode(["status" => "error", "message" => "Email is required"]);
    exit();
}

$email = $conn->real_escape_string($data->email);

// Check if user exists
$sql = "SELECT id, full_name FROM users WHERE email = '$email'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $full_name = $row['full_name'] ? $row['full_name'] : 'User';
    
    $otp = rand(100000, 999999);
    // Expiry 15 minutes from now
    $expiry = date("Y-m-d H:i:s", strtotime("+15 minutes"));

    $update_sql = "UPDATE users SET reset_token = '$otp', reset_token_expiry = '$expiry' WHERE email = '$email'";
    
    if ($conn->query($update_sql) === TRUE) {
        $mail = new PHPMailer(true);

        try {
            //Server settings
            $mail->isSMTP();
            $mail->Host       = SMTP_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = SMTP_USER;
            $mail->Password   = SMTP_PASS;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = SMTP_PORT;

            //Recipients
            $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
            $mail->addAddress($email, $full_name);

            //Content
            $mail->isHTML(true);
            $mail->Subject = 'HertiX - Password Reset Code';
            $mail->Body    = "
                <div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;'>
                    <div style='max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;'>
                        <h2 style='color: #2c3e50;'>Password Reset Request</h2>
                        <p>Hi $full_name,</p>
                        <p>You requested to reset your password. Use the verification code below:</p>
                        <div style='background-color: #e0e6ed; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 4px; margin: 20px 0;'>
                            $otp
                        </div>
                        <p>This code will expire in 15 minutes.</p>
                        <p>If you didn't request this, you can safely ignore this email.</p>
                        <br>
                        <p>Best regards,<br>The HertiX Team</p>
                    </div>
                </div>
            ";
            $mail->AltBody = "Hi $full_name, Your password reset code is: $otp. It expires in 15 minutes.";

            $mail->send();
            echo json_encode(["status" => "success", "message" => "OTP has been sent to your email!"]);
        } catch (Exception $e) {
            // For debugging, we can show the error, but in prod we might hide it
            echo json_encode(["status" => "error", "message" => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update record"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Email not found"]);
}

$conn->close();
?>
