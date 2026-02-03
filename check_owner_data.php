<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'c:/xampp/htdocs/HertiX/admin/public/api/db.php';

echo "Database Connection Status: " . ($conn->connect_error ? "Failed" : "Success") . "\n";
echo "<h2>Items Table Analysis</h2>";

$sql = "SELECT id, owner_id, name, created_at FROM items";
$result = $conn->query($sql);

if ($result) {
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            echo "Item ID: " . $row['id'] . " | Name: " . $row['name'] . " | Owner ID: " . $row['owner_id'] . "\n";
            flush(); // Force output
        }
    } else {
        echo "0 results found in items table.";
    }
} else {
    echo "Query Failed: " . $conn->error;
}

echo "\n\n<h2>Users Table (Shop Owners)</h2>";
$userSql = "SELECT id, name, email FROM users WHERE role = 'Shop Owner' OR role = 'shop_owner'";
$userRes = $conn->query($userSql);

if ($userRes) {
    while($u = $userRes->fetch_assoc()) {
        echo "User ID: " . $u['id'] . " | Name: " . $u['name'] . " | Email: " . $u['email'] . "\n";
    }
}
?>
