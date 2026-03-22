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

require_once '../../../admin/public/api/db.php'; // Use the MySQLi connection used in rentals.php
require_once '../config/config_razorpay.php';

$data = json_decode(file_get_contents("php://input"), true);

$razorpay_order_id = isset($data['razorpay_order_id']) ? $data['razorpay_order_id'] : '';
$razorpay_payment_id = isset($data['razorpay_payment_id']) ? $data['razorpay_payment_id'] : '';
$razorpay_signature = isset($data['razorpay_signature']) ? $data['razorpay_signature'] : '';

if (empty($razorpay_order_id) || empty($razorpay_payment_id) || empty($razorpay_signature)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing payment details']);
    exit;
}

$generated_signature = hash_hmac('sha256', $razorpay_order_id . "|" . $razorpay_payment_id, RAZORPAY_KEY_SECRET);

if ($generated_signature === $razorpay_signature) {
    // Payment Verified
    
    $userId = isset($data['user_id']) ? intval($data['user_id']) : 0;
    $cart = isset($data['cart']) ? $data['cart'] : [];
    $paymentMethod = isset($data['payment_method']) ? $data['payment_method'] : 'online';
    $startDate = isset($data['start_date']) ? $data['start_date'] : date('Y-m-d');
    $endDate = isset($data['end_date']) ? $data['end_date'] : date('Y-m-d');
    $totalAmount = isset($data['amount']) ? floatval($data['amount']) : 0.00;
    $duration = isset($data['duration']) ? intval($data['duration']) : 1;
    $deliveryMethod = isset($data['delivery_method']) ? $data['delivery_method'] : 'pickup';
    $pickupTime = isset($data['pickup_time']) ? $data['pickup_time'] : null;
    
    $delAddr = isset($data['address']) ? $data['address'] : null;
    $delCity = isset($data['city']) ? $data['city'] : null;
    $delPin = isset($data['pincode']) ? $data['pincode'] : null;
    $contactPhone = isset($data['contact_number']) ? $data['contact_number'] : null;
    $totalDeliveryFee = isset($data['delivery_fee']) ? floatval($data['delivery_fee']) : 0.00;
    $totalDistance = isset($data['delivery_distance']) ? floatval($data['delivery_distance']) : 0.00;

    if ($userId <= 0 || empty($cart)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid User ID or empty cart']);
        exit;
    }

    $conn->begin_transaction();

    try {
        $itemCount = count($cart);
        $feePerItem = $itemCount > 0 ? $totalDeliveryFee / $itemCount : 0;
        $rentalIds = [];

        // 1. Insert Rentals
        foreach ($cart as $item) {
            $itemTotalRaw = $item['price_per_day'] * $item['qty'] * $duration; 

            // Check for Active Shop Discount
            $discountPercent = isset($item['offer_discount_percent']) ? intval($item['offer_discount_percent']) : 0;
            $hasActiveOffer = false;
            if (!empty($item['offer_start']) && !empty($item['offer_end'])) {
                try {
                    $now = new DateTime();
                    $start = new DateTime($item['offer_start']);
                    $end = new DateTime($item['offer_end']);
                    if ($start <= $now && $end >= $now) {
                        $hasActiveOffer = true;
                    }
                } catch (Exception $e) {}
            }

            $itemTotal = $itemTotalRaw;
            if ($hasActiveOffer && $discountPercent > 0) {
                $itemDiscount = $itemTotalRaw * ($discountPercent / 100);
                $itemTotal = $itemTotalRaw - $itemDiscount;
            }

            $qty = intval($item['qty']);
            $depositPerItem = isset($item['deposit_amount']) ? floatval($item['deposit_amount']) : 0.00;

            // DEFINITIVE SET SYNTAX (Most surgical approach to prevent any shifting)
            // Hardcoded constants (3): status='confirmed', delivery_status='Pending', payment_status='paid'
            // Placeholder variables: 19
            $query = "INSERT INTO rentals SET 
                user_id = ?, 
                item_id = ?, 
                start_date = ?, 
                end_date = ?, 
                actual_return_date = NULL,
                total_amount = ?, 
                deposit_amount = ?, 
                status = 'confirmed',
                delivery_method = ?, 
                delivery_fee = ?, 
                total_price = ?, 
                delivery_address = ?, 
                city = ?, 
                pincode = ?, 
                contact_phone = ?, 
                delivery_status = 'Pending',
                pickup_time = ?, 
                payment_method = ?, 
                payment_status = 'paid',
                razorpay_order_id = ?, 
                razorpay_payment_id = ?, 
                quantity = ?, 
                total_paid = ?";
            
            $stmt = $conn->prepare($query);
            if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);

            // Bind exactly 19 parameters: iissddsddssssssssid
            // userId(1), itemId(2), startDate(3), endDate(4), totalAmount(5), depositPerItem(6), deliveryMethod(7), feePerItem(8), itemTotal(9), delAddr(10), delCity(11), delPin(12), contactPhone(13), pickupTime(14), paymentMethod(15), razorpay_order_id(16), razorpay_payment_id(17), qty(18), totalAmount(19)
            $type_string = "iissddsddssssssssid"; 
            $stmt->bind_param($type_string, $userId, $item['id'], $startDate, $endDate, $totalAmount, $depositPerItem, $deliveryMethod, $feePerItem, $itemTotal, $delAddr, $delCity, $delPin, $contactPhone, $pickupTime, $paymentMethod, $razorpay_order_id, $razorpay_payment_id, $qty, $totalAmount); 
            
            if (!$stmt->execute()) {
                error_log("Rentals Insertion Execute failed: " . $stmt->error);
                throw new Exception("Execute failed: " . $stmt->error);
            }
            $rentalIds[] = $stmt->insert_id;
            $stmt->close();

            // Decrease quantity (Automatic Stock Management)
            $orderedQty = intval($item['qty']);
            $itemId = intval($item['id']);
            $updateItem = $conn->query("UPDATE items SET quantity = quantity - $orderedQty WHERE id = $itemId AND quantity >= $orderedQty");
            if ($conn->affected_rows === 0) {
                // If we didn't update any row, it might be due to insufficient stock
                // We should check if the item exists and if the stock was enough
                $checkStock = $conn->query("SELECT quantity FROM items WHERE id = $itemId");
                $currentStock = $checkStock->fetch_assoc()['quantity'] ?? 0;
                if ($currentStock < $orderedQty) {
                    throw new Exception("Insufficient stock for item: " . ($item['name'] ?? $itemId));
                }
            }

            // Credit Shop Owner Logic
            $resOwner = $conn->query("SELECT owner_id FROM items WHERE id = " . intval($item['id']));
            if ($resOwner && $resOwner->num_rows > 0) {
                $ownerId = $resOwner->fetch_assoc()['owner_id'];
                $creditAmount = $itemTotal + $feePerItem;

                $updateWallet = $conn->query("UPDATE users SET wallet_balance = wallet_balance + $creditAmount WHERE id = $ownerId");
                if (!$updateWallet) throw new Exception("Failed to credit shop owner: " . $conn->error);

                $stmtTrans = $conn->prepare("INSERT INTO payments (user_id, amount, payment_type, status, transaction_date) VALUES (?, ?, 'credit_revenue', 'paid', NOW())");
                $stmtTrans->bind_param("id", $ownerId, $creditAmount);
                $stmtTrans->execute();
                $stmtTrans->close();
            }
        }

        // 2. Insert Payment Records
        $totalDeposit = 0;
        foreach ($cart as $item) {
            $deposit = isset($item['deposit_amount']) ? $item['deposit_amount'] : 0;
            $totalDeposit += $deposit * $item['qty'];
        }
        
        $rentAmount = $totalAmount - $totalDeposit;

        // Insert Rent Payment
        $stmt = $conn->prepare("INSERT INTO payments (user_id, amount, payment_type, status, transaction_date) VALUES (?, ?, 'rent', 'paid', NOW())");
        if (!$stmt) throw new Exception("Payment Prepare failed: " . $conn->error);
        $stmt->bind_param("id", $userId, $rentAmount);
        if (!$stmt->execute()) throw new Exception("Payment Execute failed: " . $stmt->error);
        $rentPaymentId = $stmt->insert_id;
        $stmt->close();

        // Insert Deposit Payment
        $depositPaymentId = null;
        if ($totalDeposit > 0) {
            $stmt = $conn->prepare("INSERT INTO payments (user_id, amount, payment_type, status, transaction_date) VALUES (?, ?, 'deposit', 'paid', NOW())");
            if (!$stmt) throw new Exception("Deposit Prepare failed: " . $conn->error);
            $stmt->bind_param("id", $userId, $totalDeposit);
            if (!$stmt->execute()) throw new Exception("Deposit Execute failed: " . $stmt->error);
            $depositPaymentId = $stmt->insert_id;
            $stmt->close();
        }

        // 3. Create Notification
        $title = "Payment & Booking Confirmed";
        $message = "Your online payment and rental for " . count($cart) . " items was successful.";
        $stmt = $conn->prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)");
        if (!$stmt) throw new Exception("Notification Prepare failed: " . $conn->error);
        $stmt->bind_param("iss", $userId, $title, $message);
        if (!$stmt->execute()) throw new Exception("Notification Execute failed: " . $stmt->error);
        $stmt->close();
        
        // Calculate total discount from payload
        $totalDiscount = isset($data['total_discount']) ? floatval($data['total_discount']) : 0;

        // 4. Send WhatsApp Message
        if (!empty($contactPhone)) {
            $wa_message = "Hello! Your HeritX order #$rentPaymentId is PAID & confirmed. \nItems: " . count($cart);
            if ($totalDiscount > 0) {
                $wa_message .= "\nShop Discount: -₹" . number_format($totalDiscount, 2);
            }
            $wa_message .= "\nTotal Paid: ₹$totalAmount\n";
            if ($deliveryMethod == 'delivery') {
                $wa_message .= "Delivery to: $delAddr, $delCity - $delPin";
            } else {
                $wa_message .= "Please pick up your items from our store.";
            }
            error_log("WHATSAPP_SENT: To " . $contactPhone . " -> " . str_replace("\n", " ", $wa_message));
        }

        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Payment verified and order created', 'payment_id' => $rentPaymentId, 'order_ids' => $rentalIds]);

    } catch (Exception $e) {
        $conn->rollback();
        error_log("Razorpay Verification Database Error: " . $e->getMessage());
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid Signature']);
}
?>
