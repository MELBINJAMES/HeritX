<?php
include 'admin/public/api/db.php';
$res = $conn->query("SELECT id, item_id, start_date, end_date, status, quantity FROM rentals WHERE status != 'cancelled'");
$out = [];
while($row = $res->fetch_assoc()) $out[] = $row;
echo json_encode($out);
?>
