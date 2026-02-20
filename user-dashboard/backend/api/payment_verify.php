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
require_once '../config/db.php'; // Ensure db connection is available

$data = json_decode(file_get_contents("php://input"), true);

$razorpay_order_id = $data['razorpay_order_id'] ?? '';
$razorpay_payment_id = $data['razorpay_payment_id'] ?? '';
$razorpay_signature = $data['razorpay_signature'] ?? '';

if (empty($razorpay_order_id) || empty($razorpay_payment_id) || empty($razorpay_signature)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing payment details']);
    exit;
}

$generated_signature = hash_hmac('sha256', $razorpay_order_id . "|" . $razorpay_payment_id, RAZORPAY_KEY_SECRET);

if ($generated_signature === $razorpay_signature) {
    // Payment Verified
    
    // Extract other data to save to database
    $user_id = intval($data['user_id'] ?? 0);
    $item_id = intval($data['item_id'] ?? 0);
    $start_date = $data['start_date'] ?? date('Y-m-d');
    $end_date = $data['end_date'] ?? date('Y-m-d');
    $total_price = floatval($data['amount'] ?? 0);
    $delivery_method = $data['delivery_method'] ?? 'pickup';
    
    // Delivery fields
    $address = $data['address'] ?? '';
    $city = $data['city'] ?? '';
    $pincode = $data['pincode'] ?? '';
    $contact_number = $data['contact_number'] ?? '';

    if ($user_id <= 0 || $item_id <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid User or Item ID']);
        exit;
    }

    try {
        // Ensure columns exist or handle errors. Ideally we run a migration.
        // Updated query to match schema.sql keys: start_date, end_date (not rental_start/end)
        $stmt = $pdo->prepare("INSERT INTO rentals (user_id, item_id, start_date, end_date, total_price, status, payment_status, delivery_method, address, city, pincode, contact_number, razorpay_order_id, razorpay_payment_id) VALUES (?, ?, ?, ?, ?, 'pending', 'paid', ?, ?, ?, ?, ?, ?, ?)");
        
        if ($stmt->execute([$user_id, $item_id, $start_date, $end_date, $total_price, $delivery_method, $address, $city, $pincode, $contact_number, $razorpay_order_id, $razorpay_payment_id])) {
            echo json_encode(['status' => 'success', 'message' => 'Payment verified and order created']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Payment verified but failed to save order']);
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid Signature']);
}
?>
