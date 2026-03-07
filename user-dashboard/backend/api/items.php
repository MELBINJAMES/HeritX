<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config/db.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if ($action === 'availability' && $id > 0) {
        // 1. Get total quantity
        $stmt = $pdo->prepare("SELECT quantity FROM items WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch();
        $total_quantity = $item ? intval($item['quantity']) : 0;

        // 2. Fetch all bookings for this item that are not cancelled
        $sql = "SELECT start_date, end_date, actual_return_date, quantity FROM rentals WHERE item_id = ? AND status != 'cancelled'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $occupancy_map = []; // date => count
        $recovery_map = [];  // date => recovery_count

        foreach ($bookings as $booking) {
            $start = new DateTime($booking['start_date']);
            // Priority: actual_return_date > end_date
            $end_date_str = !empty($booking['actual_return_date']) ? $booking['actual_return_date'] : $booking['end_date'];
            $end = new DateTime($end_date_str);
            
            // turnover buffer: unavailable on day after return
            $calc_end = clone $end;
            $calc_end->modify('+1 day');
            
            $interval = new DateInterval('P1D');
            $period = new DatePeriod($start, $interval, $calc_end->modify('+1 day'));

            foreach ($period as $dt) {
                $date_str = $dt->format('Y-m-d');
                if (!isset($occupancy_map[$date_str])) {
                    $occupancy_map[$date_str] = 0;
                }
                $occupancy_map[$date_str] += intval($booking['quantity']);
            }

            // Recovery: Day after buffer
            $recovery_date = clone $calc_end;
            $recovery_date->modify('+1 day');
            $rec_str = $recovery_date->format('Y-m-d');
            if (!isset($recovery_map[$rec_str])) {
                $recovery_map[$rec_str] = 0;
            }
            $recovery_map[$rec_str] += intval($booking['quantity']);
        }

        echo json_encode([
            "status" => "success",
            "total_quantity" => $total_quantity,
            "occupancy" => $occupancy_map,
            "recovery" => $recovery_map
        ]);
    } elseif ($id > 0) {
        // Fetch Single Item with Shop Info
        $stmt = $pdo->prepare("SELECT i.*, COALESCE(op.shop_name, u.name) as shop_name, u.shop_city, u.shop_pincode, u.latitude, u.longitude, COALESCE(op.profile_photo, u.profile_image) as shop_image, u.offer_message, u.offer_title, u.offer_start, u.offer_end, u.offer_discount_percent
                               FROM items i 
                               JOIN users u ON i.owner_id = u.id 
                               LEFT JOIN owner_profile op ON op.owner_id = u.id
                               WHERE i.id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch();
        echo json_encode($item ? [$item] : []);
    } else {
        // Fetch All Items or Filtered by Location
        $city = isset($_GET['city']) ? $_GET['city'] : '';
        $pincode = isset($_GET['pincode']) ? $_GET['pincode'] : '';

        if ($city || $pincode) {
            $stmt = $pdo->prepare("SELECT i.*, COALESCE(op.shop_name, u.name) as shop_name, u.shop_city, u.shop_pincode,
                                          u.latitude as shop_lat, u.longitude as shop_lng, COALESCE(op.profile_photo, u.profile_image) as shop_image, u.offer_message, u.offer_title, u.offer_start, u.offer_end, u.offer_discount_percent
                                   FROM items i
                                   JOIN users u ON i.owner_id = u.id
                                   LEFT JOIN owner_profile op ON op.owner_id = u.id
                                   WHERE i.is_approved = 1 AND (u.shop_city = ? OR u.shop_pincode = ?)
                                   ORDER BY i.created_at DESC");
            $stmt->execute([$city, $pincode]);
        } else {
            $stmt = $pdo->query("SELECT i.*, COALESCE(op.shop_name, u.name) as shop_name, u.shop_city, u.shop_pincode,
                                        u.latitude as shop_lat, u.longitude as shop_lng, COALESCE(op.profile_photo, u.profile_image) as shop_image, u.offer_message, u.offer_title, u.offer_start, u.offer_end, u.offer_discount_percent
                                 FROM items i
                                 JOIN users u ON i.owner_id = u.id
                                 LEFT JOIN owner_profile op ON op.owner_id = u.id
                                 WHERE i.is_approved = 1
                                 ORDER BY i.created_at DESC");
        }
        echo json_encode($stmt->fetchAll());
    }
}
?>
