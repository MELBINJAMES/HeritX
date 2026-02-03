<?php
include 'db.php';

echo "<h2>USERS Table</h2>";
$res = $conn->query("SELECT id, name, email, role FROM users");
if ($res) {
    while($row = $res->fetch_assoc()) {
        echo "ID: " . $row['id'] . " | " . $row['name'] . " | " . $row['email'] . " | " . $row['role'] . "<br>";
    }
} else {
    echo "Error: " . $conn->error;
}

echo "<h2>SHOPOWNERS Table</h2>";
$res2 = $conn->query("SELECT * FROM shopowners");
if ($res2) {
    while($row = $res2->fetch_assoc()) {
        print_r($row);
        echo "<br>";
    }
} else {
    echo "No shopowners table found or error.";
}
?>
