<?php
include 'c:/xampp/htdocs/HertiX/admin/public/api/db.php';
$email = 'owner@hertix.com';
$res = $conn->query("SELECT id, email, role, is_approved FROM users WHERE email = '$email'");
if ($row = $res->fetch_assoc()) {
    echo "USER_FOUND: " . json_encode($row) . "\n";
} else {
    echo "USER_NOT_FOUND\n";
}
?>
