<?php
require_once 'public/api/db.php';

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$columns = ['dos', 'donts'];
foreach ($columns as $col) {
    $res = $conn->query("SHOW COLUMNS FROM items LIKE '$col'");
    if ($res->num_rows > 0) {
        echo "$col exists\n";
    } else {
        echo "$col missing\n";
    }
}

$conn->close();
?>
