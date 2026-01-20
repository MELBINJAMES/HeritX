<?php
include '../../../admin/public/api/db.php';
$conn->query("TRUNCATE TABLE payments");
echo "Payments table cleared.";
?>
