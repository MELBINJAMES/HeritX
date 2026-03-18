<?php
require 'db.php';
header('Content-Type: application/json');

$result = $conn->query("SHOW COLUMNS FROM users");
$columns = [];
while ($row = $result->fetch_assoc()) {
    $columns[] = $row['Field'];
}
echo json_encode($columns);
?>
