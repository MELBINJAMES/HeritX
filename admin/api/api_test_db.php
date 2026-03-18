<?php
require_once 'db.php';

if ($conn) {
    echo json_encode(["status" => "success", "message" => "Connected successfully to database: " . $dbname]);
} else {
    echo json_encode(["status" => "error", "message" => "Connection variable is null"]);
}
?>
