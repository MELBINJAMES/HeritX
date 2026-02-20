<?php
require_once '../config/db.php';
try {
    $stmt = $pdo->query("DESCRIBE rentals");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Columns in rentals: " . implode(", ", $columns) . "\n";
    
    $required = ['payment_status', 'delivery_method', 'address', 'city', 'pincode', 'contact_number', 'razorpay_order_id', 'razorpay_payment_id'];
    $missing = array_diff($required, $columns);
    
    if (empty($missing)) {
        echo "All Razorpay columns present.\n";
    } else {
        echo "Missing columns: " . implode(", ", $missing) . "\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
