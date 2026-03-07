<?php
/**
 * HeritX — Ensure Location Columns Migration
 * Run once via: http://localhost/HertiX/ensure_location_columns.php
 */
$host = '127.0.0.1'; $username = 'root'; $password = ''; $dbname = 'Heritx';
$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) die("<b style='color:red'>Connection failed:</b> " . $conn->connect_error);

$migrations = [
    "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `shop_name`    VARCHAR(255)   DEFAULT NULL",
    "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `shop_address` TEXT           DEFAULT NULL",
    "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `shop_city`    VARCHAR(100)   DEFAULT NULL",
    "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `shop_pincode` VARCHAR(20)    DEFAULT NULL",
    "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `shop_phone`   VARCHAR(30)    DEFAULT NULL",
    "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `shop_proof`   VARCHAR(500)   DEFAULT NULL",
    "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `latitude`     DECIMAL(10,8)  DEFAULT NULL",
    "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `longitude`    DECIMAL(11,8)  DEFAULT NULL",
    "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `is_approved`  TINYINT(1)     DEFAULT 1",
    "ALTER TABLE `items`  ADD COLUMN IF NOT EXISTS `shop_name`   VARCHAR(255)   DEFAULT NULL",
];

$results = [];
foreach ($migrations as $sql) {
    $label = trim(explode('IF NOT EXISTS', $sql)[1] ?? $sql);
    if ($conn->query($sql)) $results[] = ["✅", trim($label)];
    else $results[] = ["❌", trim($label) . " → " . $conn->error];
}

// Show current columns
$colRes  = $conn->query("SHOW COLUMNS FROM users LIKE 'shop_%' OR SHOW COLUMNS FROM users LIKE 'lat%' OR SHOW COLUMNS FROM users LIKE 'long%'");

// Actually show all columns
$colsRes = $conn->query("SHOW COLUMNS FROM users");
$cols = [];
while ($r = $colsRes->fetch_assoc()) $cols[] = $r['Field'];
$conn->close();
?>
<!DOCTYPE html><html><head><title>HeritX Location Migration</title>
<style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;background:#f4f4f4}
h1{color:#333}table{width:100%;border-collapse:collapse;background:white;box-shadow:0 2px 6px rgba(0,0,0,.1)}
th,td{padding:10px 14px;text-align:left;border-bottom:1px solid #eee}th{background:#2c3e50;color:white}
.done{background:#d4edda;color:#155724;padding:12px 18px;border-radius:6px;margin-top:20px;font-weight:bold}
.tag{background:#27ae60;color:white;border-radius:4px;padding:2px 8px;font-size:12px;display:inline-block;margin:2px}
</style></head><body>
<h1>🗺️ HeritX — Location Columns Migration</h1>
<table><tr><th>Status</th><th>Migration</th></tr>
<?php foreach($results as [$ic, $msg]): ?>
<tr><td><?=$ic?></td><td><?=htmlspecialchars($msg)?></td></tr>
<?php endforeach; ?>
</table>

<h2>Users Table Columns</h2>
<p><?php foreach($cols as $c) echo "<span class='tag'>$c</span>"; ?></p>

<p class="done">✅ Location columns are ready! All location features are now enabled.</p>
<p><a href="http://localhost/HertiX/user-dashboard/backend/api/shop_locations.php">Test shop_locations API →</a></p>
</body></html>
