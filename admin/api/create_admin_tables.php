<?php
include 'db.php';

// 1. Categories Table
$sqlCategories = "CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    type ENUM('category', 'occasion') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sqlCategories) === TRUE) {
    echo "Table 'categories' created successfully.<br>";
} else {
    echo "Error creating table 'categories': " . $conn->error . "<br>";
}

// 2. Audit Logs Table
$sqlLogs = "CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sqlLogs) === TRUE) {
    echo "Table 'audit_logs' created successfully.<br>";
} else {
    echo "Error creating table 'audit_logs': " . $conn->error . "<br>";
}

// Seed Categories if empty
$check = $conn->query("SELECT COUNT(*) as c FROM categories");
$row = $check->fetch_assoc();
if ($row['c'] == 0) {
    $cats = [
        ['Attire', 'category'], ['Jewelry', 'category'], ['Art/Decor', 'category'], ['Ritual Items', 'category'],
        ['Onam', 'occasion'], ['Vishu', 'occasion'], ['Wedding', 'occasion'], ['Festival', 'occasion']
    ];
    $stmt = $conn->prepare("INSERT INTO categories (name, type) VALUES (?, ?)");
    foreach ($cats as $c) {
        $stmt->bind_param("ss", $c[0], $c[1]);
        $stmt->execute();
    }
    echo "Seeded default categories.<br>";
}

// 3. Schema Update for Shop Verification
$cols = [
    'shop_address' => 'TEXT', 
    'shop_city' => 'VARCHAR(255)', 
    'shop_phone' => 'VARCHAR(20)', 
    'shop_proof' => 'VARCHAR(255)'
];

foreach ($cols as $col => $type) {
    $check = $conn->query("SHOW COLUMNS FROM users LIKE '$col'");
    if ($check->num_rows == 0) {
        $conn->query("ALTER TABLE users ADD COLUMN $col $type");
        echo "Added column '$col' to users table.<br>";
    }
}

$conn->close();
?>
