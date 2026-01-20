<?php
include 'db.php';

// Add new columns to shopowners table for expanded profile
$columns = [
    "tax_id VARCHAR(50)",
    "website_url VARCHAR(255)",
    "shop_description TEXT"
];

// Check if logo_url exists, if not add it (redundancy check)
$check = $conn->query("SHOW COLUMNS FROM shopowners LIKE 'logo_url'");
if ($check->num_rows == 0) {
    $columns[] = "logo_url VARCHAR(255)";
}

foreach ($columns as $col) {
    $sql = "ALTER TABLE shopowners ADD COLUMN $col";
    if ($conn->query($sql) === TRUE) {
        echo "Column added: " . explode(' ', $col)[0] . "\n";
    } else {
        echo "Note: " . $conn->error . "\n";
    }
}
?>
