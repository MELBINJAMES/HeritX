<?php
include 'db.php';
echo "<h2>Owner Profile Schema</h2>";
$res = $conn->query("SHOW CREATE TABLE owner_profile");
if ($res && $row = $res->fetch_assoc()) {
    echo "<pre>" . htmlspecialchars($row['Create Table']) . "</pre>";
} else {
    echo "Error getting schema: " . $conn->error;
}

echo "<h2>Check Duplicates</h2>";
$res2 = $conn->query("SELECT owner_id, COUNT(*) as c FROM owner_profile GROUP BY owner_id HAVING c > 1");
if ($res2->num_rows > 0) {
    echo "Found duplicates:<br>";
    while ($row = $res2->fetch_assoc()) {
        print_r($row);
    }
} else {
    echo "No duplicates found based on owner_id.<br>";
}
echo "<h2>Rows for owner_id = 9 (Example)</h2>"; // Trying an arbitrary ID or one likely to exist? Or just list all if small?
$res3 = $conn->query("SELECT * FROM owner_profile LIMIT 5");
while ($row = $res3->fetch_assoc()) {
    print_r($row);
    echo "<hr>";
}
?>
