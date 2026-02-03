<?php
header('Content-Type: application/json');
require 'c:/xampp/htdocs/HertiX/user-dashboard/backend/config/db.php';

try {
    $stmt = $pdo->query("UPDATE items SET is_approved = 1");
    echo json_encode(["status" => "success", "message" => "All items verified and approved."]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
