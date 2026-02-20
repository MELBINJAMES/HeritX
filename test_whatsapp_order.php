<?php
// Simulate POST request for rentals.php
$_SERVER['REQUEST_METHOD'] = 'POST';

// Mock Input Data
$input = [
    "user_id" => 1, // Assume user ID 1 exists
    "cart" => [
        [
            "id" => 1, // Assume item ID 1 exists
            "qty" => 1,
            "price_per_day" => 500
        ]
    ],
    "start_date" => date('Y-m-d'),
    "end_date" => date('Y-m-d', strtotime('+2 days')),
    "duration" => 3,
    "payment_method" => "card",
    "total_amount" => 1650, // 1500 rent + 150 delivery
    "delivery_method" => "delivery",
    "delivery_charge" => 150,
    "phone" => "9876543210",
    "delivery_address" => "123 Test Street",
    "city" => "Test City",
    "pincode" => "682001"
];

// Capture output
ob_start();
// Mock php://input
function file_get_contents_mock($filename) {
    global $input;
    if ($filename == 'php://input') {
        return json_encode($input);
    }
    return \file_get_contents($filename);
}

// Override file_get_contents is tricky. 
// Instead, I'll modify rentals.php to read from a variable if defined, OR I'll just use curl.
// Using curl is better.
?>
<?php
$url = 'http://localhost/HertiX/user-dashboard/backend/api/rentals.php';
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($input));
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);

echo "Response: " . $result . "\n\n";

// Check PHP Error Log for WhatsApp message
$logFile = 'c:\xampp\php\logs\php_error_log'; // Adjust path if needed, or just rely on response
// Actually, I can't easily read the error log from here if I don't know the path.
// But the response should be success.
?>
