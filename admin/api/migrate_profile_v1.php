<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

include 'db.php';

echo "<h2>Starting Migration: shopowners -> owner_profile</h2>";

// 1. Create owner_profile Table
$createTableSql = "CREATE TABLE IF NOT EXISTS owner_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    shop_name VARCHAR(255),
    shop_description TEXT,
    logo_url VARCHAR(255),
    website_url VARCHAR(255),
    business_email VARCHAR(255),
    phone VARCHAR(50),
    shop_address TEXT,
    shop_city VARCHAR(100),
    shop_pincode VARCHAR(20),
    maps_url TEXT,
    instagram_url VARCHAR(255),
    facebook_url VARCHAR(255),
    opening_time VARCHAR(20),
    closing_time VARCHAR(20),
    working_days VARCHAR(255),
    rental_terms TEXT,
    late_fee_policy TEXT,
    bank_details TEXT,
    tax_id VARCHAR(50),
    operating_hours VARCHAR(255),
    vacation_mode TINYINT(1) DEFAULT 0,
    default_deposit_percent INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_owner (owner_id),
    FOREIGN KEY (owner_id) REFERENCES shopowners(id) ON DELETE CASCADE
)";

if ($conn->query($createTableSql) === TRUE) {
    echo "Table 'owner_profile' check/create successful.<br>";
} else {
    die("Error creating table: " . $conn->error);
}

// 2. Select existing data
$sql = "SELECT * FROM shopowners";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "Found " . $result->num_rows . " owners to migrate.<br>";
    
    $stmt = $conn->prepare("INSERT INTO owner_profile (
        owner_id, shop_name, shop_description, logo_url, website_url, business_email, 
        phone, shop_address, shop_city, shop_pincode, maps_url, instagram_url, facebook_url,
        opening_time, closing_time, working_days, rental_terms, late_fee_policy, bank_details,
        tax_id, operating_hours, vacation_mode, default_deposit_percent
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    ) ON DUPLICATE KEY UPDATE 
        shop_name = VALUES(shop_name),
        phone = VALUES(phone),
        shop_address = VALUES(shop_address),
        logo_url = VALUES(logo_url)
    "); // Updating a few key fields just in case, but mostly INSERT IGNORE behavior via Unique Key

    if (!$stmt) {
        die("Prepare failed: " . $conn->error);
    }

    $count = 0;
    while($row = $result->fetch_assoc()) {
        // Handle potential nulls
        $owner_id = $row['id'];
        $shop_name = $row['shop_name'] ?? '';
        $shop_description = $row['shop_description'] ?? '';
        $logo_url = $row['logo_url'] ?? '';
        $website_url = $row['website_url'] ?? '';
        $business_email = $row['business_email'] ?? '';
        $phone = $row['phone'] ?? '';
        $shop_address = $row['shop_address'] ?? '';
        $shop_city = $row['shop_city'] ?? '';
        $shop_pincode = $row['shop_pincode'] ?? '';
        $maps_url = $row['maps_url'] ?? '';
        $instagram_url = $row['instagram_url'] ?? '';
        $facebook_url = $row['facebook_url'] ?? '';
        $opening_time = $row['opening_time'] ?? '';
        $closing_time = $row['closing_time'] ?? '';
        $working_days = $row['working_days'] ?? '';
        $rental_terms = $row['rental_terms'] ?? '';
        $late_fee_policy = $row['late_fee_policy'] ?? '';
        $bank_details = $row['bank_details'] ?? '';
        $tax_id = $row['tax_id'] ?? '';
        $operating_hours = $row['operating_hours'] ?? '';
        $vacation_mode = $row['vacation_mode'] ?? 0;
        $default_deposit_percent = $row['default_deposit_percent'] ?? 20;

        $stmt->bind_param("issssssssssssssssssssii", 
            $owner_id, $shop_name, $shop_description, $logo_url, $website_url, $business_email,
            $phone, $shop_address, $shop_city, $shop_pincode, $maps_url, $instagram_url, $facebook_url,
            $opening_time, $closing_time, $working_days, $rental_terms, $late_fee_policy, $bank_details,
            $tax_id, $operating_hours, $vacation_mode, $default_deposit_percent
        );

        if ($stmt->execute()) {
            $count++;
        } else {
            echo "Failed to migrate User ID $owner_id: " . $stmt->error . "<br>";
        }
    }
    echo "Migration completed. $count records moved/updated.<br>";
    $stmt->close();
} else {
    echo "No shop owners found to migrate.<br>";
}

$conn->close();
?>
