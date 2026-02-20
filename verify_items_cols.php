<?php
$conn = new mysqli('127.0.0.1', 'root', '', 'Heritx');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$res = $conn->query("SHOW COLUMNS FROM items LIKE 'is_approved'");
if ($res->num_rows > 0) {
    echo "is_approved exists\n";
} else {
    echo "is_approved missing\n";
}

$res = $conn->query("SHOW COLUMNS FROM items LIKE 'quantity'");
if ($res->num_rows > 0) {
    echo "quantity exists\n";
} else {
    echo "quantity missing\n";
}

$conn->close();
?>
