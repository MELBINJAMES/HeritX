<?php
include 'db.php';

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Delete non-admin users
$sql = "DELETE FROM users WHERE role != 'admin'";
if ($conn->query($sql) === TRUE) {
    echo "Successfully deleted non-admin users.\n";
} else {
    echo "Error deleting records: " . $conn->error . "\n";
}

// Verify what's left
$res = $conn->query("SELECT id, email, role FROM users");
echo "Remaining Users:\n";
while($row = $res->fetch_assoc()) {
    echo $row['id'] . " - " . $row['email'] . " (" . $row['role'] . ")\n";
}

$conn->close();
?>
