<?php
// Simulate GET request to payments.php
$_GET['user_id'] = 1;
ob_start();
include 'user-dashboard/payments/backend/payments.php';
$output = ob_get_clean();
echo $output;
?>
