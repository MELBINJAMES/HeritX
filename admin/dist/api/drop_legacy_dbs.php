<?php
$servername = "127.0.0.1";
$username = "root";
$password = "";

$conn = new mysqli($servername, $username, $password);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Databases to drop
$dbs_to_drop = ["hertix_db", "hertix_db_v2"];

foreach ($dbs_to_drop as $db) {
    $sql = "DROP DATABASE IF EXISTS $db";
    if ($conn->query($sql) === TRUE) {
        echo "Database '$db' dropped successfully.\n";
    } else {
        echo "Error dropping '$db': " . $conn->error . "\n";
    }
}

$conn->close();
?>
