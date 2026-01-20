<?php
include '../../../admin/public/api/db.php';
$sql = "ALTER TABLE users ADD COLUMN location VARCHAR(255) DEFAULT NULL";
if ($conn->query($sql) === TRUE) {
    echo "Location column added successfully";
} else {
    echo "Error adding column: " . $conn->error;
}
?>
