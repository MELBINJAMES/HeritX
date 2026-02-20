<?php
include 'admin/public/api/db.php';
$res = $conn->query("DESCRIBE rentals");
while($row = $res->fetch_assoc()) {
    print_r($row);
}
?>
