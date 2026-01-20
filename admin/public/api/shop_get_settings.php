<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include 'db.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id > 0) {
    // Join shopowners (Auth) with owner_profile (Details)
    $sql = "SELECT 
                s.id, s.name, s.email,
                p.shop_name, p.shop_description, p.profile_photo,
                p.phone, p.shop_address, p.shop_city, p.shop_pincode, p.maps_url,
                p.instagram_url, p.facebook_url, p.opening_time, p.closing_time, p.working_days,
                p.rental_terms, p.late_fee_policy, p.bank_details, p.tax_id, p.operating_hours,
                p.default_deposit_percent
            FROM shopowners s
            LEFT JOIN owner_profile p ON s.id = p.owner_id
            WHERE s.id = ?";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    
    // Fallback: If profile doesn't exist yet but user does, return partial data
    if (!$data) {
        // Try fetch just user to see if ID is valid
         $stmt2 = $conn->prepare("SELECT id, name, email FROM shopowners WHERE id = ?");
         $stmt2->bind_param("i", $id);
         $stmt2->execute();
         $res2 = $stmt2->get_result();
         $data = $res2->fetch_assoc();
         if ($data) {
             // Add empty profile fields to avoid frontend undefined errors
             $data = array_merge($data, [
                 'shop_name' => '', 'shop_description' => '', 'profile_photo' => '', 'phone' => ''
                 // ... others will be null/undefined which JS handles or we can fully populate
             ]);
         }
    }

    echo json_encode($data ? $data : ["error" => "Not found"]);
} else {
    echo json_encode(["error" => "Invalid ID"]);
}
?>
