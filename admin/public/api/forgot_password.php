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
$sql = "SELECT id, name FROM users WHERE email = '$email'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $full_name = $row['name'] ? $row['name'] : 'User';
    
    $otp = rand(100000, 999999);
    // Expiry 15 minutes from now
    $expiry = date("Y-m-d H:i:s", strtotime("+15 minutes"));

    $update_sql = "UPDATE users SET reset_token = '$otp', reset_token_expiry = '$expiry' WHERE email = '$email'";
    
    if ($conn->query($update_sql) === TRUE) {
        
        $subject = 'HertiX - Password Reset Code';
        $body = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
                    .code { background: #e0e6ed; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border-radius: 4px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2>Password Reset Request</h2>
                    <p>Hi $full_name,</p>
                    <p>You requested to reset your password. Use the verification code below:</p>
                    <div class='code'>$otp</div>
                    <p>This code will expire in 15 minutes.</p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                    <br>
                    <p>Best regards,<br>The HertiX Team</p>
                </div>
            </body>
            </html>
        ";

        // Send via PHPMailer
        $mail = new PHPMailer(true);
        $emailStatus = "";
        
        // Define headers for fallback mail()
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: no-reply@hertix.com" . "\r\n";

        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host       = SMTP_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = SMTP_USER;
            $mail->Password   = SMTP_PASS;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = SMTP_PORT;

            // Recipients
            $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
            $mail->addAddress($email, $full_name);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $body;

            $mail->send();
            $emailStatus = "SMTP Sent";
        } catch (Exception $e) {
            $emailStatus = "SMTP Failed: " . $mail->ErrorInfo;
            // Fallback to basic mail if SMTP fails
            @mail($email, $subject, $body, $headers);
        }

        // 2. Local Fallback: Log to file for debugging
        $logFile = __DIR__ . '/../uploads/email_logs.txt';
        $logEntry = "--- FORGOT PASSWORD EMAIL [" . date('Y-m-d H:i:s') . "] ---\nTo: $email\nStatus: $emailStatus\nCode: $otp\n----------------------------------\n\n";
        file_put_contents($logFile, $logEntry, FILE_APPEND);

        echo json_encode(["status" => "success", "message" => "Verification code has been sent to your email!"]);

    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update record"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Email not found"]);
}

$conn->close();
?>
