<?php
header("Access-Control-Allow-Origin: *");
// echo "DEBUG: File is loaded"; // Commented out to prevent JSON error, but confirming edit.
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config/db.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if ($action === 'availability' && $id > 0) {
        // Fetch booked dates for this item
        // Status: active, confirmed, pending (if we want to block pending too)
        $sql = "SELECT start_date, end_date FROM rentals WHERE item_id = ? AND status IN ('active', 'confirmed')";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($bookings);
    } 
    elseif ($id > 0) {
        // Fetch Single Item
        $stmt = $pdo->prepare("SELECT * FROM items WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch();
        echo json_encode($item ? [$item] : []);
    } else {
        // Fetch All Items
        $stmt = $pdo->query("SELECT * FROM items WHERE is_approved = 1 ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    }
}
?>
