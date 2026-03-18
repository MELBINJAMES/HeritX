<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/config.php';

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Count before
    $before = $pdo->query("SELECT COUNT(*) as c FROM items WHERE is_approved != 1 OR is_approved IS NULL")->fetch()['c'];
    
    // Approve all items
    $affected = $pdo->exec("UPDATE items SET is_approved = 1 WHERE is_approved = 0 OR is_approved IS NULL");
    
    // Count after
    $total = $pdo->query("SELECT COUNT(*) as c FROM items WHERE is_approved = 1")->fetch()['c'];

    echo json_encode([
        "status" => "success",
        "message" => "Approved $affected items. Total approved now: $total",
        "previously_pending" => $before,
        "newly_approved" => $affected,
        "total_approved" => $total
    ]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
