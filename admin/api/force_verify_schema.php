<?php
// Bypass db.php to avoid JSON headers and get raw output
$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "Heritx";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h1>Database: $dbname</h1>";

// 1. Check current columns
echo "<h2>Current Columns in 'users':</h2>";
$res = $conn->query("DESCRIBE users");
$found = [];
if ($res) {
    echo "<ul>";
    while($row = $res->fetch_assoc()) {
        echo "<li>" . $row['Field'] . " (" . $row['Type'] . ")</li>";
        $found[] = $row['Field'];
    }
    echo "</ul>";
} else {
    echo "Error describing users: " . $conn->error;
}

// 2. Add missing columns
$toAdd = [
    "shop_address" => "TEXT",
    "shop_city" => "VARCHAR(255)",
    "shop_phone" => "VARCHAR(50)",
    "shop_proof" => "VARCHAR(255)"
];

echo "<h2>Migrating...</h2>";
foreach ($toAdd as $col => $type) {
    if (!in_array($col, $found)) {
        echo "Adding $col... ";
        $sql = "ALTER TABLE users ADD COLUMN $col $type";
        if ($conn->query($sql) === TRUE) {
            echo "Success.<br>";
        } else {
            echo "Failed: " . $conn->error . "<br>";
        }
    } else {
        echo "$col already exists.<br>";
    }
}

// 3. Verify final state
echo "<h2>Final Columns:</h2>";
$res = $conn->query("DESCRIBE users");
if ($res) {
    echo "<ul>";
    while($row = $res->fetch_assoc()) {
        echo "<li>" . $row['Field'] . "</li>";
    }
    echo "</ul>";
}

$conn->close();
?>
