<?php
$urls = [
    'https://images.unsplash.com/photo-1602425116124-b8e1edea0000?w=600&q=80' => 'unsplash_kathakali.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Kathakali_head_dress.jpg/600px-Kathakali_head_dress.jpg' => 'wiki_kathakali.jpg'
];

$ctx = stream_context_create([
    'http' => [
        'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\r\nAccept: image/webp,image/apng,image/*,*/*;q=0.8\r\n",
        'timeout' => 15
    ]
]);

foreach ($urls as $url => $filename) {
    $img = @file_get_contents($url, false, $ctx);
    if ($img !== false) {
        file_put_contents(__DIR__ . '/' . $filename, $img);
        echo "Success! Saved $filename (" . strlen($img) . " bytes)\n";
    } else {
        echo "Failed to download: $url\n";
    }
}
?>
