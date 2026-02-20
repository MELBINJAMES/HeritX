<?php
include 'admin/public/api/db.php';
$stmt = $conn->prepare("SELECT id, payment_type, amount, status, transaction_date FROM payments ORDER BY id DESC LIMIT 5");
$stmt->execute();
$res = $stmt->get_result();
$rows = [];
while ($row = $res->fetch_assoc()) {
    $rows[] = $row;
}
echo json_encode($rows, JSON_PRETTY_PRINT);
?>
