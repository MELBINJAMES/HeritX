<?php
include '../../../admin/public/api/db.php';

// Create Table
$sql = "CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    status ENUM('paid', 'refunded', 'pending', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "Table 'payments' created successfully.<br>";
} else {
    echo "Error creating table: " . $conn->error . "<br>";
}

// Insert Dummy Data
$sql_insert = "INSERT INTO payments (user_id, transaction_date, amount, payment_type, status) VALUES 
(1, '2026-01-15', 5000.00, 'Rent Deposit', 'paid'),
(1, '2026-01-18', 1200.00, 'Rental Fee', 'paid'),
(1, '2026-01-20', 500.00, 'Damage Refund', 'refunded')";

if ($conn->query($sql_insert) === TRUE) {
    echo "Dummy data inserted.<br>";
} else {
    echo "Error inserting data: " . $conn->error . "<br>";
}
?>
