<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'db.php';

echo "Connected to: " . $dbname . "\n";

// Check Items
$result = $conn->query("SELECT * FROM items");
if ($result) {
    echo "Total Items: " . $result->num_rows . "\n";
    while($row = $result->fetch_assoc()) {
        echo "ID: " . $row['id'] . " | Name: " . $row['name'] . " | Owner: " . $row['owner_id'] . "\n";
    }
} else {
    echo "Error querying items: " . $conn->error;
}
?>
