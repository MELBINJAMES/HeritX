<?php
// HARDCODED KEYS provided by user
$key = 'rzp_test_S2VrB9WBQb7j5L';
$secret = '9W71jj1bq1Erc8y2hiuxhWMJ';

echo "Testing Keys:\n";
echo "Key: $key\n";
echo "Secret: $secret\n\n";

$url = "https://api.razorpay.com/v1/orders";

$data = [
    'amount' => 10000, // 100 INR
    'currency' => 'INR',
    'receipt' => 'test_' . time(),
    'payment_capture' => 1
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_USERPWD, $key . ":" . $secret);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// Disable SSL for XAMPP
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

echo "Sending Request to Razorpay...\n";

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);

curl_close($ch);

echo "HTTP Status Code: $http_code\n";
echo "Curl Error: $curl_error\n";
echo "API Response:\n$response\n";
?>
