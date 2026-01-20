<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->order_id) || !isset($data->action)) {
    echo json_encode(["status" => "error", "message" => "Missing parameters"]);
    exit;
}

$order_id = intval($data->order_id);
$action = $data->action;
$status = '';

switch ($action) {
    case 'approve':
        $status = 'active'; // In rental logic, approve might move to 'confirmed' or directly 'active' if starting today. Let's say 'active' for simplicity or 'confirmed'. Let's use 'active' (rented out).
        break;
    case 'complete':
        $status = 'completed';
        break;
    case 'cancel':
        $status = 'cancelled';
        break;
    default:
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
        exit;
}

// Manual connection fallback if db.php is acting up, but let's assume standard PDO from db.php or make one
$host = 'localhost';
$db = 'hertix_db_v2';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "UPDATE bookings SET status = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$status, $order_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success", "message" => "Order updated to $status"]);
    } else {
        echo json_encode(["status" => "error", "message" => "No changes made or order not found"]);
    }

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
