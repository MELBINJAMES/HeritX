<?php
include 'admin/public/api/db.php';
$res = $conn->query('SELECT id, name, quantity FROM items');
$out = [];
while($row = $res->fetch_assoc()) $out[] = $row;
echo json_encode($out);
?>
