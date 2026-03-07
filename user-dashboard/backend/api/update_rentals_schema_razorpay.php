<?php
// Enable Error Reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once '../config/db.php';

try {
    $queries = [
        "ALTER TABLE rentals ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid'",
        "ALTER TABLE rentals ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(20) DEFAULT 'pickup'",
        "ALTER TABLE rentals ADD COLUMN IF NOT EXISTS address TEXT",
        "ALTER TABLE rentals ADD COLUMN IF NOT EXISTS city VARCHAR(100)",
        "ALTER TABLE rentals ADD COLUMN IF NOT EXISTS pincode VARCHAR(20)",
        "ALTER TABLE rentals ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20)",
        "ALTER TABLE rentals ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100)",
        "ALTER TABLE rentals ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100)",
        "ALTER TABLE rentals ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 1"
    ];

    foreach ($queries as $sql) {
        $pdo->exec($sql);
        echo "Executed: $sql <br>";
    }

    echo "Rentals table simplified schema update complete for Razorpay.";

} catch (PDOException $e) {
    echo "Error updating schema: " . $e->getMessage();
}
?>
