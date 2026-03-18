<?php
require "config.php";
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$res = $conn->query("SELECT id, name, image_url FROM items");
while($row = $res->fetch_assoc()) {
    $img = $row["image_url"];
    $path = "c:/xampp/htdocs/HertiX/" . $img;
    if (!file_exists($path)) {
        echo "Missing image for ID " . $row["id"] . ": " . $img . "\n";
    }
}
?>
