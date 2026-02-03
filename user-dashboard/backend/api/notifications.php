<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($method === 'GET') {
    if ($user_id > 0) {
        $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll());
    } else {
        echo json_encode([]);
    }
}
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if ($action === 'mark_read') {
        if (isset($data->id)) {
            $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?");
            $stmt->execute([$data->id]);
            echo json_encode(["status" => "success"]);
        }
    }
    elseif ($action === 'mark_all_read') {
        if (isset($data->user_id)) {
            $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
            $stmt->execute([$data->user_id]);
            echo json_encode(["status" => "success"]);
        }
    }
}
?>
