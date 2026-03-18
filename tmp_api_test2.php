<?php
// Run exactly as it would from Apache context
chdir(__DIR__ . '/user-dashboard/backend/api');

$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET = [];

ob_start();
include 'items.php';
$output = ob_get_clean();

$first200 = substr($output, 0, 200);
echo "=== First 200 chars of API output ===\n";
echo $first200 . "\n";
echo "\n=== Length: " . strlen($output) . " chars ===\n";

$decoded = json_decode($output, true);
if ($decoded !== null) {
    echo "✅ Valid JSON, " . count($decoded) . " items returned\n";
} else {
    echo "❌ INVALID JSON - this would cause items to not show!\n";
    echo "JSON Error: " . json_last_error_msg() . "\n";
}

// Restore directory
chdir(__DIR__);
