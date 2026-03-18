<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Razorpay Credentials (Test Mode) — same key as User Dashboard
define('RAZORPAY_KEY_ID',     'rzp_test_SKRfndOwhJc8en');
define('RAZORPAY_KEY_SECRET', 'zE5u0yT0cqkFf2OhAqnKUJm4');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['amount'])) {
    echo json_encode(['status' => 'error', 'message' => 'Amount is required']);
    exit;
}

$amount   = intval($data['amount']) * 100; // Convert to paise
$currency = 'INR';
$receipt  = 'owner_rcpt_' . time();

$post_data = json_encode([
    'amount'          => $amount,
    'currency'        => $currency,
    'receipt'         => $receipt,
    'payment_capture' => 1
]);

$ch = curl_init("https://api.razorpay.com/v1/orders");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, RAZORPAY_KEY_ID . ":" . RAZORPAY_KEY_SECRET);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
// Disable SSL verification for local XAMPP development
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response  = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo json_encode(['status' => 'error', 'message' => 'cURL Error: ' . curl_error($ch)]);
} else {
    $result = json_decode($response, true);
    if ($http_code === 200 && isset($result['id'])) {
        echo json_encode([
            'status'   => 'success',
            'order_id' => $result['id'],
            'amount'   => $amount,
            'key_id'   => RAZORPAY_KEY_ID
        ]);
    } else {
        $msg = isset($result['error']['description']) ? $result['error']['description'] : 'Razorpay API Error';
        echo json_encode(['status' => 'error', 'message' => $msg]);
    }
}

curl_close($ch);
?>
