<?php
include 'admin/public/api/db.php';
$email = 'finder_test@heritx.com';
$res = $conn->query("SELECT email, role, is_approved FROM users WHERE email = '$email'");
if ($row = $res->fetch_assoc()) {
    print_r($row);
} else {
    echo "USER NOT FOUND";
}
?>
