<?php
// test_public_apis.php

$BASE_API_URL = "http://localhost/HertiX/admin/public/api";

run_test("Fetch Inventory Catalog API (200 OK)", function() use ($BASE_API_URL) {
    $response = make_get_request($BASE_API_URL . "/shop_inventory.php");
    
    if ($response['code'] !== 200) {
        return "Expected HTTP 200, got " . $response['code'];
    }
    
    $data = json_decode($response['body'], true);
    
    if (!is_array($data)) {
        return "Response is not valid JSON array.";
    }
    
    // We expect the array to be empty or contain item objects
    if (count($data) > 0) {
        if (!isset($data[0]['item_id'])) {
           return "Items array missing expected structure (item_id)."; 
        }
    }
    
    return true;
});

run_test("Fetch Shop Locations API (Valid JSON structure)", function() use ($BASE_API_URL) {
    // Note: This endpoint is actually in user-dashboard/backend/api, 
    // adjusting path specifically for this test
    $USER_BACKEND_URL = "http://localhost/HertiX/user-dashboard/backend/api";
    $response = make_get_request($USER_BACKEND_URL . "/shop_locations.php");
    
    if ($response['code'] !== 200) {
        return "Expected HTTP 200, got " . $response['code'];
    }
    
    $data = json_decode($response['body'], true);
    
    if (!isset($data['status'])) {
        return "Location API missing 'status' field.";
    }
    
    if ($data['status'] !== 'success') {
        return "Location API returned non-success status: " . $data['message'];
    }
    
    return true;
});
?>
