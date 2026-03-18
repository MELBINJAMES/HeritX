<?php
// Enable Error Reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';
require_once 'config_notifications.php';

// PHPMailer for auto-email
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PhpMailerException;
require_once __DIR__ . '/../../../public/api/lib/Exception.php';
require_once __DIR__ . '/../../../public/api/lib/PHPMailer.php';
require_once __DIR__ . '/../../../public/api/lib/SMTP.php';

// ---- Helper: Send Return Confirmation Email ----
function sendReturnEmail(string $to_email, string $renter_name, string $item_name, int $order_id): void {
    if (empty($to_email)) return;
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($to_email, $renter_name);
        $mail->isHTML(true);
        $mail->Subject = "HertiX - Your Rental Has Been Successfully Returned";
        $mail->Body = "
            <div style='font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;'>
                <div style='max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; border-top: 4px solid #10b981;'>
                    <h2 style='color: #10b981;'>&#10003; Item Successfully Returned!</h2>
                    <p>Hi <strong>$renter_name</strong>,</p>
                    <p>We are happy to confirm that your rented item <strong>'$item_name'</strong> (Order #$order_id) has been <strong>returned without any damage</strong>.</p>
                    <p>Thank you for using <strong>HertiX</strong>! We hope you had a wonderful experience and look forward to serving you again.</p>
                    <br>
                    <p style='color: #64748b; font-size: 0.9rem;'>If you have any queries, please contact the shop directly.</p>
                    <br>
                    <p>Warm regards,<br><strong>The HertiX Team</strong></p>
                </div>
            </div>
        ";
        $mail->AltBody = "Hi $renter_name, your item '$item_name' (Order #$order_id) has been returned without any damage. Your security deposit will be fully refunded shortly. Thank you for using HertiX!";
        $mail->send();
        error_log("EMAIL_SENT (RETURN): To $to_email for Order #$order_id");
    } catch (\Exception $e) {
        error_log("EMAIL_FAILED (RETURN): " . $e->getMessage());
    }
}

// ---- Helper: Send Damage Report Email ----
function sendDamageEmail(string $to_email, string $renter_name, string $item_name, int $order_id, string $damage_note = '', float $damage_deduction = 0): void {
    if (empty($to_email)) return;
    $deduction_text = $damage_deduction > 0 ? "<strong>&#8377;$damage_deduction</strong>" : '<strong>an amount</strong>';
    $note_html = !empty($damage_note) ? "<p><strong>Damage Description:</strong> $damage_note</p>" : '';
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($to_email, $renter_name);
        $mail->isHTML(true);
        $mail->Subject = "HertiX - Damage Report for Your Rental (Order #$order_id)";
        $mail->Body = "
            <div style='font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;'>
                <div style='max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; border-top: 4px solid #ef4444;'>
                    <h2 style='color: #ef4444;'>&#9888; Damage Report - Action Required</h2>
                    <p>Hi <strong>$renter_name</strong>,</p>
                    <p>We regret to inform you that your rented item <strong>'$item_name'</strong> (Order #$order_id) was returned with damage.</p>
                    $note_html
                    <p>A deduction of $deduction_text may be applied from your security deposit as per our <strong>HeritX Rental Terms</strong>.</p>
                    <p>Please contact the shop for further discussion and resolution.</p>
                    <br>
                    <p style='color:#64748b; font-size:0.9rem;'>If you believe this is an error, please reach out to support.</p>
                    <br>
                    <p>Regards,<br><strong>The HertiX Team</strong></p>
                </div>
            </div>
        ";
        $mail->AltBody = "Hi $renter_name, your item '$item_name' (Order #$order_id) was returned with damage. A deduction may be applied from your deposit. Contact the shop for details.";
        $mail->send();
        error_log("EMAIL_SENT (DAMAGE): To $to_email for Order #$order_id");
    } catch (\Exception $e) {
        error_log("EMAIL_FAILED (DAMAGE): " . $e->getMessage());
    }
}

// ---- Helper: Send Return/Damage WhatsApp via Twilio ----
function sendTwilioWhatsApp(string $phone, string $renter_name, string $item_name, int $order_id, bool $is_damaged = false, string $damage_note = '', float $damage_deduction = 0): void {
    if (empty($phone) || TWILIO_ACCOUNT_SID === 'YOUR_TWILIO_ACCOUNT_SID') {
        error_log("WHATSAPP_SKIPPED: Twilio credentials not set. Contact phone: $phone");
        return;
    }
    if ($is_damaged) {
        $deductionText = $damage_deduction > 0 ? "\u20b9$damage_deduction" : 'an amount';
        $noteText = !empty($damage_note) ? "\nDamage Note: $damage_note" : '';
        $message = "Hello $renter_name, unfortunately your rented item '$item_name' (Order #$order_id) was returned with damage.$noteText A deduction of $deductionText may be applied from your security deposit. Please contact the shop for more details.";
    } else {
        $message = "Hello $renter_name! \u2705 Your rental for '$item_name' (Order #$order_id) has been successfully returned without any damage. Your security deposit will be fully refunded to your account shortly. Thank you for using HeritX! We hope to see you again.";
    }
    $to_number = 'whatsapp:+91' . preg_replace('/\D/', '', $phone);

    $url  = 'https://api.twilio.com/2010-04-01/Accounts/' . TWILIO_ACCOUNT_SID . '/Messages.json';
    $data = [
        'From' => TWILIO_WHATSAPP_FROM,
        'To'   => $to_number,
        'Body' => $message,
    ];
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_USERPWD, TWILIO_ACCOUNT_SID . ':' . TWILIO_AUTH_TOKEN);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    error_log("TWILIO_WHATSAPP (RETURN): HTTP $httpCode -> $response");
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$order_id = intval($data['order_id'] ?? 0);
$status = $data['status'] ?? '';
$owner_id = intval($data['owner_id'] ?? 0);

if ($order_id <= 0 || empty($status) || $owner_id <= 0) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

$allowed_statuses = ['pending', 'active', 'completed', 'cancelled', 'damaged', 'confirmed'];
if (!in_array($status, $allowed_statuses)) {
    echo json_encode(["status" => "error", "message" => "Invalid status value: " . $status]);
    exit;
}

$damage_note      = trim($data['damage_note'] ?? '');
$damage_deduction = floatval($data['damage_deduction'] ?? 0);

if (isset($conn) && $conn instanceof mysqli) {
    // 1. Verify that the order belongs to an item owned by this owner, including customer email
    $sql = "SELECT r.status as old_status, r.item_id, r.quantity, r.contact_phone, r.user_id,
                   u.email as renter_email, u.name as renter_user_name,
                   i.name as item_name 
            FROM rentals r 
            JOIN items i ON r.item_id = i.id 
            JOIN users u ON r.user_id = u.id
            WHERE r.id = ? AND i.owner_id = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        exit;
    }

    $stmt->bind_param("ii", $order_id, $owner_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "Order not found or access denied"]);
        $stmt->close();
        exit;
    }
    
    $orderData = $result->fetch_assoc();
    $old_status  = $orderData['old_status'];
    $item_id     = $orderData['item_id'];
    $quantity    = isset($orderData['quantity']) ? intval($orderData['quantity']) : 1;
    $contact_phone  = $orderData['contact_phone'] ?? '';
    $item_name      = $orderData['item_name'] ?? 'Item';
    $renter_email   = $orderData['renter_email'] ?? '';
    $renter_name    = $orderData['renter_user_name'] ?? 'Customer';
    
    $stmt->close();

    // 2. Update the status
    $updateSql = "UPDATE rentals SET status = ? WHERE id = ?";
    $updateStmt = $conn->prepare($updateSql);
    
    if (!$updateStmt) {
        echo json_encode(["status" => "error", "message" => "Prepare update failed: " . $conn->error]);
        exit;
    }

    $updateStmt->bind_param("si", $status, $order_id);
    
    if ($updateStmt->execute()) {
        // 3. Restock if necessary
        $wasActive = ($old_status === 'active' || $old_status === 'pending' || $old_status === 'confirmed');
        $isTerminal = ($status === 'completed' || $status === 'cancelled' || $status === 'damaged');
        
        if ($wasActive && $isTerminal) {
            $restockSql = "UPDATE items SET quantity = quantity + ? WHERE id = ?";
            $rsStmt = $conn->prepare($restockSql);
            if ($rsStmt) {
                $rsStmt->bind_param("ii", $quantity, $item_id);
                $rsStmt->execute();
                $rsStmt->close();
            }

            // Save damage details if applicable
            if ($status === 'damaged' && (!empty($damage_note) || $damage_deduction > 0)) {
                $dmgStmt = $conn->prepare("UPDATE rentals SET damage_note = ?, damage_deduction = ? WHERE id = ?");
                if ($dmgStmt) {
                    $dmgStmt->bind_param("sdi", $damage_note, $damage_deduction, $order_id);
                    $dmgStmt->execute();
                    $dmgStmt->close();
                }
            }

            // 4. Auto-send Return Notifications
            if ($status === 'completed') {
                // Successful return messages
                $wa_message = "Hello $renter_name! \u2705 Your rental for '$item_name' (Order #$order_id) has been successfully returned without any damage. Your security deposit will be fully refunded to your account shortly. Thank you for using HeritX!";
                error_log("WHATSAPP_SENT (RETURN): To " . $contact_phone . " -> " . str_replace("\n", " ", $wa_message));
                sendReturnEmail($renter_email, $renter_name, $item_name, $order_id);
                sendTwilioWhatsApp($contact_phone, $renter_name, $item_name, $order_id);
            }

            if ($status === 'damaged') {
                // Damage report messages
                $deductionText = $damage_deduction > 0 ? "\u20b9$damage_deduction" : 'an amount';
                $noteText      = !empty($damage_note) ? "\nDamage Note: $damage_note" : '';
                $wa_message = "Hello $renter_name, unfortunately your rented item '$item_name' (Order #$order_id) was returned with damage.$noteText A deduction of $deductionText may be applied from your security deposit as per our rental terms. Please contact the shop for more details.";
                error_log("WHATSAPP_SENT (DAMAGE): To " . $contact_phone . " -> " . str_replace("\n", " ", $wa_message));
                sendDamageEmail($renter_email, $renter_name, $item_name, $order_id, $damage_note, $damage_deduction);
                sendTwilioWhatsApp($contact_phone, $renter_name, $item_name, $order_id, true, $damage_note, $damage_deduction);
            }
        }

        echo json_encode(["status" => "success", "message" => "Order updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update database: " . $updateStmt->error]);
    }
    $updateStmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Database connection error"]);
}

$conn->close();
?>
