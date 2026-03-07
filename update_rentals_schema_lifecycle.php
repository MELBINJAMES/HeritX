<?php
// Enable Error Reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Use existing db connection
require_once 'admin/public/api/db.php';

try {
    // Add late_days
    $conn->query("ALTER TABLE rentals ADD COLUMN IF NOT EXISTS late_days INT DEFAULT 0");
    // Add return_time
    $conn->query("ALTER TABLE rentals ADD COLUMN IF NOT EXISTS return_time DATETIME DEFAULT NULL");
    // Add total_paid (using decimal to match prices)
    $conn->query("ALTER TABLE rentals ADD COLUMN IF NOT EXISTS total_paid DECIMAL(10,2) DEFAULT 0.00");

    echo "Successfully updated rentals schema for lifecycle features.\n";
} catch (Exception $e) {
    echo "Error updating schema: " . $e->getMessage() . "\n";
}

$conn->close();
?>
