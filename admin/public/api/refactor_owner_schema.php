<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
include 'db.php';

echo "<h2>Refactoring Schema: linking owner_profile to users table</h2>";

// 1. Get Constraint Name
$result = $conn->query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'owner_profile' AND COLUMN_NAME = 'owner_id' AND REFERENCED_TABLE_NAME = 'shopowners'");
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $constraintName = $row['CONSTRAINT_NAME'];
    echo "Found incorrect FK: $constraintName. Dropping...<br>";
    
    // 2. Drop Incorrect Foreign Key
    if ($conn->query("ALTER TABLE owner_profile DROP FOREIGN KEY $constraintName") === TRUE) {
        echo "Dropped Foreign Key successfully.<br>";
    } else {
        echo "Error dropping FK: " . $conn->error . "<br>";
    }
} else {
    echo "No FK to shopowners found (maybe already fixed).<br>";
}

// 3. Add Correct Foreign Key
// Check if FK to users already exists to avoid dupes
$check = $conn->query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'owner_profile' AND COLUMN_NAME = 'owner_id' AND REFERENCED_TABLE_NAME = 'users'");
if ($check->num_rows == 0) {
    echo "Adding Foreign Key to users table...<br>";
    // Note: We used ON DELETE CASCADE to remove profile if user is deleted
    if ($conn->query("ALTER TABLE owner_profile ADD CONSTRAINT fk_owner_user FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE") === TRUE) {
        echo "Added Foreign Key to users table successfully.<br>";
    } else {
        echo "Error adding FK: " . $conn->error . "<br>";
    }
} else {
    echo "Foreign Key to users table already exists.<br>";
}

$conn->close();
?>
