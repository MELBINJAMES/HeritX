<?php
include 'admin/public/api/db.php';

$email = 'melbinjames1212@gmail.com';
$pass  = 'Sd123456';

$res = $conn->query("SELECT email, role, is_approved, password FROM users WHERE email = '$email'");
if ($row = $res->fetch_assoc()) {
    echo "Found user:\n";
    echo "  email      : " . $row['email'] . "\n";
    echo "  role       : " . $row['role'] . "\n";
    echo "  is_approved: " . $row['is_approved'] . "\n";
    echo "  hash       : " . $row['password'] . "\n";
    $match = password_verify($pass, $row['password']);
    echo "  pass match : " . ($match ? "YES ✅" : "NO ❌") . "\n";
} else {
    echo "USER NOT FOUND IN DATABASE\n";
}
?>
