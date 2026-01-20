<?php
include 'db.php';

// Add new columns to shopowners table
$columns = [
    "operating_hours VARCHAR(255) DEFAULT 'Mon-Sat: 9:00 AM - 6:00 PM'",
    "vacation_mode TINYINT(1) DEFAULT 0"
];

foreach ($columns as $col) {
    $sql = "ALTER TABLE shopowners ADD COLUMN $col";
    if ($conn->query($sql) === TRUE) {
        echo "Column added: " . explode(' ', $col)[0] . "\n";
    } else {
        echo "Note: " . $conn->error . "\n";
    }
}
?>
