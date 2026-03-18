<?php
include 'db.php';
$tables = ['shopowners', 'categories', 'audit_logs', 'items'];
foreach ($tables as $table) {
    echo "<h3>$table</h3>";
    $res = $conn->query("DESCRIBE $table");
    if ($res) {
        while($row = $res->fetch_assoc()) {
            echo $row['Field'] . " - " . $row['Type'] . "<br>";
        }
    } else {
        echo "$table does not exist.<br>";
    }
}
?>
