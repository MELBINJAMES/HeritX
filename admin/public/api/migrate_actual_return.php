<?php
include 'db.php';

// Add actual_return_date to rentals table
$sql = "ALTER TABLE rentals ADD COLUMN actual_return_date DATE NULL AFTER end_date";
if ($conn->query($sql)) {
    echo json_encode(["status" => "success", "message" => "Column actual_return_date added successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => "Error adding column: " . $conn->error]);
}
?>
