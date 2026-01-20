<?php
include '../../../admin/public/api/db.php';
$sql = "ALTER TABLE users 
ADD COLUMN gender ENUM('Male', 'Female', 'Other') DEFAULT NULL,
ADD COLUMN dob DATE DEFAULT NULL,
ADD COLUMN bio TEXT DEFAULT NULL,
ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL";

if ($conn->query($sql) === TRUE) {
    echo "Extended columns added successfully";
} else {
    echo "Error adding columns: " . $conn->error;
}
?>
