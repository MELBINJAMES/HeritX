<?php
include 'db.php';

// Add quantity column, default 1
$sql = "ALTER TABLE items ADD COLUMN quantity INT DEFAULT 1 AFTER quality";

if ($conn->query($sql) === TRUE) {
    echo "Column 'quantity' added successfully";
} else {
    // Check if duplicate column error (Code 1060)
    if ($conn->errno == 1060) {
        echo "Column 'quantity' already exists.";
    } else {
        echo "Error adding column: " . $conn->error;
    }
}

$conn->close();
?>
