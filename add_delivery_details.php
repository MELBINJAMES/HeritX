<?php
include 'admin/public/api/db.php';

// Add columns to rentals table
$queries = [
    "ALTER TABLE rentals ADD COLUMN delivery_address TEXT DEFAULT NULL",
    "ALTER TABLE rentals ADD COLUMN city VARCHAR(100) DEFAULT NULL",
    "ALTER TABLE rentals ADD COLUMN pincode VARCHAR(20) DEFAULT NULL",
    "ALTER TABLE rentals ADD COLUMN contact_phone VARCHAR(20) DEFAULT NULL"
];

foreach ($queries as $sql) {
    if ($conn->query($sql) === TRUE) {
        echo "Successfully executd: $sql\n";
    } else {
        echo "Error executing $sql: " . $conn->error . "\n";
    }
}

// Verify
$res = $conn->query("DESCRIBE rentals");
while($row = $res->fetch_assoc()) {
    print_r($row);
}
?>
