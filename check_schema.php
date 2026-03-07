<?php
include 'admin/public/api/db.php';

echo "USERS TABLE:\n";
$res = $conn->query("DESCRIBE users");
while($row = $res->fetch_assoc()) {
    print_r($row);
}

echo "\nITEMS TABLE:\n";
$res = $conn->query("DESCRIBE items");
while($row = $res->fetch_assoc()) {
    print_r($row);
}
?>
