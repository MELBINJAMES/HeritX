<?php
require_once 'public/api/db.php';

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$res = $conn->query("SHOW TABLES LIKE 'owner_profile'");
if ($res->num_rows > 0) {
    echo "owner_profile exists\n";
    $res = $conn->query("DESCRIBE owner_profile");
    while ($row = $res->fetch_assoc()) {
        echo $row['Field'] . " (" . $row['Type'] . ")\n";
    }
} else {
    echo "owner_profile missing\n";
}

$conn->close();
?>
