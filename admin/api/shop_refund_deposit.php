<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

include 'db.php';
include 'config_notifications.php';

// PHPMailer for auto-email
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PhpMailerException;
require_once __DIR__ . '/lib/Exception.php';
require_once __DIR__ . '/lib/PHPMailer.php';
require_once __DIR__ . '/lib/SMTP.php';

$data = json_decode(file_get_contents("php://input"), true);
$order_id       = intval($data['order_id']   ?? 0);
$owner_id       = intval($data['owner_id']   ?? 0);
$refund_amount  = floatval($data['refund_amount'] ?? 0); 
$damage_type    = trim($data['damage_type'] ?? 'No Damage');
$deduction      = floatval($data['deduction'] ?? 0);
$damage_note    = trim($data['damage_note'] ?? '');
$late_days      = intval($data['late_days'] ?? 0);

if ($order_id <= 0 || $owner_id <= 0) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

// 1. Fetch rental details
$stmt = $conn->prepare("
    SELECT r.id, r.razorpay_payment_id, r.deposit_amount, r.payment_method, r.status, r.user_id, r.contact_phone,
           u.email as renter_email, u.name as renter_name,
           i.name as item_name, i.owner_id
    FROM rentals r
    JOIN items i ON r.item_id = i.id
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ? AND i.owner_id = ?
");
$stmt->bind_param("ii", $order_id, $owner_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Order not found or access denied"]);
    exit;
}
$rental = $result->fetch_assoc();
$stmt->close();

// 2. Check Razorpay keys are configured
if (!defined('RAZORPAY_KEY_ID') || !defined('RAZORPAY_KEY_SECRET')) {
    echo json_encode(["status" => "error", "message" => "Razorpay API keys not configured in config_notifications.php"]);
    exit;
}

// 3. Check payment method is online (not COD)
if ($rental['payment_method'] === 'cod' || $rental['payment_method'] === 'cash') {
    // COD orders: just record the refund as manual and set return date
    $conn->query("UPDATE rentals SET refund_status = 'manual_required', refund_amount = $refund_amount, actual_return_date = CURRENT_DATE, status = 'completed' WHERE id = $order_id");
    echo json_encode(["status" => "success", "method" => "manual", "message" => "Cash order — refund must be done manually. Marked as returned and stock released."]);
    exit;
}

$payment_id = $rental['razorpay_payment_id'] ?? '';

if (empty($payment_id)) {
    echo json_encode(["status" => "error", "message" => "No Razorpay payment ID found for this order. Cannot initiate refund."]);
    exit;
}

// 4. Call Razorpay Refund API via cURL
$refund_paise = intval($refund_amount * 100); // Razorpay uses paise (1 INR = 100 paise)
$url = "https://api.razorpay.com/v1/payments/{$payment_id}/refund";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_USERPWD, RAZORPAY_KEY_ID . ':' . RAZORPAY_KEY_SECRET);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'amount' => $refund_paise,
    'notes'  => ['reason' => 'Deposit refund for Order #' . $order_id]
]));
$response    = curl_exec($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$rzpData = json_decode($response, true);

if ($http_status === 200 && isset($rzpData['id'])) {
    // 5. Record refund in DB
    $refund_id = $rzpData['id'];
    $conn->query("ALTER TABLE rentals ADD COLUMN IF NOT EXISTS refund_status VARCHAR(30) DEFAULT NULL");
    $conn->query("ALTER TABLE rentals ADD COLUMN IF NOT EXISTS refund_id VARCHAR(100) DEFAULT NULL");
    $conn->query("ALTER TABLE rentals ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT NULL");
    $conn->query("ALTER TABLE rentals ADD COLUMN IF NOT EXISTS damage_note TEXT DEFAULT NULL");
    $conn->query("ALTER TABLE rentals ADD COLUMN IF NOT EXISTS damage_deduction DECIMAL(10,2) DEFAULT 0");

    $stmt = $conn->prepare("UPDATE rentals SET refund_status = 'refunded', refund_id = ?, refund_amount = ?, damage_note = ?, damage_deduction = ?, late_days = ?, status = 'completed', return_time = CURRENT_TIMESTAMP, actual_return_date = CURRENT_DATE WHERE id = ?");
    $note = $damage_type !== 'No Damage' ? "$damage_type" : 'No Damage';
    if (!empty($damage_note)) $note .= " - Note: $damage_note";
    $stmt->bind_param("sdsdii", $refund_id, $refund_amount, $note, $deduction, $late_days, $order_id);
    $stmt->execute();

    // 6. Send Notifications
    $renter_email = $rental['renter_email'];
    $renter_name  = $rental['renter_name'];
    $item_name    = $rental['item_name'];
    $phone        = $rental['contact_phone'];

    if ($damage_type === 'No Damage') {
        $wa_msg = "Hello $renter_name! ✅ Your rental for '$item_name' (Order #$order_id) has been successfully returned without any issues. Your security deposit of Rs.$refund_amount will be re-sent to your account shortly. Thank you for using HeritX!";
        sendEmail($renter_email, $renter_name, "HertiX - Refund Successful", "<h2>Refund Successful!</h2><p>Hi $renter_name,</p><p>Your item '$item_name' was returned without issues. Your deposit of Rs.$refund_amount is being processed.</p>");
    } else {
        $issue_text = strpos($damage_type, 'Late') !== false ? "due to $damage_type" : "with $damage_type damage";
        $wa_msg = "Hello $renter_name, your rented item '$item_name' (Order #$order_id) had an issue $issue_text. A deduction of Rs.$deduction was applied. Remaining Rs.$refund_amount has been refunded to your account.";
        sendEmail($renter_email, $renter_name, "HertiX - Partial Refund Processed", "<h2>Partial Refund Processed</h2><p>Hi $renter_name,</p><p>Your item '$item_name' was processed $issue_text. Rs.$deduction was deducted, and Rs.$refund_amount was refunded.</p>");
    }
    sendWhatsApp($phone, $wa_msg);

    echo json_encode([
        "status"    => "success",
        "method"    => "razorpay",
        "refund_id" => $refund_id,
        "amount"    => $refund_amount,
        "message"   => "Deposit of Rs.$refund_amount refunded successfully via Razorpay!"
    ]);
} else {
    $errorMsg = $rzpData['error']['description'] ?? 'Unknown Razorpay error';
    echo json_encode(["status" => "error", "message" => "Razorpay refund failed: $errorMsg", "raw" => $rzpData]);
}

// Helper Functions
function sendEmail($to, $name, $subject, $body) {
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = SMTP_PORT;
        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($to, $name);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->send();
    } catch (Exception $e) {}
}

function sendWhatsApp($phone, $message) {
    if (empty($phone) || TWILIO_ACCOUNT_SID === 'YOUR_TWILIO_ACCOUNT_SID') return;
    $url = 'https://api.twilio.com/2010-04-01/Accounts/' . TWILIO_ACCOUNT_SID . '/Messages.json';
    $data = ['From' => TWILIO_WHATSAPP_FROM, 'To' => 'whatsapp:+91' . preg_replace('/\D/', '', $phone), 'Body' => $message];
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_USERPWD, TWILIO_ACCOUNT_SID . ':' . TWILIO_AUTH_TOKEN);
    curl_exec($ch);
    curl_close($ch);
}
?>
