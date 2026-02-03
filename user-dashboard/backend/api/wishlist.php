<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($method === 'GET') {
    if ($user_id > 0) {
        // Fetch User's Wishlist with Item Details
        $sql = "SELECT w.id as wishlist_id, w.created_at, i.* 
                FROM wishlist w 
                JOIN items i ON w.item_id = i.id 
                WHERE w.user_id = ? 
                ORDER BY w.created_at DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll());
    } else {
        echo json_encode([]);
    }
}
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->user_id) || !isset($data->item_id)) {
        echo json_encode(["status" => "error", "message" => "Missing parameters"]);
        exit;
    }

    $u_id = intval($data->user_id);
    $i_id = intval($data->item_id);

    // Check if already exists
    $stmt = $pdo->prepare("SELECT id FROM wishlist WHERE user_id = ? AND item_id = ?");
    $stmt->execute([$u_id, $i_id]);
    $exists = $stmt->fetch();

    if ($exists) {
        // Remove it (Toggle)
        $del = $pdo->prepare("DELETE FROM wishlist WHERE id = ?");
        $del->execute([$exists['id']]);
        echo json_encode(["status" => "success", "action" => "removed", "message" => "Removed from wishlist"]);
    } else {
        // Add it
        $ins = $pdo->prepare("INSERT INTO wishlist (user_id, item_id) VALUES (?, ?)");
        $ins->execute([$u_id, $i_id]);
        echo json_encode(["status" => "success", "action" => "added", "message" => "Added to wishlist"]);
    }
}
?>
