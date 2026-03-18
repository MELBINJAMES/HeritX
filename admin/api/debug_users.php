<?php
include 'db.php';
$res = $conn->query("SELECT id, name, email, role FROM users");
if ($res) {
    while($row = $res->fetch_assoc()) {
        print_r($row);
    }
} else {
    echo "Query failed: " . $conn->error;
}
?>
