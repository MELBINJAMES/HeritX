<?php
include 'db.php';
$res = $conn->query("SELECT id, name, email, role, is_approved FROM users");
echo "<table border=1><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status (1=Appr, 0=Pend)</th></tr>";
while($row = $res->fetch_assoc()) {
    echo "<tr>";
    echo "<td>" . $row['id'] . "</td>";
    echo "<td>" . $row['name'] . "</td>";
    echo "<td>" . $row['email'] . "</td>";
    echo "<td>" . $row['role'] . "</td>";
    echo "<td>" . $row['is_approved'] . "</td>";
    echo "</tr>";
}
echo "</table>";
?>
