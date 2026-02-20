<?php
include 'admin/public/api/db.php';

// Fetch the latest payment
$res = $conn->query("SELECT * FROM payments ORDER BY id DESC LIMIT 1");
if ($row = $res->fetch_assoc()) {
    $id = $row['id'];
    $amount = $row['amount'];
    $userId = $row['user_id'];
    
    // Assume 50% deposit for demo if it's a large amount, or fixed
    // Let's split it: Rent = Amount - 500, Deposit = 500 (if amount > 500)
    // Or just make it simple: 
    $deposit = 2000.00; 
    $rent = $amount - $deposit;
    
    if ($rent < 0) {
        $deposit = $amount / 2;
        $rent = $amount / 2;
    }

    // Update the original row to be Rent
    $stmt = $conn->prepare("UPDATE payments SET amount = ?, payment_type = 'rent' WHERE id = ?");
    $stmt->bind_param("di", $rent, $id);
    $stmt->execute();
    
    // Insert new row for Deposit
    $stmt = $conn->prepare("INSERT INTO payments (user_id, amount, payment_type, status, transaction_date) VALUES (?, ?, 'deposit', 'paid', NOW())");
    $stmt->bind_param("id", $userId, $deposit);
    $stmt->execute();
    
    echo "Split Payment ID $id ($amount) into Rent: $rent and Deposit: $deposit";
}
?>
