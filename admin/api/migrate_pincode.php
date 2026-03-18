<?php
include 'db.php';

$sql = "ALTER TABLE users ADD COLUMN shop_pincode VARCHAR(10) AFTER shop_city";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success", "message" => "Column 'shop_pincode' added to 'users' table successfully."]);
} else {
    // If it already exists, just report success (idempotent)
    if (strpos($conn->error, 'Duplicate column name') !== false) {
        echo json_encode(["status" => "success", "message" => "Column 'shop_pincode' already exists."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error adding column: " . $conn->error]);
    }
}
$conn->close();
?>
