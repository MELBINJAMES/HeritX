<?php
echo "Testing User Dashboard Config...\n";
try {
    require_once 'c:/xampp/htdocs/HertiX/user-dashboard/backend/config/db.php';
    if (isset($pdo)) {
        echo "User Dashboard DB (PDO): Connected Successfully.\n";
    } else {
        echo "User Dashboard DB (PDO): Connection Object Not Found.\n";
    }
} catch (Exception $e) {
    echo "User Dashboard DB Error: " . $e->getMessage() . "\n";
}

echo "\nTesting Admin Panel Config...\n";
// Admin db.php sets headers, we might want to suppress them or just ignore the output mess
ob_start();
require_once 'c:/xampp/htdocs/HertiX/admin/public/api/db.php';
ob_end_clean();

if (isset($conn) && !$conn->connect_error) {
    echo "Admin Panel DB (MySQLi): Connected Successfully.\n";
} else {
    echo "Admin Panel DB (MySQLi): Connection Failed.\n";
}
?>
