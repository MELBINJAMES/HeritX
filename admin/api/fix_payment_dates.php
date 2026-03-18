<?php
include 'db.php';
header('Content-Type: text/plain');

echo "--- Table Schema ---\n";
$res = $conn->query("DESCRIBE payments");
if ($res) {
    while($row = $res->fetch_assoc()) {
        print_r($row);
    }
} else {
    echo "Error describing table: " . $conn->error . "\n";
}

echo "\n--- Fixing Invalid Dates ---\n";
// Update 0000-00-00 or NULL dates to NOW()
$sql = "UPDATE payments SET transaction_date = NOW() WHERE transaction_date = '0000-00-00' OR transaction_date IS NULL";
if ($conn->query($sql) === TRUE) {
    echo "Updated " . $conn->affected_rows . " rows with invalid dates.\n";
} else {
    echo "Error updating dates: " . $conn->error . "\n";
}

echo "\n--- checking content ---\n";
$res = $conn->query("SELECT * FROM payments LIMIT 5");
if ($res) {
    while($row = $res->fetch_assoc()) {
        print_r($row);
    }
}
?>
