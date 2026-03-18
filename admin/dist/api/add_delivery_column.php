<?php
include 'db.php';

try {
    // Add delivery_method column
    $conn->query("ALTER TABLE rentals ADD COLUMN delivery_method ENUM('pickup', 'delivery') DEFAULT 'pickup'");
    echo "Added delivery_method column.<br>";
} catch (Exception $e) {
    echo "delivery_method column might already exist or error: " . $e->getMessage() . "<br>";
}

try {
    // Add delivery_charge column
    $conn->query("ALTER TABLE rentals ADD COLUMN delivery_charge DECIMAL(10,2) DEFAULT 0.00");
    echo "Added delivery_charge column.<br>";
} catch (Exception $e) {
    echo "delivery_charge column might already exist or error: " . $e->getMessage() . "<br>";
}

try {
    // Add total_price column
    $conn->query("ALTER TABLE rentals ADD COLUMN total_price DECIMAL(10,2) DEFAULT 0.00");
    echo "Added total_price column.<br>";
} catch (Exception $e) {
    echo "total_price column might already exist or error: " . $e->getMessage() . "<br>";
}

echo "Schema updated successfully via PHP script.";
?>
