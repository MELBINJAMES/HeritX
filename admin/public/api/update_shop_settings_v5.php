<?php
include 'db.php';

// Add new columns for detailed shop profile
$columns = [
    "shop_city VARCHAR(100)",
    "shop_pincode VARCHAR(20)",
    "opening_time VARCHAR(20)",
    "closing_time VARCHAR(20)",
    "working_days TEXT"
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
