<?php
include 'db.php';

try {
    $sql = "INSERT INTO users (id, name, email, password, role) VALUES
    (1, 'Melbin James', 'owner@hertix.com', 'password123', 'shop_owner'),
    (2, 'Demo Renter', 'renter@hertix.com', 'password123', 'renter')
    ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), role=VALUES(role)";
    
    if ($conn->query($sql) === TRUE) {
        echo "Users restored successfully.";
    } else {
        echo "Error restoring users: " . $conn->error;
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
