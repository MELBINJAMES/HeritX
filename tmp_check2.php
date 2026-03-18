<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=HeritX;charset=utf8', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Run the EXACT query from items.php
    $stmt = $pdo->query("SELECT i.*, COALESCE(op.shop_name, u.name) as shop_name, u.shop_city, u.shop_pincode,
                                u.latitude as shop_lat, u.longitude as shop_lng,
                                COALESCE(op.profile_photo, u.profile_image) as shop_image,
                                u.offer_message, u.offer_title, u.offer_start, u.offer_end, u.offer_discount_percent
                         FROM items i
                         JOIN users u ON i.owner_id = u.id
                         LEFT JOIN owner_profile op ON op.owner_id = u.id
                         WHERE i.is_approved = 1
                         ORDER BY i.created_at DESC");
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Query returned " . count($items) . " items\n";
    foreach ($items as $item) {
        echo "ID {$item['id']}: {$item['name']} | img={$item['image_url']} | owner_id={$item['owner_id']} | shop={$item['shop_name']}\n";
        // Check if image file exists
        $imgPath = "C:\\xampp\\htdocs\\HertiX\\" . $item['image_url'];
        $exists = file_exists($imgPath) ? "FILE EXISTS" : "MISSING FILE";
        echo "  -> XAMPP path: $imgPath [$exists]\n";
    }
    
    // Also test JSON output like the API
    header('Content-Type: application/json');
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
