<?php
include 'db.php';

$alter_queries = [
    "ALTER TABLE items ADD COLUMN quantity INT DEFAULT 1",
    "ALTER TABLE items ADD COLUMN deposit_amount DECIMAL(10,2) DEFAULT 0.00",
    "ALTER TABLE items ADD COLUMN item_condition VARCHAR(50) DEFAULT 'Good'",
    "ALTER TABLE items ADD COLUMN description TEXT"
];

foreach ($alter_queries as $sql) {
    if ($conn->query($sql) === TRUE) {
        echo "Successfully executed: $sql <br>";
    } else {
        echo "Error or already exists: " . $conn->error . " <br>";
    }
}
echo "Migration completed.";
?>
