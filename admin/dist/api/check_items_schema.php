<?php
include 'db.php';
$res = $conn->query("SHOW CREATE TABLE items");
if ($res) {
    $row = $res->fetch_array();
    echo "<pre>" . $row[1] . "</pre>";
} else {
    echo "Error: " . $conn->error;
}
?>
