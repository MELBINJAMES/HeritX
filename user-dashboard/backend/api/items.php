<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config/db.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$occasion = isset($_GET['occasion']) ? $_GET['occasion'] : '';

try {
    if ($id > 0) {
        // Get Single Item details
        $stmt = $pdo->prepare("SELECT * FROM items WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch();
        echo json_encode($item ? $item : ["error" => "Item not found"]);
    } elseif ($occasion) {
        // Filter by Occasion (Recommendations)
        $stmt = $pdo->prepare("SELECT * FROM items WHERE occasion = ?");
        $stmt->execute([$occasion]);
        echo json_encode($stmt->fetchAll());
    } else {
        // List all items
        $stmt = $pdo->query("SELECT * FROM items");
        echo json_encode($stmt->fetchAll());
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
