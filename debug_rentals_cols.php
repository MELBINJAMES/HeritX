<?php
include 'admin/public/api/db.php';
$res = $conn->query("SHOW COLUMNS FROM rentals");
while($row = $res->fetch_assoc()) {
    echo $row['Field'] . "\n";
}
?>
