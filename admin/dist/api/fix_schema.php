<?php
include 'db.php';

// Force addition of columns
$columns = [
    "shop_address" => "TEXT",
    "shop_city" => "VARCHAR(255)",
    "shop_phone" => "VARCHAR(50)",
    "shop_proof" => "VARCHAR(255)"
];

foreach ($columns as $col => $type) {
    echo "Checking $col... ";
    try {
        $check = $conn->query("SELECT $col FROM users LIMIT 1");
        if ($check) {
            echo "Exists.<br>";
        } else {
            throw new Exception("Missing");
        }
    } catch (Exception $e) {
        echo "Missing. Adding... ";
        $sql = "ALTER TABLE users ADD COLUMN $col $type";
        if ($conn->query($sql) === TRUE) {
            echo "Success.<br>";
        } else {
            echo "Failed: " . $conn->error . "<br>";
        }
    }
}
$conn->close();
?>
