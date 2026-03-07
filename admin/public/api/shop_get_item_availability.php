<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once 'db.php';

$item_id = isset($_GET['item_id']) ? intval($_GET['item_id']) : 0;

if ($item_id <= 0) {
    echo json_encode(["status" => "error", "message" => "Invalid Item ID"]);
    exit;
}

// 1. Fetch total quantity of the item
$stmt = $conn->prepare("SELECT quantity FROM items WHERE id = ?");
$stmt->bind_param("i", $item_id);
$stmt->execute();
$res = $stmt->get_result();
$item = $res->fetch_assoc();
$stmt->close();

if (!$item) {
    echo json_encode(["status" => "error", "message" => "Item not found"]);
    exit;
}

$total_quantity = intval($item['quantity']);

// 2. Fetch all bookings for this item that are not cancelled
// We consider 'pending', 'confirmed', 'active' as occupied. 
// 'completed' orders also occupy the items until their end_date + buffer.
$stmt = $conn->prepare("
    SELECT start_date, end_date, duration 
    FROM rentals 
    WHERE item_id = ? AND status != 'cancelled'
");
$stmt->bind_param("i", $item_id);
$stmt->execute();
$result = $stmt->get_result();

$occupancy_map = []; // date => count

while ($row = $result->fetch_assoc()) {
    $start = new DateTime($row['start_date']);
    $end = new DateTime($row['end_date']);
    
    // The user wants a buffer day.
    // "Example the item returned in 19th the availability shows on the 21st"
    // This means 20th is a buffer day and is UNAVAILABLE.
    // So we add 1 day to the end date for calculation.
    $calc_end = clone $end;
    $calc_end->modify('+1 day');
    
    $interval = new DateInterval('P1D');
    $period = new DatePeriod($start, $interval, $calc_end->modify('+1 day')); // +1 day again because DatePeriod is exclusive of end date

    foreach ($period as $dt) {
        $date_str = $dt->format('Y-m-d');
        if (!isset($occupancy_map[$date_str])) {
            $occupancy_map[$date_str] = 0;
        }
        $occupancy_map[$date_str]++;
    }
}
$stmt->close();

echo json_encode([
    "status" => "success",
    "item_id" => $item_id,
    "total_quantity" => $total_quantity,
    "occupancy" => $occupancy_map
]);
?>
