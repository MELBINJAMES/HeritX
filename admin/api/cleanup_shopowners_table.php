<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

include 'db.php';

echo "<h2>Cleaning up shopowners table</h2>";

$columnsToDrop = [
    'shop_name',
    'phone',
    'shop_address',
    'rental_terms',
    'late_fee_policy',
    'bank_details',
    'operating_hours',
    'vacation_mode',
    'default_deposit_percent',
    'logo_url',
    'tax_id',
    'website_url',
    'shop_description',
    'business_email',
    'instagram_url',
    'facebook_url',
    'maps_url',
    'shop_city',
    'shop_pincode',
    'opening_time',
    'closing_time',
    'working_days'
];

// Check which columns actually exist to avoid errors
$checkSql = "SHOW COLUMNS FROM shopowners";
$result = $conn->query($checkSql);

$existingColumns = [];
while($row = $result->fetch_assoc()) {
    $existingColumns[] = $row['Field'];
}

$dropList = [];
foreach ($columnsToDrop as $col) {
    if (in_array($col, $existingColumns)) {
        $dropList[] = $col;
    }
}

if (empty($dropList)) {
    echo "No columns to drop. They might have been already removed.<br>";
} else {
    $sql = "ALTER TABLE shopowners DROP COLUMN " . implode(', DROP COLUMN ', $dropList);
    
    echo "Executing: <br><code>$sql</code><br><br>";
    
    if ($conn->query($sql) === TRUE) {
        echo "Successfully dropped columns: " . implode(', ', $dropList) . "<br>";
    } else {
        echo "Error dropping columns: " . $conn->error . "<br>";
    }
}

$conn->close();
?>
