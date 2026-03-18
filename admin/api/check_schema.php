<?php
include 'db.php';
$result = $conn->query("DESCRIBE users");
$cols = [];
while($row = $result->fetch_assoc()) $cols[] = $row['Field'];
echo implode(',', $cols);
?>
