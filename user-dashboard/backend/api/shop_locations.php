<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

require_once '../config/db.php';

try {
    // Return all shop owners that have at least one approved item and have coordinates
    $stmt = $pdo->query("
        SELECT 
            u.id AS shopId,
            u.name AS shopName,
            u.shop_city AS city,
            u.shop_pincode AS pincode,
            u.latitude,
            u.longitude,
            COUNT(i.id) AS totalItems
        FROM users u
        LEFT JOIN items i ON i.owner_id = u.id AND i.is_approved = 1
        WHERE u.role = 'Shop Owner'
        GROUP BY u.id
        HAVING totalItems > 0
        ORDER BY u.name ASC
    ");

    $shops = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Cast numeric types for JSON
    foreach ($shops as &$shop) {
        $shop['shopId']    = (int) $shop['shopId'];
        $shop['totalItems'] = (int) $shop['totalItems'];
        $shop['latitude']  = $shop['latitude']  !== null ? (float) $shop['latitude']  : null;
        $shop['longitude'] = $shop['longitude'] !== null ? (float) $shop['longitude'] : null;
    }

    echo json_encode($shops);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
