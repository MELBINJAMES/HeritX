<?php
include '../admin/public/api/db.php';

$sql = "SELECT id, email, name, role, is_approved FROM users WHERE email LIKE '%@test-auto.com' ORDER BY id DESC LIMIT 5";
$result = $conn->query($sql);

echo "\n--- Last 5 Test Accounts ---\n";
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "ID: " . $row["id"] . " | Email: " . $row["email"] . " | Name: " . $row["name"] . " | Role: " . $row["role"] . " | Approved: " . $row["is_approved"] . "\n";
    }
} else {
    echo "No test accounts found.\n";
}

$conn->close();
?>
