<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=HeritX;charset=utf8', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $total = $pdo->query('SELECT COUNT(*) FROM items')->fetchColumn();
    $approved = $pdo->query('SELECT COUNT(*) FROM items WHERE is_approved = 1')->fetchColumn();
    echo "Total items: $total\n";
    echo "Approved items: $approved\n";
    if ($approved == 0 && $total > 0) {
        $fix = $pdo->exec('UPDATE items SET is_approved = 1');
        echo "FIXED! Approved $fix items now.\n";
    } elseif ($approved > 0) {
        echo "OK: $approved items are already approved and should show on frontend.\n";
    } else {
        echo "WARNING: No items in database at all!\n";
    }
    $rows = $pdo->query('SELECT id, name, is_approved, image_url FROM items LIMIT 8')->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $r) {
        echo "ID {$r['id']}: {$r['name']} | approved={$r['is_approved']} | img={$r['image_url']}\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
