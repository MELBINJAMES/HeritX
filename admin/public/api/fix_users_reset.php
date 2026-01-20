<?php
require 'db.php';

echo "<h2>Fixing Users Table for Password Reset</h2>";

// 1. Check if 'reset_token' column exists
$check_token = $conn->query("SHOW COLUMNS FROM users LIKE 'reset_token'");
if ($check_token->num_rows == 0) {
    echo "Adding 'reset_token' column... ";
    if ($conn->query("ALTER TABLE users ADD COLUMN reset_token VARCHAR(10) NULL")) {
        echo "<span style='color:green'>Success</span><br>";
    } else {
        echo "<span style='color:red'>Failed: " . $conn->error . "</span><br>";
    }
} else {
    echo "'reset_token' column already exists.<br>";
}

// 2. Check if 'reset_token_expiry' column exists
$check_expiry = $conn->query("SHOW COLUMNS FROM users LIKE 'reset_token_expiry'");
if ($check_expiry->num_rows == 0) {
    echo "Adding 'reset_token_expiry' column... ";
    if ($conn->query("ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME NULL")) {
        echo "<span style='color:green'>Success</span><br>";
    } else {
        echo "<span style='color:red'>Failed: " . $conn->error . "</span><br>";
    }
} else {
    echo "'reset_token_expiry' column already exists.<br>";
}

echo "<h3>Done. Please try the Forgot Password feature again.</h3>";
$conn->close();
?>
