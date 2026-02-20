<?php
// Test Script for Revenue and Stock Update
require 'c:/xampp/htdocs/HertiX/admin/public/api/db.php';

// 1. Setup Test Data
$ownerId = 1; // Assuming admin/owner exists
$userId = 2; // Assuming a customer exists
$itemId = 0;

// Create a test item
$conn->query("INSERT INTO items (owner_id, name, price_per_day, quantity, category, description, image_url) VALUES ($ownerId, 'Test Revenue Item', 100, 10, 'Test', 'Desc', 'test.jpg')");
$itemId = $conn->insert_id;

// Get initial state
$res = $conn->query("SELECT wallet_balance FROM users WHERE id = $ownerId");
$initialWallet = $res->fetch_assoc()['wallet_balance'];

$res = $conn->query("SELECT quantity FROM items WHERE id = $itemId");
$initialQty = $res->fetch_assoc()['quantity'];

echo "Initial Wallet: $initialWallet\n";
echo "Initial Qty: $initialQty\n";

// 2. Call rentals.php (Simulate POST)
$url = 'http://localhost/HertiX/user-dashboard/backend/api/rentals.php';
$data = [
    'user_id' => $userId,
    'cart' => [
        [
            'id' => $itemId,
            'name' => 'Test Revenue Item',
            'price_per_day' => 100,
            'qty' => 2,
            'deposit_amount' => 50
        ]
    ],
    'start_date' => date('Y-m-d'),
    'end_date' => date('Y-m-d', strtotime('+2 days')),
    'duration' => 2,
    'total_amount' => 500, // (100 * 2 * 2) + (50 * 2) = 400 + 100 = 500
    'payment_method' => 'card',
    'delivery_method' => 'pickup',
    'phone' => '1234567890'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
curl_close($ch);

echo "Response: $response\n";

// 3. Verify Updates
$res = $conn->query("SELECT wallet_balance FROM users WHERE id = $ownerId");
$finalWallet = $res->fetch_assoc()['wallet_balance'];

$res = $conn->query("SELECT quantity FROM items WHERE id = $itemId");
$finalQty = $res->fetch_assoc()['quantity'];

echo "Final Wallet: $finalWallet\n";
echo "Final Qty: $finalQty\n";

// Expected: Wallet + 400 (Rent only, deposit usually held? Code credits itemTotal + fee. ItemTotal = 100*2*2 = 400)
// Expected: Qty - 2 = 8

if ($finalWallet == $initialWallet + 400 && $finalQty == $initialQty - 2) {
    echo "SUCCESS: Revenue credited and Stock reduced.\n";
} else {
    echo "FAILED: Check logic.\n";
}

// Cleanup
//$conn->query("DELETE FROM items WHERE id = $itemId");
//$conn->query("DELETE FROM rentals WHERE item_id = $itemId");
//$conn->query("UPDATE users SET wallet_balance = $initialWallet WHERE id = $ownerId");
?>
