<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "Heritx";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h2>Starting Database Unification</h2>";

// 1. Ensure 'users' table has all required columns
$cols = [
    "role VARCHAR(50) DEFAULT 'Finder'",
    "shop_address TEXT",
    "shop_city VARCHAR(100)",
    "shop_phone VARCHAR(50)",
    "shop_proof VARCHAR(255)",
    "is_approved TINYINT(1) DEFAULT 1"
];

foreach ($cols as $colDef) {
    $colName = explode(' ', $colDef)[0];
    $check = $conn->query("SHOW COLUMNS FROM users LIKE '$colName'");
    if ($check->num_rows == 0) {
        echo "Adding column $colName to users table...<br>";
        $conn->query("ALTER TABLE users ADD $colDef");
    }
}

// 2. Map existing shopowners to users
$shopowners = $conn->query("SELECT * FROM shopowners");
$idMapping = [];

echo "Migrating shopowners to users table...<br>";
while ($row = $shopowners->fetch_assoc()) {
    $email = $conn->real_escape_string($row['email']);
    $oldId = $row['id'];
    
    // Check if email already exists in users
    $checkUser = $conn->query("SELECT id FROM users WHERE email = '$email'");
    if ($checkUser->num_rows > 0) {
        $userRow = $checkUser->fetch_assoc();
        $newId = $userRow['id'];
        echo "User with email $email already exists in users (ID: $newId). Updating...<br>";
        
        $sql = "UPDATE users SET 
                role = 'Shop Owner', 
                shop_address = '" . ($row['shop_address'] ?? '') . "', 
                shop_city = '" . ($row['shop_city'] ?? '') . "', 
                shop_phone = '" . ($row['phone'] ?? '') . "', 
                is_approved = 1 
                WHERE id = $newId";
        $conn->query($sql);
    } else {
        echo "Creating new user for $email in users table...<br>";
        $name = $conn->real_escape_string($row['name'] ?? '');
        $pass = $conn->real_escape_string($row['password'] ?? '');
        
        $sql = "INSERT INTO users (email, name, password, role, shop_address, shop_city, shop_phone, is_approved) 
                VALUES ('$email', '$name', '$pass', 'Shop Owner', 
                '" . ($row['shop_address'] ?? '') . "', 
                '" . ($row['shop_city'] ?? '') . "', 
                '" . ($row['phone'] ?? '') . "', 1)";
        $conn->query($sql);
        $newId = $conn->insert_id;
    }
    $idMapping[$oldId] = $newId;
}

// 3. Update references
echo "Updating references in relative tables...<br>";

// Table: items (owner_id -> users.id)
foreach ($idMapping as $old => $new) {
    $conn->query("UPDATE items SET owner_id = $new WHERE owner_id = $old");
}
echo "Updated items table.<br>";

// Table: owner_profile (owner_id -> users.id)
// We need to drop the old FK if it exists, but for now let's just update the IDs.
// owner_profile has a UNIQUE KEY unique_owner (owner_id).
// If we update, we might hit duplicate errors if a profile already exists for the new ID.
foreach ($idMapping as $old => $new) {
    if ($old == $new) continue;
    
    // Check if a profile already exists for $new
    $exists = $conn->query("SELECT id FROM owner_profile WHERE owner_id = $new");
    if ($exists->num_rows > 0) {
        echo "Profile already exists for new ID $new. Merging or skipping...<br>";
        // For now, let's just delete the old one if it's different
        $conn->query("DELETE FROM owner_profile WHERE owner_id = $old");
    } else {
        $conn->query("UPDATE owner_profile SET owner_id = $new WHERE owner_id = $old");
    }
}
echo "Updated owner_profile table.<br>";

// 4. Update owner_profile FK to point to users instead of shopowners
// First, check existing FKs
$fks = $conn->query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                     WHERE TABLE_NAME = 'owner_profile' AND COLUMN_NAME = 'owner_id' 
                     AND CONSTRAINT_NAME <> 'PRIMARY' AND TABLE_SCHEMA = 'Heritx'");
while($fkRow = $fks->fetch_assoc()) {
    $fkName = $fkRow['CONSTRAINT_NAME'];
    echo "Dropping old FK $fkName...<br>";
    $conn->query("ALTER TABLE owner_profile DROP FOREIGN KEY $fkName");
}

echo "Adding new FK to owner_profile pointing to users table...<br>";
$conn->query("ALTER TABLE owner_profile ADD CONSTRAINT fk_owner_user FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE");

echo "<h3>Unification Successful!</h3>";
$conn->close();
?>
