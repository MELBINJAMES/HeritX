<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include '../../../admin/public/api/db.php';
// echo "DEBUG: NEW FILE LOADED"; return;

$user_id = 1; // Mock User ID

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

        echo json_encode([
            "active_rentals" => $active_count,
            "pending_returns" => $pending_count,
            "upcoming_bookings" => $upcoming_count,
            "total_deposit_paid" => $total_deposit
        ]);

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
