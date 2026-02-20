<?php
include 'db.php';
header('Content-Type: application/json');

try {
    $result = $conn->query("DESCRIBE rentals");
    $columns = [];
    while ($row = $result->fetch_assoc()) {
        $columns[] = $row['Field'];
    }
    echo json_encode(["status" => "success", "columns" => $columns]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
