<?php
include 'admin/public/api/db.php';
$res = $conn->query("SELECT id, status, payment_method, item_id, user_id FROM rentals ORDER BY id DESC LIMIT 5");
while($row = $res->fetch_assoc()) {
    echo json_encode($row) . "\n";
}
?>
