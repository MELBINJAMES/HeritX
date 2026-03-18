<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

include 'db.php';

echo "<h2>Refactoring owner_profile table</h2>";

// 1. Rename logo_url -> profile_photo
$checkCol = $conn->query("SHOW COLUMNS FROM owner_profile LIKE 'logo_url'");
if ($checkCol->num_rows > 0) {
    if ($conn->query("ALTER TABLE owner_profile CHANGE logo_url profile_photo VARCHAR(255)") === TRUE) {
        echo "Renamed 'logo_url' to 'profile_photo'.<br>";
    } else {
        echo "Error renaming logo_url: " . $conn->error . "<br>";
    }
} else {
    echo "'logo_url' not found (maybe already renamed).<br>";
}

// 2. Drop columns: website_url, vacation_mode, business_email
$columnsToDrop = ['website_url', 'vacation_mode', 'business_email'];
$existingColumns = [];
$result = $conn->query("SHOW COLUMNS FROM owner_profile");
while($row = $result->fetch_assoc()) {
    $existingColumns[] = $row['Field'];
}

$dropList = [];
foreach ($columnsToDrop as $col) {
    if (in_array($col, $existingColumns)) {
        $dropList[] = $col;
    }
}

if (!empty($dropList)) {
    $sql = "ALTER TABLE owner_profile DROP COLUMN " . implode(', DROP COLUMN ', $dropList);
    if ($conn->query($sql) === TRUE) {
        echo "Dropped columns: " . implode(', ', $dropList) . "<br>";
    } else {
        echo "Error dropping columns: " . $conn->error . "<br>";
    }
} else {
    echo "No columns to drop (already removed).<br>";
}

$conn->close();
?>
