<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
include 'db.php';

echo "<h2>Refactoring Schema: linking items table to users table</h2>";

// 1. Get Constraint Name for items
$result = $conn->query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'items' AND COLUMN_NAME = 'owner_id' AND REFERENCED_TABLE_NAME = 'shopowners'");
if ($result->num_rows > 0) {
    echo "Found incorrect Foreign Keys pointing to shopowners:<br>";
    while ($row = $result->fetch_assoc()) {
        $constraintName = $row['CONSTRAINT_NAME'];
        echo "- Found $constraintName. Dropping...<br>";
        
        if ($conn->query("ALTER TABLE items DROP FOREIGN KEY $constraintName") === TRUE) {
            echo "  Dropped $constraintName successfully.<br>";
        } else {
            echo "  Error dropping $constraintName: " . $conn->error . "<br>";
        }
    }
} else {
    echo "No FK to shopowners found on items table (maybe already fixed).<br>";
}

// 2. Add Correct Foreign Key
// Check if FK to users already exists
$check = $conn->query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'items' AND COLUMN_NAME = 'owner_id' AND REFERENCED_TABLE_NAME = 'users'");
if ($check->num_rows == 0) {
    echo "Adding Foreign Key from items.owner_id to users.id...<br>";
    // Using ON DELETE CASCADE
    if ($conn->query("ALTER TABLE items ADD CONSTRAINT fk_items_owner_user FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE") === TRUE) {
        echo "Added Foreign Key fk_items_owner_user successfully.<br>";
    } else {
        echo "Error adding FK: " . $conn->error . "<br>";
    }
} else {
    echo "Foreign Key to users table already exists.<br>";
}

$conn->close();
?>
