<?php
include 'db.php';

echo "Checking for 'is_approved' column in 'users' table...<br>";

$check = $conn->query("SHOW COLUMNS FROM users LIKE 'is_approved'");

if ($check->num_rows == 0) {
    echo "Column missing. Adding 'is_approved' column... ";
    // Default to 1 (Approved) for existing users/admin so they don't get locked out
    $sql = "ALTER TABLE users ADD COLUMN is_approved INT DEFAULT 1"; 
    
    if ($conn->query($sql) === TRUE) {
        echo "Success!<br>";
    } else {
        echo "Failed: " . $conn->error . "<br>";
    }
} else {
    echo "Column 'is_approved' already exists.<br>";
}

// Verify
$res = $conn->query("DESCRIBE users");
while($row = $res->fetch_assoc()) {
    if ($row['Field'] == 'is_approved') {
        echo "<b>VERIFIED: is_approved exists.</b><br>";
    }
}

$conn->close();
?>
