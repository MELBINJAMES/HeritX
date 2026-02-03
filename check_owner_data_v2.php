<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'c:/xampp/htdocs/HertiX/admin/public/api/db.php';

$logFile = 'c:/xampp/htdocs/HertiX/debug_results.log';
$output = "";

$output .= "Database Connection Status: " . ($conn->connect_error ? "Failed" : "Success") . "\n";
$output .= "--------------------------------------------------\n";
$output .= "ITEMS TABLE ANALYSIS:\n";

$sql = "SELECT id, owner_id, name, created_at FROM items";
$result = $conn->query($sql);

if ($result) {
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $output .= "Item ID: " . $row['id'] . " | Name: " . $row['name'] . " | Owner ID: " . $row['owner_id'] . "\n";
        }
    } else {
        $output .= "0 results found in items table.\n";
    }
} else {
    $output .= "Query Failed: " . $conn->error . "\n";
}

$output .= "--------------------------------------------------\n";
$output .= "USERS TABLE (SHOP OWNERS):\n";
$userSql = "SELECT id, name, email FROM users WHERE role = 'Shop Owner' OR role = 'shop_owner'";
$userRes = $conn->query($userSql);

if ($userRes) {
    while($u = $userRes->fetch_assoc()) {
        $output .= "User ID: " . $u['id'] . " | Name: " . $u['name'] . " | Email: " . $u['email'] . "\n";
    }
}

file_put_contents($logFile, $output);
echo "Debug complete. Check debug_results.log";
?>
