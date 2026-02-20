<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include '../../../admin/public/api/db.php';
// echo "DEBUG: NEW FILE LOADED"; return;

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0 && $action !== 'availability' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Invalid User ID"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['user_id']) || !isset($data['cart']) || empty($data['cart'])) {
        echo json_encode(["status" => "error", "message" => "Invalid data provided"]);
        exit;
    }

    $userId = $data['user_id'];
    $cart = $data['cart'];
    $paymentMethod = $data['payment_method'];
    $startDate = $data['start_date'];
    $endDate = $data['end_date'];
    $totalAmount = $data['total_amount'];
    $pickupTime = isset($data['pickup_time']) ? $data['pickup_time'] : null;

    // Suppress display errors to prevent JSON corruption
    // Suppress display errors to prevent JSON corruption, but log them
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', 'php_errors.log');
    error_reporting(E_ALL);

    $conn->begin_transaction();

    try {
        // Calculate delivery fee distribution
        $totalDeliveryFee = isset($data['delivery_fee']) ? floatval($data['delivery_fee']) : 0.00;
        $totalDistance = isset($data['delivery_distance']) ? floatval($data['delivery_distance']) : 0.00;
        $itemCount = count($cart);
        $feePerItem = $itemCount > 0 ? $totalDeliveryFee / $itemCount : 0;

        // 1. Insert Rentals
        foreach ($cart as $item) {
            // Calculate total price for this item based on duration
            $itemTotal = $item['price_per_day'] * $item['qty'] * $data['duration']; 
            
            // Prepare variables for binding (avoid pass-by-reference error)
            $delAddr = isset($data['delivery_address']) ? $data['delivery_address'] : null;
            $delCity = isset($data['city']) ? $data['city'] : null;
            $delPin = isset($data['pincode']) ? $data['pincode'] : null;
            $contactPhone = isset($data['phone']) ? $data['phone'] : null;
            
            // Auto-confirm all orders (no pending/approval step per user request)
            $status = 'active';

            // Using delivery_fee column instead of delivery_charge
            $stmt = $conn->prepare("INSERT INTO rentals (user_id, item_id, start_date, end_date, total_price, status, delivery_method, delivery_fee, delivery_distance, delivery_address, city, pincode, contact_phone, delivery_status, pickup_time, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)");
            
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $conn->error);
            }

            // Types: iissdssddssssss (15 types for 15 variables)
            $stmt->bind_param("iissdssddssssss", $userId, $item['id'], $startDate, $endDate, $itemTotal, $status, $data['delivery_method'], $feePerItem, $totalDistance, $delAddr, $delCity, $delPin, $contactPhone, $pickupTime, $paymentMethod); 
            
            if (!$stmt->execute()) {
                 throw new Exception("Execute failed: " . $stmt->error);
            }
            $stmt->close();

            // Decrease quantity
            $updateItem = $conn->query("UPDATE items SET quantity = quantity - " . intval($item['qty']) . " WHERE id = " . intval($item['id']));
            if (!$updateItem) {
                throw new Exception("Failed to update item stock: " . $conn->error);
            }

            // Credit Shop Owner Logic
            // Fetch owner_id first
            $resOwner = $conn->query("SELECT owner_id FROM items WHERE id = " . intval($item['id']));
            if ($resOwner && $resOwner->num_rows > 0) {
                $ownerId = $resOwner->fetch_assoc()['owner_id'];
                
                // Calculate amount to credit (Item Total + Delivery Fee Share)
                // Deposit is usually held by platform or separate, here we credit rent + delivery to owner
                $creditAmount = $itemTotal + $feePerItem;

                // Update Owner Wallet
                $updateWallet = $conn->query("UPDATE users SET wallet_balance = wallet_balance + $creditAmount WHERE id = $ownerId");
                if (!$updateWallet) {
                    throw new Exception("Failed to credit shop owner: " . $conn->error);
                }

                // Log transaction for owner (Optional, but good for tracking)
                $stmtTrans = $conn->prepare("INSERT INTO payments (user_id, amount, payment_type, status, transaction_date) VALUES (?, ?, 'credit_revenue', 'completed', NOW())");
                $stmtTrans->bind_param("id", $ownerId, $creditAmount);
                $stmtTrans->execute();
                $stmtTrans->close();
            }
        }

        // 2. Insert Payment Records (Rent + Deposit)
        // Calculate Total Deposit based on cart items
        $totalDeposit = 0;
        foreach ($cart as $item) {
            $deposit = isset($item['deposit_amount']) ? $item['deposit_amount'] : 0;
            $totalDeposit += $deposit * $item['qty'];
        }
        
        $rentAmount = $totalAmount - $totalDeposit;
        $paymentStatus = ($paymentMethod === 'cod') ? 'pending' : 'paid';

        // Insert Rent Record
        // Use NOW() to ensure date is correct
        $stmt = $conn->prepare("INSERT INTO payments (user_id, amount, payment_type, status, transaction_date) VALUES (?, ?, 'rent', ?, NOW())");
        if (!$stmt) {
             throw new Exception("Payment Prepare failed: " . $conn->error);
        }
        $stmt->bind_param("ids", $userId, $rentAmount, $paymentStatus);
        if (!$stmt->execute()) {
             throw new Exception("Payment Execute failed: " . $stmt->error);
        }
        $rentPaymentId = $stmt->insert_id;
        $stmt->close();

        // Insert Deposit Record (if applicable)
        $depositPaymentId = null;
        if ($totalDeposit > 0) {
            $stmt = $conn->prepare("INSERT INTO payments (user_id, amount, payment_type, status, transaction_date) VALUES (?, ?, 'deposit', ?, NOW())");
            if (!$stmt) {
                 throw new Exception("Deposit Prepare failed: " . $conn->error);
            }
            $stmt->bind_param("ids", $userId, $totalDeposit, $paymentStatus);
            if (!$stmt->execute()) {
                 throw new Exception("Deposit Execute failed: " . $stmt->error);
            }
            $depositPaymentId = $stmt->insert_id;
            $stmt->close();
        }

        // 3. Create Notification
        $title = "Booking Confirmed";
        $message = "Your rental for " . count($cart) . " items has been confirmed from $startDate to $endDate.";
        $stmt = $conn->prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)");
        if (!$stmt) {
             throw new Exception("Notification Prepare failed: " . $conn->error);
        }
        $stmt->bind_param("iss", $userId, $title, $message);
        if (!$stmt->execute()) {
             throw new Exception("Notification Execute failed: " . $stmt->error);
        }
        $stmt->close();
        
        // 4. Send WhatsApp Message (Simulated)
        if (!empty($data['phone'])) {
            $wa_message = "Hello! Your HeritX order #$rentPaymentId is confirmed. \nItems: " . count($cart) . "\nAmount: ₹$totalAmount\n";
            if ($data['delivery_method'] == 'delivery') {
                $wa_message .= "Delivery to: " . $data['delivery_address'] . ", " . $data['city'] . " - " . $data['pincode'];
            } else {
                $wa_message .= "Please pick up your items from our store.";
            }
            // Log simulated sending
            error_log("WHATSAPP_SENT: To " . $data['phone'] . " -> " . str_replace("\n", " ", $wa_message));
        }

        $conn->commit();
        echo json_encode([
            "status" => "success", 
            "message" => "Order placed successfully. WhatsApp confirmation sent!",
            "payment_ids" => [
                "rent" => $rentPaymentId,
                "deposit" => $depositPaymentId
            ]
        ]);

    } catch (Throwable $e) {
        $conn->rollback();
        // Log the error for admin debug
        error_log("Payment Error: " . $e->getMessage());
        // Return JSON error
        echo json_encode(["status" => "error", "message" => "Order failed: " . $e->getMessage(), "trace" => $e->getTraceAsString()]);
    }
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : 'list';

try {
    if ($action === 'summary') {
        // 1. Active Rentals
        $active_count = 0;
        $res = $conn->query("SELECT COUNT(*) as count FROM rentals WHERE user_id = $user_id AND status = 'active'");
        if ($res) {
            $active_count = $res->fetch_assoc()['count'];
        }

        // 2. Pending Returns
        $pending_count = 0;
        $res = $conn->query("SELECT COUNT(*) as count FROM rentals WHERE user_id = $user_id AND status = 'overdue'");
        if ($res) {
            $pending_count = $res->fetch_assoc()['count'];
        }

        // 3. Upcoming Bookings (Check if table exists first or suppress error)
        $upcoming_count = 0;
        // Simple check if booking table exists to avoid crash
        $check_table = $conn->query("SHOW TABLES LIKE 'bookings'");
        if ($check_table && $check_table->num_rows > 0) {
            $res = $conn->query("SELECT COUNT(*) as count FROM bookings WHERE user_id = $user_id AND status = 'confirmed' AND event_date > CURDATE()");
            if ($res) {
                $upcoming_count = $res->fetch_assoc()['count'];
            }
        }

        // 4. Total Deposit (Mock or from payments)
        $total_deposit = 0;
        $check_pay = $conn->query("SHOW TABLES LIKE 'payments'");
        if ($check_pay && $check_pay->num_rows > 0) {
            $res = $conn->query("SELECT SUM(amount) as total FROM payments WHERE user_id = $user_id AND payment_type LIKE '%Deposit%'");
            if ($res) {
                $row = $res->fetch_assoc();
                $total_deposit = $row['total'] ? $row['total'] : 0;
            }
        }

        // 5. Recent Activity (Top 3 Rentals)
        $recent_activity = [];
        $res = $conn->query("
            SELECT r.*, i.name as item_name 
            FROM rentals r 
            JOIN items i ON r.item_id = i.id 
            WHERE r.user_id = $user_id 
            ORDER BY r.created_at DESC 
            LIMIT 3
        ");
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $recent_activity[] = $row;
            }
        }

        echo json_encode([
            "active_rentals" => $active_count,
            "pending_returns" => $pending_count,
            "upcoming_bookings" => $upcoming_count,
            "total_deposit_paid" => $total_deposit,
            "recent_activity" => $recent_activity
        ]);

    } elseif ($action === 'availability') {
        $item_id = isset($_GET['item_id']) ? intval($_GET['item_id']) : 0;
        $booked_dates = [];
        if ($item_id > 0) {
            $stmt = $conn->prepare("SELECT start_date, end_date FROM rentals WHERE item_id = ? AND status IN ('active', 'pending')");
            $stmt->bind_param("i", $item_id);
            $stmt->execute();
            $result = $stmt->get_result();
            while ($row = $result->fetch_assoc()) {
                $booked_dates[] = $row;
            }
            $stmt->close();
        }
        echo json_encode($booked_dates);
    } else {
        // List Rentals
        $history = [];
        $stmt = $conn->prepare("
            SELECT r.*, i.name as item_name, i.image_url 
            FROM rentals r 
            LEFT JOIN items i ON r.item_id = i.id 
            WHERE r.user_id = ? 
            ORDER BY r.created_at DESC
        ");
        if ($stmt) {
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            while ($row = $result->fetch_assoc()) {
                $history[] = $row;
            }
            $stmt->close();
        }
        echo json_encode($history);
    }
} catch (Exception $e) {
    echo json_encode(["active_rentals" => 0, "error" => $e->getMessage()]);
}
?>
