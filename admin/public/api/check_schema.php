<?php
include 'c:\xampp\htdocs\HertiX\admin\public\api\db.php';
$result = $conn->query("DESCRIBE items");
if ($result) {
    while($row = $result->fetch_assoc()) {
        print_r($row);
    }
} else {
    echo "Error: " . $conn->error;
}
?>
