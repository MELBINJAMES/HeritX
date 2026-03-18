<?php
include 'admin/public/api/db.php';
$email = 'finder_test@heritx.com';
$pass = 'Password@123';
$res = $conn->query("SELECT password FROM users WHERE email = '$email'");
$row = $res->fetch_assoc();
if ($row) {
    echo "HASH: " . $row['password'] . "\n";
    if (password_verify($pass, $row['password'])) {
        echo "MATCH: YES\n";
    } else {
        echo "MATCH: NO\n";
    }
} else {
    echo "USER NOT FOUND";
}
?>
