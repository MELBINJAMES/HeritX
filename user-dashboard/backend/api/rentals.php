<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config/db.php';

// Mock User ID from Session (In real app, start_session() and check $_SESSION['user_id'])
$user_id = 1; 

$action = isset($_GET['action']) ? $_GET['action'] : 'list';

try {
    if ($action === 'summary') {
        // Dashboard Overview Summary
        $active_rentals = $pdo->prepare("SELECT COUNT(*) as count FROM rentals WHERE user_id = ? AND status = 'active'");
        $active_rentals->execute([$user_id]);
        $active_count = $active_rentals->fetch()['count'];

        $pending_returns = $pdo->prepare("SELECT COUNT(*) as count FROM rentals WHERE user_id = ? AND status = 'overdue'");
        $pending_returns->execute([$user_id]);
        $pending_count = $pending_returns->fetch()['count'];

        // Upcoming bookings (from bookings table but conceptually related to summary)
        $upcoming_bookings = $pdo->prepare("SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND status = 'confirmed' AND event_date > CURDATE()");
        $upcoming_bookings->execute([$user_id]);
        $upcoming_count = $upcoming_bookings->fetch()['count'];

        echo json_encode([
            "active_rentals" => $active_count,
            "pending_returns" => $pending_count,
            "upcoming_bookings" => $upcoming_count,
            "total_deposit_paid" => 5000.00 // Mock value or calculate from payments
        ]);
    } else {
        // List My Rentals
        $stmt = $pdo->prepare("
            SELECT r.*, i.name as item_name, i.image_url 
            FROM rentals r 
            JOIN items i ON r.item_id = i.id 
            WHERE r.user_id = ? 
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll());
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
