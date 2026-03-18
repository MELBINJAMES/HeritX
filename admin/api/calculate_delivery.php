<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require 'db.php';

$data = json_decode(file_get_contents("php://input"));

if ((!isset($data->shop_id) && !isset($data->item_id)) || (!isset($data->user_address) && !isset($data->user_lat))) {
    echo json_encode(["status" => "error", "message" => "Missing shop_id/item_id or user address"]);
    exit;
}

$shop_id = 0;
if (isset($data->shop_id)) {
    $shop_id = $conn->real_escape_string($data->shop_id);
} elseif (isset($data->item_id)) {
    $item_id = $conn->real_escape_string($data->item_id);
    $res = $conn->query("SELECT owner_id FROM items WHERE id = '$item_id'");
    if ($res && $res->num_rows > 0) {
        $shop_id = $res->fetch_assoc()['owner_id'];
        // Also update items table if owner_id missing? No, items must have owner_id.
    } else {
        echo json_encode(["status" => "error", "message" => "Item not found"]);
        exit;
    }
}

$sql = "SELECT latitude, longitude, shop_city FROM users WHERE id = '$shop_id'";
$result = $conn->query($sql);

if ($result->num_rows == 0) {
    echo json_encode(["status" => "error", "message" => "Shop not found"]);
    exit;
}

$shop = $result->fetch_assoc();
$shop_lat = $shop['latitude'];
$shop_lon = $shop['longitude'];

// Fallback: If shop has no coords, try to geocode city (simulated for now or return error)
if (!$shop_lat || !$shop_lon) {
    // For now, let's just error out or use a default compatible with Kerala context if needed
    // But correct way is to ask owner to update profile. 
    // We will try to geocode the shop_city if present.
    if (!empty($shop['shop_city'])) {
        $geocode_shop = geocode($shop['shop_city']);
        if ($geocode_shop) {
            $shop_lat = $geocode_shop['lat'];
            $shop_lon = $geocode_shop['lon'];
            // Update shop coords
            $conn->query("UPDATE users SET latitude = $shop_lat, longitude = $shop_lon WHERE id = '$shop_id'");
        }
    }
    
    if (!$shop_lat || !$shop_lon) {
         echo json_encode(["status" => "error", "message" => "Shop location not set. Please contact shop owner."]);
         exit;
    }
}

// User Location
$user_lat = $data->user_lat ?? null;
$user_lon = $data->user_lng ?? null;

if (!$user_lat || !$user_lon) {
    // Clean up address: remove labels like "Full Address:", "City:", etc. that users might paste
    $raw_address = $data->user_address;
    $clean_address = preg_replace('/(Full\s*Address|Address|City|Pincode|Pin|State|Country)\s*[:|-]?\s*/i', '', $raw_address);
    // Remove multiple commas or spaces
    $clean_address = preg_replace('/,+/', ',', $clean_address);
    $clean_address = trim($clean_address, " , \n\r\t\v\0");

    $geocode_user = geocode($clean_address);
    
    // If exact clean fails, try even simpler: just the pincode and city? 
    // No, let's stick to the clean address first.
    if ($geocode_user) {
        $user_lat = $geocode_user['lat'];
        $user_lon = $geocode_user['lon'];
    } else {
        // Try fallback with just pincode if available in the string
        if (preg_match('/\b\d{6}\b/', $clean_address, $matches)) {
             $geocode_pin = geocode($matches[0]);
             if ($geocode_pin) {
                 $user_lat = $geocode_pin['lat'];
                 $user_lon = $geocode_pin['lon'];
             } else {
                 echo json_encode(["status" => "error", "message" => "Could not find address location. Please check your address."]);
                 exit;
             }
        } else {
             echo json_encode(["status" => "error", "message" => "Could not find address location"]);
             exit;
        }
    }
}

// Calculate Distance using OSRM
$url = "http://router.project-osrm.org/route/v1/driving/$shop_lon,$shop_lat;$user_lon,$user_lat?overview=false";

// Use curl to fetch
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$response = curl_exec($ch);
curl_close($ch);

$route_data = json_decode($response, true);

if (isset($route_data['code']) && $route_data['code'] == 'Ok') {
    $distance_meters = $route_data['routes'][0]['distance'];
    $duration_seconds = $route_data['routes'][0]['duration'];
    
    $distance_km = $distance_meters / 1000;
    
    // Fee Calculation
    // Base Fee: 50
    // Per KM: 10
    $base_fee = 50;
    $per_km = 10;
    $delivery_fee = $base_fee + ($distance_km * $per_km);
    
    echo json_encode([
        "status" => "success",
        "distance_km" => round($distance_km, 2),
        "delivery_fee" => round($delivery_fee, 2),
        "duration_min" => round($duration_seconds / 60),
        "user_lat" => $user_lat,
        "user_lon" => $user_lon
    ]);
} else {
    // Fallback if OSRM fails (e.g. too far, different continents, or API down)
    // Use Haversine
    $distance_km = haversineGreatCircleDistance($shop_lat, $shop_lon, $user_lat, $user_lon);
    $delivery_fee = 50 + ($distance_km * 15); // Slightly higher for "air" distance logic gap
    
     echo json_encode([
        "status" => "success",
        "distance_km" => round($distance_km, 2),
        "delivery_fee" => round($delivery_fee, 2),
        "method" => "fallback_haversine",
        "user_lat" => $user_lat,
        "user_lon" => $user_lon
    ]);
}

// Helper Functions

function geocode($address) {
    if (empty($address)) return null;
    $url = "https://nominatim.openstreetmap.org/search?q=" . urlencode($address) . "&format=json&limit=1";
    
    $opts = [
        "http" => [
            "header" => "User-Agent: HeritX-Delivery-App/1.0\r\n"
        ]
    ];
    $context = stream_context_create($opts);
    $json = file_get_contents($url, false, $context);
    $data = json_decode($json, true);
    
    if (!empty($data)) {
        return ['lat' => $data[0]['lat'], 'lon' => $data[0]['lon']];
    }
    return null;
}

function haversineGreatCircleDistance($latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo, $earthRadius = 6371000)
{
  // convert from degrees to radians
  $latFrom = deg2rad($latitudeFrom);
  $lonFrom = deg2rad($longitudeFrom);
  $latTo = deg2rad($latitudeTo);
  $lonTo = deg2rad($longitudeTo);

  $latDelta = $latTo - $latFrom;
  $lonDelta = $lonTo - $lonFrom;

  $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
    cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
  return ($angle * $earthRadius) / 1000; // Return KM
}
?>
