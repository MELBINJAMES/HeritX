<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$servername = "127.0.0.1";
$username = "root";
$password = "";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

// Create database (Fresh Start)
$conn->query("DROP DATABASE IF EXISTS hertix_db_v2");
$sql = "CREATE DATABASE IF NOT EXISTS hertix_db_v2";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully.<br>";
} else {
    die(json_encode(["status" => "error", "message" => "Error creating database: " . $conn->error]));
}

// Select database
$conn->select_db("hertix_db_v2");

// Create Users table
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM";

if ($conn->query($sql) === TRUE) {
    echo "Table users created successfully or already exists.<br>";
} else {
    die(json_encode(["status" => "error", "message" => "Error creating table: " . $conn->error]));
}

// Insert Test User
$test_email = "test@example.com";
$test_password = password_hash("password123", PASSWORD_DEFAULT);

$check_sql = "SELECT id FROM users WHERE email = '$test_email'";
$result = $conn->query($check_sql);

if ($result->num_rows == 0) {
    $insert_sql = "INSERT INTO users (email, password) VALUES ('$test_email', '$test_password')";
    if ($conn->query($insert_sql) === TRUE) {
        echo "Test user created (Email: test@example.com, Password: password123).<br>";
    } else {
        echo "Error creating test user: " . $conn->error . "<br>";
    }
} else {
    echo "Test user already exists.<br>";
}

$conn->close();

echo "Setup completed successfully.";
?>
