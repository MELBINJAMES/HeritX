<?php
include 'db.php';
$sql = "ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL, ADD COLUMN address TEXT DEFAULT NULL";
if ($conn->query($sql) === TRUE) {
    echo "Columns added successfully";
} else {
    echo "Error adding columns: " . $conn->error;
}
?>
