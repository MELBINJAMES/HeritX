<?php
// test_db_connection.php

require_once '../admin/public/api/db.php';

run_test("Database Connection Validation", function() use ($conn) {
    if (!$conn) {
        return "Connection object is null";
    }
    
    if ($conn->connect_error) {
        return "Connection Error: " . $conn->connect_error;
    }
    
    // Attempt a basic query
    $result = $conn->query("SHOW TABLES");
    if (!$result) {
        return "Failed to execute basic SHOW TABLES query.";
    }
    
    if ($result->num_rows == 0) {
        return "Database is connected but appears empty (no tables found).";
    }
    
    return true;
});
?>
