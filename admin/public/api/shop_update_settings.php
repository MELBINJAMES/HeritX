<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
// header('Content-Type: application/json'); // Removed to return JSON manually later, strict header sometimes blocks debug

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'db.php';

// Check if using FormData (which populates $_POST) or JSON
$data = $_POST;
if (empty($data)) {
    // Fallback to JSON if no POST data (compatibility)
    $input = json_decode(file_get_contents("php://input"), true);
    if ($input) $data = $input;
}

if (!isset($data['owner_id'])) {
    echo json_encode(["status" => "error", "message" => "Owner ID missing"]);
    exit;
}

$id = intval($data['owner_id']);
$shop_name = $conn->real_escape_string($data['shop_name'] ?? '');
$phone = $conn->real_escape_string($data['phone'] ?? '');
$shop_address = $conn->real_escape_string($data['shop_address'] ?? '');
$rental_terms = $conn->real_escape_string($data['rental_terms'] ?? '');
$late_fee_policy = $conn->real_escape_string($data['late_fee_policy'] ?? '');
$bank_details = $conn->real_escape_string($data['bank_details'] ?? '');
$operating_hours = $conn->real_escape_string($data['operating_hours'] ?? '');
$vacation_mode = isset($data['vacation_mode']) ? intval($data['vacation_mode']) : 0;
$default_deposit_percent = isset($data['default_deposit_percent']) ? intval($data['default_deposit_percent']) : 20;

// Handle Logo Upload
$profile_photo = $conn->real_escape_string($data['profile_photo'] ?? ''); // Default to existing URL text if any

if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = '../uploads/shop_logos/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileExt = strtolower(pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    if (in_array($fileExt, $allowed)) {
        $newFileName = 'shop_' . $id . '_' . time() . '.' . $fileExt;
        $destPath = $uploadDir . $newFileName;
        
        if (move_uploaded_file($_FILES['logo']['tmp_name'], $destPath)) {
            // Updated URL path accesible from frontend
            $profile_photo = 'http://localhost/HertiX/admin/public/uploads/shop_logos/' . $newFileName;
        }
    }
}

$tax_id = $conn->real_escape_string($data['tax_id'] ?? '');
$website_url = $conn->real_escape_string($data['website_url'] ?? '');
$shop_description = $conn->real_escape_string($data['shop_description'] ?? '');
$business_email = $conn->real_escape_string($data['business_email'] ?? '');
$instagram_url = $conn->real_escape_string($data['instagram_url'] ?? '');
$facebook_url = $conn->real_escape_string($data['facebook_url'] ?? '');
$maps_url = $conn->real_escape_string($data['maps_url'] ?? '');
$shop_city = $conn->real_escape_string($data['shop_city'] ?? '');
$shop_pincode = $conn->real_escape_string($data['shop_pincode'] ?? '');
$opening_time = $conn->real_escape_string($data['opening_time'] ?? '');
$closing_time = $conn->real_escape_string($data['closing_time'] ?? '');
$working_days = $conn->real_escape_string($data['working_days'] ?? '');

// 1. Update User Auth Info (Name sync)
// Note: `name` is often a reserved keyword, using backticks is safer
$sqlUser = "UPDATE shopowners SET `name` = ? WHERE id = ?";
$stmtUser = $conn->prepare($sqlUser);
if ($stmtUser) {
    $stmtUser->bind_param("si", $shop_name, $id);
    $stmtUser->execute();
    $stmtUser->close();
} else {
    error_log("Prepare User Update failed: " . $conn->error);
}

// 2. Update/Insert Profile Details
// Removed: business_email, website_url, vacation_mode
// Renamed: logo_url -> profile_photo
$sqlProfile = "INSERT INTO owner_profile (
    owner_id, shop_name, phone, shop_address, rental_terms, late_fee_policy, bank_details,
    operating_hours, default_deposit_percent, profile_photo, tax_id,
    shop_description, instagram_url, facebook_url, maps_url,
    shop_city, shop_pincode, opening_time, closing_time, working_days
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
) ON DUPLICATE KEY UPDATE
    shop_name = VALUES(shop_name),
    phone = VALUES(phone),
    shop_address = VALUES(shop_address),
    rental_terms = VALUES(rental_terms),
    late_fee_policy = VALUES(late_fee_policy),
    bank_details = VALUES(bank_details),
    operating_hours = VALUES(operating_hours),
    default_deposit_percent = VALUES(default_deposit_percent),
    profile_photo = VALUES(profile_photo),
    tax_id = VALUES(tax_id),
    shop_description = VALUES(shop_description),
    instagram_url = VALUES(instagram_url),
    facebook_url = VALUES(facebook_url),
    maps_url = VALUES(maps_url),
    shop_city = VALUES(shop_city),
    shop_pincode = VALUES(shop_pincode),
    opening_time = VALUES(opening_time),
    closing_time = VALUES(closing_time),
    working_days = VALUES(working_days)";

$stmt = $conn->prepare($sqlProfile);

if (!$stmt) {
    error_log("Prepare Profile Update failed: " . $conn->error);
    echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
    exit;
}

// Params: 
// 1. owner_id (i)
// 2. shop_name (s)
// 3. phone (s)
// 4. shop_address (s)
// 5. rental_terms (s)
// 6. late_fee_policy (s)
// 7. bank_details (s)
// 8. operating_hours (s)
// 9. default_deposit_percent (i)
// 10. profile_photo (s)
// 11. tax_id (s)
// 12. shop_description (s)
// 13. instagram_url (s)
// 14. facebook_url (s)
// 15. maps_url (s)
// 16. shop_city (s)
// 17. shop_pincode (s)
// 18. opening_time (s)
// 19. closing_time (s)
// 20. working_days (s)
// Total: 20 params (1 int, 1 int, rest string -> isssssssisssssssssss) -> actually owner_id is int, default_deposit is int. 
// "isssssssisssssssssss"
// Count: 1 + 1 + 18 = 20.

$stmt->bind_param("isssssssisssssssssss", 
    $id, $shop_name, $phone, $shop_address, $rental_terms, $late_fee_policy, $bank_details,
    $operating_hours, $default_deposit_percent, $profile_photo, $tax_id,
    $shop_description, $instagram_url, $facebook_url, $maps_url,
    $shop_city, $shop_pincode, $opening_time, $closing_time, $working_days
);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Settings updated successfully", "profile_photo" => $profile_photo]);
} else {
    error_log("Execute Profile failed: " . $stmt->error);
    echo json_encode(["status" => "error", "message" => "Update failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
