<?php
include 'db.php';

$alter_queries = [
    "ALTER TABLE items ADD COLUMN dos TEXT",
    "ALTER TABLE items ADD COLUMN donts TEXT"
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
