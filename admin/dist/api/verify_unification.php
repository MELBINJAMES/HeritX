<?php
include 'db.php';
$res = $conn->query("SELECT id, email, role, is_approved FROM users");
echo "Unified Users:\n";
while($row = $res->fetch_assoc()) {
    echo $row['id'] . ': ' . $row['email'] . ' (' . $row['role'] . ') - Approved: ' . $row['is_approved'] . "\n";
}
$res = $conn->query("SELECT id, owner_id, shop_name FROM owner_profile");
echo "\nOwner Profiles:\n";
while($row = $res->fetch_assoc()) {
    echo $row['id'] . ': OwnerID ' . $row['owner_id'] . ' - ' . $row['shop_name'] . "\n";
}

$res = $conn->query("DESCRIBE owner_profile");
echo "\nOwner Profile Columns:\n";
while($row = $res->fetch_assoc()) {
    echo $row['Field'] . "\n";
}
?>
