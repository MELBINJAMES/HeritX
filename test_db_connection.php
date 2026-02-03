<?php
$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "Heritx";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error . "\n");
}
echo "Connected successfully to MySQL server.\n";

// Check Database
if ($conn->select_db($dbname)) {
    echo "Database '$dbname' selected successfully.\n";
} else {
    echo "Error selecting database '$dbname': " . $conn->error . "\n";
}

$conn->close();
?>
