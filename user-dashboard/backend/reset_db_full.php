<?php
// Config
$host = 'localhost';
$db_name = 'hertix_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected to database.\n";

    // Disable Foreign Key Checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

    // Drop Tables
    $tables = ['items', 'users', 'rentals', 'bookings', 'payments', 'notifications'];
    foreach ($tables as $table) {
        $pdo->exec("DROP TABLE IF EXISTS $table");
        echo "Dropped table: $table\n";
    }

    // Enable Foreign Key Checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    // Run Schema
    $schemaPath = __DIR__ . '/schema.sql';
    if (file_exists($schemaPath)) {
        $sql = file_get_contents($schemaPath);
        
        // Remove comments
        $sql = preg_replace('/--.*$/m', '', $sql);
        
        // Execute split statements
        $statements = explode(';', $sql);
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement)) {
                $pdo->exec($statement);
            }
        }
        echo "Schema imported successfully.\n";
    } else {
        echo "Schema file not found!\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
