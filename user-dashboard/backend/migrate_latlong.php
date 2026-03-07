<?php
require_once 'backend/config/db.php';

$queries = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8) NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8) NULL",
];

$errors = [];
foreach ($queries as $sql) {
    try {
        $pdo->exec($sql);
        echo "OK: " . htmlspecialchars($sql) . "<br>";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "SKIP (already exists): " . htmlspecialchars($sql) . "<br>";
        } else {
            $errors[] = $e->getMessage();
            echo "ERROR: " . htmlspecialchars($e->getMessage()) . "<br>";
        }
    }
}

echo empty($errors) ? "<br><strong>Migration complete!</strong>" : "<br><strong>Migration finished with errors.</strong>";
?>
