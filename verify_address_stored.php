<?php
include 'admin/public/api/db.php';

// Check the latest rental (presumably the one we just made)
// Actually we got payment_id 17 for RENT. But rental is inserted into rentals table.
// rentals.php logic: insert payment, then insert rental? No.
// rentals.php: 
// 1. Insert Rental (rentals table) -> Need this ID.
// 2. Insert Payment (payments table) -> Got ID 17.

// Let's get the latest rental for user_id 1.
$stmt = $conn->prepare("SELECT id, delivery_address, city, pincode, contact_phone FROM rentals WHERE user_id = ? ORDER BY id DESC LIMIT 1");
$uid = 1;
$stmt->bind_param("i", $uid);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

print_r($row);
?>
