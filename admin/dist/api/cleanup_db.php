<?php
header('Content-Type: application/json');
include 'db.php';

// Turn off foreign key checks to allow truncation
$conn->query("SET FOREIGN_KEY_CHECKS = 0");

// Truncate tables
$tables = ['rentals', 'payments', 'bookings', 'notifications']; // Added bookings/notifications to be safe
foreach ($tables as $table) {
    if ($conn->query("TRUNCATE TABLE $table")) {
        echo "Truncated $table. ";
    } else {
        echo "Failed to truncate $table: " . $conn->error . ". ";
    }
}

// Reset wallet balances
if ($conn->query("UPDATE users SET wallet_balance = 0")) {
    echo "Reset wallet balances. ";
} else {
    echo "Failed to reset wallets: " . $conn->error . ". ";
}

$conn->query("SET FOREIGN_KEY_CHECKS = 1");
echo "Cleanup Complete.";
?>
