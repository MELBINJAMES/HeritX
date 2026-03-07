<?php
require_once 'user-dashboard/backend/config/db.php';
$pdo->exec("UPDATE users SET profile_image = 'https://i.pravatar.cc/150?u=10' WHERE id = 10 AND (profile_image IS NULL OR profile_image = '')");
echo "Updated profile image for joe rental.\n";
?>
