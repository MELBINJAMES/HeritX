<?php
include_once 'db.php';
$sql = "SELECT id, name, email, role FROM users";
$result = $conn->query($sql);
$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}
echo json_encode($users, JSON_PRETTY_PRINT);
?>
