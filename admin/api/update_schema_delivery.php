<?php
require 'db.php';

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

$columns = [
    "delivery_method" => "ENUM('pickup', 'delivery') DEFAULT 'pickup'",
    "delivery_address" => "TEXT",
    "delivery_city" => "VARCHAR(100)",
    "delivery_pincode" => "VARCHAR(20)",
    "contact_number" => "VARCHAR(20)",
    "delivery_fee" => "DECIMAL(10,2) DEFAULT 0.00",
    "delivery_distance" => "DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Distance in km'",
    "delivery_status" => "ENUM('Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled') DEFAULT 'Pending'"
];

$table = 'rentals';
$messages = [];

foreach ($columns as $col => $def) {
    $check = $conn->query("SHOW COLUMNS FROM $table LIKE '$col'");
    if ($check->num_rows == 0) {
        $sql = "ALTER TABLE $table ADD COLUMN $col $def";
        if ($conn->query($sql) === TRUE) {
            $messages[] = "Added column '$col'";
        } else {
            $messages[] = "Error adding '$col': " . $conn->error;
        }
    } else {
        $messages[] = "Column '$col' already exists";
    }
}

echo json_encode(["status" => "success", "updates" => $messages]);
$conn->close();
?>
