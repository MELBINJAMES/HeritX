<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
include 'db.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    echo json_encode([]);
    exit;
}

// Manual connection to be safe given db.php uncertainty
$host = 'localhost';
$db = 'hertix_db_v2';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    
    // Fetch bookings for items owned by this user
    $sql = "
        SELECT 
            b.id as order_id,
            b.status,
            b.booking_date,
            b.event_date,
            i.name as item_name,
            i.image_url,
            u.name as renter_name,
            u.email as renter_email
        FROM bookings b
        JOIN items i ON b.item_id = i.id
        JOIN users u ON b.user_id = u.id
        WHERE i.owner_id = ?
        ORDER BY b.created_at DESC
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($orders);

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
