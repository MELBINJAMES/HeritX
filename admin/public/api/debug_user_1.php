<?php
include 'db.php';
$target_id = 1;
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $target_id);
$stmt->execute();
$result = $stmt->get_result();
if($row = $result->fetch_assoc()) {
    echo json_encode($row, JSON_PRETTY_PRINT);
} else {
    echo "User 1 not found";
}
?>
