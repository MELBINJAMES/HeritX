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

require_once '../config/config_razorpay.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['amount'])) {
    echo json_encode(['status' => 'error', 'message' => 'Amount is required']);
    exit;
}

$amount = intval($data['amount']) * 100; // Convert to paise
$currency = 'INR';
$receipt = 'order_rcptid_' . time();

$api_url = "https://api.razorpay.com/v1/orders";
$api_key = RAZORPAY_KEY_ID;
$api_secret = RAZORPAY_KEY_SECRET;

$post_data = json_encode([
    'amount' => $amount,
    'currency' => $currency,
    'receipt' => $receipt,
    'payment_capture' => 1
]);

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, $api_key . ":" . $api_secret);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

// Disable SSL verification for local development (Fix for XAMPP cURL error 60)
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    $error_msg = curl_error($ch);
    file_put_contents('razorpay_error.log', date('[Y-m-d H:i:s] ') . "Curl Error: " . $error_msg . "\n", FILE_APPEND);
    echo json_encode(['status' => 'error', 'message' => 'Connection error: ' . $error_msg]);
} else {
    $result = json_decode($response, true);
    if ($http_code === 200 && isset($result['id'])) {
        echo json_encode(['status' => 'success', 'order_id' => $result['id'], 'amount' => $amount, 'key_id' => $api_key]);
    } else {
        file_put_contents('razorpay_error.log', date('[Y-m-d H:i:s] ') . "Razorpay Error: " . print_r($result, true) . "\n", FILE_APPEND);
        // Show actual error from Razorpay in the message for better debugging
        $msg = isset($result['error']['description']) ? $result['error']['description'] : 'Razorpay API Error';
        echo json_encode(['status' => 'error', 'message' => $msg, 'details' => $result]);
    }
}

curl_close($ch);
?>
