<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
include '../../../admin/public/api/db.php';

// Check if column exists
$check = $conn->query("SHOW COLUMNS FROM rentals LIKE 'pickup_time'");
if ($check->num_rows == 0) {
    echo "Column pickup_time does not exist. Adding...<br>";
    $sql = "ALTER TABLE rentals ADD COLUMN pickup_time VARCHAR(50) DEFAULT NULL";
    if ($conn->query($sql)) {
        echo "Successfully added pickup_time.<br>";
    } else {
        echo "Error adding pickup_time: " . $conn->error . "<br>";
    }
} else {
    echo "Column pickup_time already exists.<br>";
}

// Check payment_method
$check2 = $conn->query("SHOW COLUMNS FROM rentals LIKE 'payment_method'");
if ($check2->num_rows == 0) {
    echo "Column payment_method does not exist. Adding...<br>";
    $sql2 = "ALTER TABLE rentals ADD COLUMN payment_method VARCHAR(50) DEFAULT 'online'";
    if ($conn->query($sql2)) {
        echo "Successfully added payment_method.<br>";
    } else {
        echo "Error adding payment_method: " . $conn->error . "<br>";
    }
} else {
    echo "Column payment_method already exists.<br>";
}

echo "Done.";
?>
