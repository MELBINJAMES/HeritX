<?php
include 'db.php';
$result = $conn->query("DESCRIBE users");
$columns = [];
while($row = $result->fetch_assoc()) {
    $columns[] = $row['Field'];
}
echo json_encode($columns);
?>
