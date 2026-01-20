<?php
// Database Configuration
$host = 'localhost';
$db_name = 'Heritx'; // Synced with Admin Panel db
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Auto-Seeding Logic
    try {
        $result = $pdo->query("SHOW TABLES LIKE 'items'");
        if ($result->rowCount() == 0) {
            // Table doesn't exist, run schema.sql
            $schemaPath = __DIR__ . '/../schema.sql';
            if (file_exists($schemaPath)) {
                $sql = file_get_contents($schemaPath);
                
                // Remove comments to prevent execution errors
                $sql = preg_replace('/--.*$/m', '', $sql);
                
                // Split by semicolon
                $statements = explode(';', $sql);
                
                foreach ($statements as $statement) {
                    $statement = trim($statement);
                    if (!empty($statement)) {
                        $pdo->exec($statement);
                    }
                }
            }
        }
    } catch (Exception $e) {
        // Silent fail or log for auto-seeding to not block main app connectivity if irrelevant
        error_log("Auto-seeding error: " . $e->getMessage());
    }
} catch (PDOException $e) {
    // In a real production app, log this instead of showing it
    die("Database Connection Failed: " . $e->getMessage());
}
?>
