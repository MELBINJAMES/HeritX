<?php
$conn = new mysqli('localhost', 'root', '', 'Heritx');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);
$res = $conn->query("SELECT id, name, is_approved, owner_id FROM items");
while($row = $res->fetch_assoc()) {
    echo json_encode($row) . "\n";
}
$conn->close();
?>
