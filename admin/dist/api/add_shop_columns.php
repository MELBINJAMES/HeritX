<?php
include 'db.php';

$queries = [
    "ALTER TABLE users ADD COLUMN shop_address VARCHAR(255) NULL",
    "ALTER TABLE users ADD COLUMN shop_city VARCHAR(100) NULL",
    "ALTER TABLE users ADD COLUMN shop_pincode VARCHAR(20) NULL",
    "ALTER TABLE users ADD COLUMN shop_phone VARCHAR(20) NULL",
    "ALTER TABLE users ADD COLUMN shop_proof VARCHAR(255) NULL",
    "ALTER TABLE users ADD COLUMN lat DECIMAL(10,8) NULL",
    "ALTER TABLE users ADD COLUMN lng DECIMAL(11,8) NULL",
    "ALTER TABLE users ADD COLUMN is_approved TINYINT(1) DEFAULT 0"
];

foreach ($queries as $sql) {
    if ($conn->query($sql) === TRUE) {
        echo "Column added successfully: $sql\n";
    } else {
        echo "Error adding column: " . $conn->error . "\n";
    }
}

$conn->close();
?>
