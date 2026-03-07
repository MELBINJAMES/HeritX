<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Disable Error Reporting for Production (Returns JSON errors only)
error_reporting(E_ALL);
ini_set('display_errors', 0);

$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "HeritX";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}
?>
