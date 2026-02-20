<?php
$conn = new mysqli('127.0.0.1', 'root', '', 'Heritx');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$tables = ['users', 'shopowners', 'items'];
foreach ($tables as $table) {
    $res = $conn->query("SELECT COUNT(*) as count FROM $table");
    if ($res) {
        $row = $res->fetch_assoc();
        echo "Table '$table' has " . $row['count'] . " rows.\n";
    } else {
        echo "Table '$table' does not exist or error.\n";
    }
}

$conn->close();
?>
