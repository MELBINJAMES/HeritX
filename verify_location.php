<?php
include 'admin/public/api/db.php';

echo "VERIFYING DATABASE SCHEMA:\n";
$schema_query = $conn->query("SHOW COLUMNS FROM users LIKE 'shop_pincode'");
if ($schema_query->num_rows > 0) {
    echo "SUCCESS: Column 'shop_pincode' exists in 'users' table.\n";
} else {
    echo "ERROR: Column 'shop_pincode' NOT found.\n";
}

echo "\nVERIFYING SHOP OWNERS & ITEMS JOIN:\n";
$res = $conn->query("SELECT u.id, u.name, u.shop_city, u.shop_pincode, COUNT(i.id) as item_count 
                    FROM users u 
                    LEFT JOIN items i ON u.id = i.owner_id 
                    WHERE u.role='Shop Owner' 
                    GROUP BY u.id 
                    LIMIT 5");

if ($res && $res->num_rows > 0) {
    while($row = $res->fetch_assoc()) {
        echo "Shop: {$row['name']} (ID: {$row['id']}) Location: {$row['shop_city']} - {$row['shop_pincode']} Items: {$row['item_count']}\n";
    }
} else {
    echo "No shop owners found.";
}
?>
