<?php
require 'admin/public/api/db.php';

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$table = 'rentals';
$result = $conn->query("DESCRIBE $table");

if ($result) {
    echo "Schema for $table:\n";
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " - " . $row['Type'] . "\n";
    }
} else {
    echo "Error describing table: " . $conn->error;
}

$conn->close();
?>
