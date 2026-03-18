<?php
// Quick utility to save the Kathakali image locally to /public
$url = 'https://www.keralatourspackage.com/images/destination/kathakali1.jpg';
$dest = __DIR__ . '/kathakali.jpg';

$ctx = stream_context_create(['http' => [
    'header' => "User-Agent: Mozilla/5.0\r\n",
    'timeout' => 15
]]);

$img = @file_get_contents($url, false, $ctx);
if ($img !== false) {
    file_put_contents($dest, $img);
    echo "Success! Saved " . strlen($img) . " bytes to " . $dest;
} else {
    echo "Failed to download from: " . $url;
}
?>
