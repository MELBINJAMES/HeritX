<?php
include '../../../admin/public/api/db.php';

// Add pickup_time column
$sql1 = "ALTER TABLE rentals ADD COLUMN pickup_time VARCHAR(20) DEFAULT NULL";
if ($conn->query($sql1)) {
    echo "Added pickup_time column. ";
} else {
    echo "Error adding pickup_time (maybe exists): " . $conn->error . ". ";
}

// Add payment_method column
$sql2 = "ALTER TABLE rentals ADD COLUMN payment_method VARCHAR(50) DEFAULT 'online'";
if ($conn->query($sql2)) {
    echo "Added payment_method column. ";
} else {
    echo "Error adding payment_method (maybe exists): " . $conn->error . ". ";
}

echo "Schema Update Complete.";
?>
