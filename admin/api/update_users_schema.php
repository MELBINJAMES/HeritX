<?php
require 'db.php';

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

$columns = [
    "latitude" => "DECIMAL(10,8)",
    "longitude" => "DECIMAL(11,8)"
];

$table = 'users';
$messages = [];

foreach ($columns as $col => $def) {
    $check = $conn->query("SHOW COLUMNS FROM $table LIKE '$col'");
    if ($check->num_rows == 0) {
        $sql = "ALTER TABLE $table ADD COLUMN $col $def";
        if ($conn->query($sql) === TRUE) {
            $messages[] = "Added column '$col'";
        } else {
            $messages[] = "Error adding '$col': " . $conn->error;
        }
    } else {
        $messages[] = "Column '$col' already exists";
    }
}

echo json_encode(["status" => "success", "updates" => $messages]);
$conn->close();
?>
