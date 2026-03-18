<?php
require_once 'public/api/db.php';

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$res = $conn->query("SHOW TABLES");
while ($row = $res->fetch_row()) {
    echo $row[0] . "\n";
}
$conn->close();
?>
