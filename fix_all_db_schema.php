<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$root = __DIR__;
$dbPath = $root . '/admin/public/api/db.php';

if (!file_exists($dbPath)) {
    die("Database file not found at: " . $dbPath);
}

include $dbPath;
echo "Database connected.<br>\n";

function addColumnIfNotExists($conn, $table, $column, $definition) {
    $check = $conn->query("SHOW COLUMNS FROM $table LIKE '$column'");
    if ($check->num_rows == 0) {
        echo "Adding $column to $table... ";
        $sql = "ALTER TABLE $table ADD COLUMN $column $definition";
        if ($conn->query($sql)) {
            echo "Success.<br>\n";
        } else {
            echo "Error: " . $conn->error . "<br>\n";
        }
    } else {
        echo "Column $column already exists in $table.<br>\n";
    }
}

// 1. Fix Users Table (wallet_balance)
addColumnIfNotExists($conn, 'users', 'wallet_balance', "DECIMAL(10,2) DEFAULT 0.00");

// 2. Fix Rentals Table (All new fields)
addColumnIfNotExists($conn, 'rentals', 'pickup_time', "VARCHAR(50) DEFAULT NULL");
addColumnIfNotExists($conn, 'rentals', 'payment_method', "VARCHAR(50) DEFAULT 'online'");
addColumnIfNotExists($conn, 'rentals', 'delivery_fee', "DECIMAL(10,2) DEFAULT 0.00");
addColumnIfNotExists($conn, 'rentals', 'delivery_distance', "DECIMAL(10,2) DEFAULT 0.00");
addColumnIfNotExists($conn, 'rentals', 'delivery_address', "TEXT DEFAULT NULL");
addColumnIfNotExists($conn, 'rentals', 'city', "VARCHAR(100) DEFAULT NULL");
addColumnIfNotExists($conn, 'rentals', 'pincode', "VARCHAR(20) DEFAULT NULL");
addColumnIfNotExists($conn, 'rentals', 'contact_phone', "VARCHAR(20) DEFAULT NULL");
addColumnIfNotExists($conn, 'rentals', 'delivery_status', "VARCHAR(50) DEFAULT 'Pending'");
addColumnIfNotExists($conn, 'rentals', 'delivery_method', "VARCHAR(20) DEFAULT 'pickup'");

// 3. Fix Payments Table (Just in case)
// Ensure payments table exists
$conn->query("CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(50),
    status VARCHAR(50),
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP
)");

echo "All schema checks completed.";
?>
