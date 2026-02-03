<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
include 'db.php';

echo "<h2>Creating Wishlist Table</h2>";

$sql = "CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (user_id, item_id)
)";

if ($conn->query($sql) === TRUE) {
    echo "Table 'wishlist' created successfully.<br>";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>
