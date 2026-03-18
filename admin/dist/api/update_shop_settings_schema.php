<?php
include 'db.php';

// Add new columns to shopowners table if not exist
$columns = [
    "logo_url VARCHAR(255) DEFAULT ''",
    "rental_terms TEXT",
    "bank_details TEXT",
    "late_fee_policy TEXT",
    "default_deposit_percent INT DEFAULT 20"
];

foreach ($columns as $col) {
    $sql = "ALTER TABLE shopowners ADD COLUMN $col";
    if ($conn->query($sql) === TRUE) {
        echo "Column added: " . explode(' ', $col)[0] . "\n";
    } else {
        // Echo simplistic error (likely "Duplicate column name")
        echo "Note: " . $conn->error . "\n";
    }
}
?>
