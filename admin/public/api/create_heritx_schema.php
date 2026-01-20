<?php
// Connect to MySQL server (without selecting DB first to create it)
$servername = "127.0.0.1";
$username = "root";
$password = "";

$conn = new mysqli($servername, $username, $password);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 1. Create Database
$sql = "CREATE DATABASE IF NOT EXISTS Heritx";
if ($conn->query($sql) === TRUE) {
    echo "Database 'Heritx' created or exists.\n";
} else {
    die("Error creating database: " . $conn->error);
}

// Select DB
$conn->select_db("Heritx");

// 2. Create 'users' table (Finders/Renters)
$sqlUsers = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Finder',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sqlUsers) === TRUE) {
    echo "Table 'users' created.\n";
} else {
    echo "Error creating table 'users': " . $conn->error . "\n";
}

// 3. Create 'shopowners' table
$sqlOwners = "CREATE TABLE IF NOT EXISTS shopowners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Shop Owner',
    phone VARCHAR(20),
    shop_name VARCHAR(255),
    shop_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sqlOwners) === TRUE) {
    echo "Table 'shopowners' created.\n";
} else {
    echo "Error creating table 'shopowners': " . $conn->error . "\n";
}

// 4. Create 'items' table (Linked to shopowners)
$sqlItems = "CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,  -- References shopowners.id
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quality VARCHAR(50) DEFAULT 'Good',
    quantity INT DEFAULT 1,
    price_per_day DECIMAL(10, 2),
    deposit_amount DECIMAL(10, 2),
    description TEXT,
    image_url VARCHAR(255),
    is_available TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES shopowners(id) ON DELETE CASCADE
)";
if ($conn->query($sqlItems) === TRUE) {
    echo "Table 'items' created.\n";
} else {
    echo "Error creating table 'items': " . $conn->error . "\n";
}

$conn->close();
?>
