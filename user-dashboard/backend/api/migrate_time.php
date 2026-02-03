<?php
// Use clinical error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'c:\xampp\htdocs\HertiX\admin\public\api\db.php';

echo "Starting migration...\n";

// 1. Update rentals table
$res = $conn->query("SHOW TABLES LIKE 'rentals'");
if ($res && $res->num_rows > 0) {
    echo "Updating rentals table...\n";
    $sql = "ALTER TABLE rentals 
            MODIFY start_date DATETIME NOT NULL,
            MODIFY end_date DATETIME NOT NULL";
    if ($conn->query($sql)) {
        echo "Successfully updated rentals table to use DATETIME.\n";
    } else {
        echo "Error updating rentals: " . $conn->error . "\n";
    }
} else {
    echo "Table 'rentals' not found. Skipping.\n";
}

// 2. Update bookings table
$res = $conn->query("SHOW TABLES LIKE 'bookings'");
if ($res && $res->num_rows > 0) {
    echo "Updating bookings table...\n";
    $sql = "ALTER TABLE bookings 
            MODIFY event_date DATETIME NOT NULL";
    if ($conn->query($sql)) {
        echo "Successfully updated bookings table to use DATETIME.\n";
    } else {
        echo "Error updating bookings: " . $conn->error . "\n";
    }
} else {
    echo "Table 'bookings' not found. Creating it for future use...\n";
    $sql = "CREATE TABLE bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        item_id INT NOT NULL,
        booking_date DATETIME NOT NULL,
        event_date DATETIME NOT NULL,
        status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    if ($conn->query($sql)) {
        echo "Successfully created bookings table with DATETIME support.\n";
    } else {
        echo "Error creating bookings: " . $conn->error . "\n";
    }
}

echo "Migration script finished.";
?>
