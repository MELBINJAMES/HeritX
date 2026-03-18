<?php
include __DIR__ . '/../../admin/public/api/db.php';

$email = 'finder_test@heritx.com';
$name = 'Selenium Finder';
$password = 'Password@123';
$hashed = password_hash($password, PASSWORD_DEFAULT);
$role = 'Finder';
$is_approved = 1;

// Check if exists
$check = "SELECT id FROM users WHERE email = '$email'";
$res = $conn->query($check);

if ($res->num_rows > 0) {
    echo "Test user already exists. Updating password.\n";
    $sql = "UPDATE users SET password = '$hashed', is_approved = 1 WHERE email = '$email'";
} else {
    echo "Creating new test user.\n";
    $sql = "INSERT INTO users (email, name, password, role, is_approved) VALUES ('$email', '$name', '$hashed', '$role', $is_approved)";
}

if ($conn->query($sql) === TRUE) {
    echo "✅ Success: Test user '$email' is ready.\n";
} else {
    echo "❌ Error: " . $conn->error . "\n";
}

$conn->close();
?>
