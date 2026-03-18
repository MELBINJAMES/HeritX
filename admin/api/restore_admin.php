<?php
include 'db.php';

$email = 'admin@example.com';
$password = password_hash('Password@123', PASSWORD_DEFAULT);
$name = 'System Admin';
$role = 'admin';

// Check if exists
$check = $conn->query("SELECT id FROM users WHERE role='admin'");
if ($check->num_rows == 0) {
    $sql = "INSERT INTO users (email, password, name, role, is_approved) VALUES ('$email', '$password', '$name', '$role', 1)";
    if ($conn->query($sql) === TRUE) {
        echo "Admin account restored: admin@example.com / Password@123\n";
    } else {
        echo "Error creating admin: " . $conn->error . "\n";
    }
} else {
    echo "Admin already exists.\n";
}
$conn->close();
?>
