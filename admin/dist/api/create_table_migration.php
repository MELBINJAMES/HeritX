<?php
include 'db.php';

$sql = "CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quality VARCHAR(50) DEFAULT 'Good',
    quantity INT DEFAULT 1,
    price_per_day DECIMAL(10, 2),
    deposit_amount DECIMAL(10, 2),
    description TEXT,
    image_url VARCHAR(255),
    is_available TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "Table 'items' created successfully in " . $dbname;
} else {
    echo "Error creating table: " . $conn->error;
}
?>
