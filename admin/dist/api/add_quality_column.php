<?php
include 'db.php';

$sql = "ALTER TABLE items ADD COLUMN quality VARCHAR(50) DEFAULT 'Good' AFTER category";

if ($conn->query($sql) === TRUE) {
    echo "Column 'quality' added successfully";
} else {
    echo "Error adding column: " . $conn->error;
}

$conn->close();
?>
