<?php
include 'db.php';

// Add new columns to shopowners table for social and contact info
$columns = [
    "business_email VARCHAR(255)",
    "instagram_url VARCHAR(255)",
    "facebook_url VARCHAR(255)",
    "maps_url TEXT"
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
