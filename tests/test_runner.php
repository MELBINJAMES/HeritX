<?php
// test_runner.php

function run_test($test_name, $test_function) {
    echo str_pad("Running $test_name...", 50, ".");
    
    try {
        $result = $test_function();
        if ($result === true) {
            echo " [\033[32mPASSED\033[0m]\n";
        } else {
            echo " [\033[31mFAILED\033[0m] - $result\n";
        }
    } catch (Exception $e) {
        echo " [\033[31mERROR\033[0m] - Exception: " . $e->getMessage() . "\n";
    }
}

// Helper to make mock API requests to localhost
function make_get_request($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    // Ignore SSL for local testing if any
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $output = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'code' => $httpcode,
        'body' => $output
    ];
}

echo "==========================================\n";
echo "        HERITX AUTOMATED TEST SUITE       \n";
echo "==========================================\n\n";

// Require the actual test files
require_once 'test_db_connection.php';
require_once 'test_public_apis.php';

echo "\n==========================================\n";
echo "              TESTING COMPLETE              \n";
echo "==========================================\n";
?>
