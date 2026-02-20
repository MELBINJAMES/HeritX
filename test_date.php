<?php
include 'admin/public/api/db.php';
$stmt = $conn->prepare("SELECT transaction_date FROM payments ORDER BY id DESC LIMIT 1");
$stmt->execute();
$res = $stmt->get_result();
if ($row = $res->fetch_assoc()) {
    echo "Latest Date: " . $row['transaction_date'];
} else {
    echo "No payments found.";
}
?>
