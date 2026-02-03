<?php
include 'db.php';
echo "<h2>Users Table Dump</h2>";
$res = $conn->query("SELECT id, name, email, role FROM users");
if ($res) {
    if ($res->num_rows > 0) {
        echo "<table border='1'><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>";
        while ($row = $res->fetch_assoc()) {
            echo "<tr><td>{$row['id']}</td><td>{$row['name']}</td><td>{$row['email']}</td><td>{$row['role']}</td></tr>";
        }
        echo "</table>";
    } else {
        echo "No users found in table.";
    }
} else {
    echo "Error: " . $conn->error;
}
?>
