<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
include 'db.php'; // uses mysqli $conn and $dbname='Heritx'

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    echo json_encode([]);
    exit;
}

// Fetch bookings for items owned by this user
    // Fetch rentals for items owned by this user
    $sql = "
        SELECT 
            r.id as order_id,
            r.user_id,
            r.status,
            r.start_date as booking_date,
            r.created_at,
            r.total_price,
            r.payment_method,
            COALESCE(r.razorpay_payment_id, '') as razorpay_payment_id,
            COALESCE(r.razorpay_order_id, '') as razorpay_order_id,
            i.name as item_name,
            i.image_url as item_image,
            i.deposit_amount,
            u.name as renter_name,
            u.email as renter_email,
            r.contact_phone as renter_phone,
            COALESCE(r.damage_note, '') as damage_note,
            COALESCE(r.damage_deduction, 0) as damage_deduction
        FROM rentals r
        JOIN items i ON r.item_id = i.id
        JOIN users u ON r.user_id = u.id
        WHERE i.owner_id = ?
        ORDER BY r.created_at DESC
    ";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
}

echo json_encode($orders);
?>
