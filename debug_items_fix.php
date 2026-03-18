<?php
header("Content-Type: text/html; charset=utf-8");
?>
<!DOCTYPE html>
<html>
<head>
<title>HeritX - Items Debug</title>
<style>
  body { font-family: monospace; padding: 20px; background: #0f172a; color: #e2e8f0; }
  h2 { color: #38bdf8; }
  .ok { color: #4ade80; }
  .err { color: #f87171; }
  .warn { color: #fbbf24; }
  pre { background: #1e293b; padding: 16px; border-radius: 8px; overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; margin-top: 10px; }
  th { background: #1e3a5f; padding: 8px 12px; text-align: left; }
  td { padding: 8px 12px; border-bottom: 1px solid #334155; }
  tr:hover td { background: #1e293b; }
</style>
</head>
<body>
<h1>🔍 HeritX Items Diagnostics</h1>

<?php
// 1. Test DB connection
echo "<h2>1. Database Connection</h2>";
require_once __DIR__ . '/config.php';
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    echo "<p class='ok'>✅ Connected to database: <strong>" . DB_NAME . "</strong> on <strong>" . DB_HOST . "</strong></p>";
} catch (PDOException $e) {
    echo "<p class='err'>❌ Connection FAILED: " . $e->getMessage() . "</p>";
    die();
}

// 2. Check 'items' table
echo "<h2>2. Items Table Check</h2>";
try {
    $result = $pdo->query("SHOW TABLES LIKE 'items'");
    if ($result->rowCount() > 0) {
        echo "<p class='ok'>✅ 'items' table exists</p>";
    } else {
        echo "<p class='err'>❌ 'items' table does NOT exist!</p>";
    }
} catch (Exception $e) {
    echo "<p class='err'>❌ Error checking table: " . $e->getMessage() . "</p>";
}

// 3. Count all items
echo "<h2>3. Item Counts</h2>";
try {
    $total = $pdo->query("SELECT COUNT(*) as c FROM items")->fetch()['c'];
    $approved = $pdo->query("SELECT COUNT(*) as c FROM items WHERE is_approved = 1")->fetch()['c'];
    $pending = $pdo->query("SELECT COUNT(*) as c FROM items WHERE is_approved = 0 OR is_approved IS NULL")->fetch()['c'];
    echo "<p>Total items in DB: <strong>$total</strong></p>";
    echo "<p class='" . ($approved > 0 ? 'ok' : 'warn') . "'>Approved items (is_approved=1): <strong>$approved</strong></p>";
    echo "<p class='warn'>Pending/unapproved items: <strong>$pending</strong></p>";
    if ($total > 0 && $approved == 0) {
        echo "<p class='err'>⚠️ PROBLEM: You have $total items but NONE are approved! Items only show when <code>is_approved = 1</code>.</p>";
    }
} catch (Exception $e) {
    echo "<p class='err'>❌ Error: " . $e->getMessage() . "</p>";
}

// 4. Check is_approved column values
echo "<h2>4. is_approved Column Distribution</h2>";
try {
    $rows = $pdo->query("SELECT is_approved, COUNT(*) as count FROM items GROUP BY is_approved")->fetchAll();
    echo "<table><tr><th>is_approved value</th><th>Count</th></tr>";
    foreach ($rows as $r) {
        $v = $r['is_approved'];
        $cls = ($v == 1) ? 'ok' : 'warn';
        echo "<tr><td class='$cls'>$v</td><td>$r[count]</td></tr>";
    }
    echo "</table>";
} catch (Exception $e) {
    echo "<p class='err'>❌ Error: " . $e->getMessage() . "</p>";
}

// 5. Check users table join
echo "<h2>5. Users Table & JOIN Check</h2>";
try {
    $u = $pdo->query("SHOW TABLES LIKE 'users'")->rowCount();
    echo "<p class='" . ($u > 0 ? 'ok' : 'err') . "'>" . ($u > 0 ? '✅' : '❌') . " 'users' table " . ($u > 0 ? 'exists' : 'MISSING') . "</p>";

    $joined = $pdo->query("SELECT COUNT(*) as c FROM items i JOIN users u ON i.owner_id = u.id")->fetch()['c'];
    echo "<p>Items with valid owner (JOIN works): <strong>$joined</strong></p>";

    $orphans = $pdo->query("SELECT COUNT(*) as c FROM items i LEFT JOIN users u ON i.owner_id = u.id WHERE u.id IS NULL")->fetch()['c'];
    if ($orphans > 0) {
        echo "<p class='err'>⚠️ $orphans items have invalid/missing owner_id (orphaned rows)</p>";
    }
} catch (Exception $e) {
    echo "<p class='err'>❌ Error: " . $e->getMessage() . "</p>";
}

// 6. Run the exact query used by the frontend
echo "<h2>6. Simulating Frontend Query (items.php)</h2>";
try {
    $stmt = $pdo->query("SELECT i.*, COALESCE(op.shop_name, u.name) as shop_name, u.shop_city, u.shop_pincode,
                                u.latitude as shop_lat, u.longitude as shop_lng, 
                                COALESCE(op.profile_photo, u.profile_image) as shop_image,
                                u.offer_message, u.offer_title, u.offer_start, u.offer_end, u.offer_discount_percent
                         FROM items i
                         JOIN users u ON i.owner_id = u.id
                         LEFT JOIN owner_profile op ON op.owner_id = u.id
                         WHERE i.is_approved = 1
                         ORDER BY i.created_at DESC");
    $items = $stmt->fetchAll();
    $count = count($items);
    if ($count > 0) {
        echo "<p class='ok'>✅ Query returned <strong>$count item(s)</strong> — API should work!</p>";
        echo "<table><tr><th>ID</th><th>Name</th><th>Category</th><th>is_approved</th><th>image_url</th><th>owner</th></tr>";
        foreach (array_slice($items, 0, 10) as $item) {
            $img = htmlspecialchars($item['image_url'] ?? 'null');
            echo "<tr>
                <td>{$item['id']}</td>
                <td>" . htmlspecialchars($item['name']) . "</td>
                <td>" . htmlspecialchars($item['category'] ?? '') . "</td>
                <td class='ok'>{$item['is_approved']}</td>
                <td>$img</td>
                <td>" . htmlspecialchars($item['shop_name'] ?? $item['name'] ?? '') . "</td>
            </tr>";
        }
        echo "</table>";
        if ($count > 10) echo "<p>(showing first 10 of $count)</p>";
    } else {
        echo "<p class='err'>❌ Query returned 0 items — nothing to display on frontend!</p>";
    }
} catch (Exception $e) {
    echo "<p class='err'>❌ Query FAILED: " . $e->getMessage() . "</p>";
}

// 7. Check if owner_profile table exists
echo "<h2>7. owner_profile Table</h2>";
try {
    $op = $pdo->query("SHOW TABLES LIKE 'owner_profile'")->rowCount();
    echo "<p class='" . ($op > 0 ? 'ok' : 'warn') . "'>" . ($op > 0 ? '✅ exists' : '⚠️ missing (LEFT JOIN will still work)') . "</p>";
} catch (Exception $e) {
    echo "<p class='err'>error: " . $e->getMessage() . "</p>";
}

// 8. Test the raw API endpoint response
echo "<h2>8. API Endpoint Test</h2>";
echo "<p>Testing: <a href='/HertiX/user-dashboard/backend/api/items.php' target='_blank' style='color:#38bdf8'>/HertiX/user-dashboard/backend/api/items.php</a></p>";
try {
    // Direct PHP call to simulate API
    $api_check = $pdo->query("SELECT COUNT(*) as c FROM items WHERE is_approved = 1")->fetch();
    $api_count = $api_check['c'];
    if ($api_count > 0) {
        echo "<p class='ok'>✅ API should return $api_count item(s). Click the link above to verify the JSON output.</p>";
    } else {
        echo "<p class='err'>❌ API will return empty array — no approved items.</p>";
        echo "<h3>🔧 FIX: Approve All Items</h3>";
        echo "<form method='POST'><button type='submit' name='approve_all' style='padding:10px 20px;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:1rem;'>✅ Approve ALL items now</button></form>";
    }
} catch (Exception $e) {
    echo "<p class='err'>❌ Error: " . $e->getMessage() . "</p>";
}

// Handle form submission to approve all
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['approve_all'])) {
    try {
        $affected = $pdo->exec("UPDATE items SET is_approved = 1 WHERE is_approved = 0 OR is_approved IS NULL");
        echo "<p class='ok'>✅ Approved $affected item(s)! Refresh the page to verify.</p>";
    } catch (Exception $e) {
        echo "<p class='err'>❌ Failed to approve: " . $e->getMessage() . "</p>";
    }
}

// 9. Check image URLs
echo "<h2>9. Image URL Check</h2>";
try {
    $items = $pdo->query("SELECT id, name, image_url FROM items LIMIT 5")->fetchAll();
    echo "<p>Sample image_url values from DB:</p><pre>";
    foreach ($items as $item) {
        echo "ID {$item['id']}: " . ($item['image_url'] ?? 'NULL') . "\n";
    }
    echo "</pre>";
    echo "<p class='warn'>⚠️ Images are referenced as <code>/HertiX/{image_url}</code> in the frontend. Ensure the path is correct.</p>";
} catch (Exception $e) {
    echo "<p class='err'>❌ Error: " . $e->getMessage() . "</p>";
}
?>

</body>
</html>
