<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database using absolute path based on __DIR__
$root = __DIR__;
$dbPath = $root . '/admin/public/api/db.php';

if (!file_exists($dbPath)) {
    die("Database file not found at: " . $dbPath);
}

include $dbPath;

echo "Database connected.<br>";

// 1. Add pickup_time column
$check = $conn->query("SHOW COLUMNS FROM rentals LIKE 'pickup_time'");
if ($check->num_rows == 0) {
    echo "Adding pickup_time column... ";
    $sql = "ALTER TABLE rentals ADD COLUMN pickup_time VARCHAR(50) DEFAULT NULL";
    if ($conn->query($sql)) {
        echo "Success.\n";
    } else {
        echo "Error: " . $conn->error . "\n";
    }
} else {
    echo "Column pickup_time already exists.\n";
}

// 2. Add payment_method column
$check2 = $conn->query("SHOW COLUMNS FROM rentals LIKE 'payment_method'");
if ($check2->num_rows == 0) {
    echo "Adding payment_method column... ";
    $sql2 = "ALTER TABLE rentals ADD COLUMN payment_method VARCHAR(50) DEFAULT 'online'";
    if ($conn->query($sql2)) {
        echo "Success.\n";
    } else {
        echo "Error: " . $conn->error . "\n";
    }
} else {
    echo "Column payment_method already exists.\n";
}

echo "Done.";
?>
