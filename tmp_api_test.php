<?php
// Simulate the exact API call from the frontend
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET = [];

// Capture output
ob_start();
require_once 'user-dashboard/backend/api/items.php';
$output = ob_get_clean();

echo "API Output Length: " . strlen($output) . " bytes\n";
$decoded = json_decode($output, true);
if ($decoded === null) {
    echo "ERROR: Invalid JSON! First 500 chars:\n" . substr($output, 0, 500) . "\n";
} else {
    echo "JSON is valid. Items returned: " . count($decoded) . "\n";
    foreach (array_slice($decoded, 0, 3) as $item) {
        echo "  - ID {$item['id']}: {$item['name']}\n";
    }
}
