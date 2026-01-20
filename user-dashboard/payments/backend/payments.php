<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include '../../../admin/public/api/db.php';

$user_id = 1; // Mock User ID for MVP

try {
    // Fetch History
    $history = [];
    $stmt = $conn->prepare("SELECT id, transaction_date, amount, payment_type, status FROM payments WHERE user_id = ? ORDER BY transaction_date DESC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $history[] = $row;
    }
    $stmt->close();

    // Calculate Summary
    $total_rent = 0;
    $active_deposits = 0;
    $refunds = 0;

    foreach ($history as $txn) {
        if ($txn['status'] == 'paid') {
            if (stripos($txn['payment_type'], 'deposit') !== false) {
                $active_deposits += $txn['amount'];
            } else {
                $total_rent += $txn['amount'];
            }
        } elseif ($txn['status'] == 'refunded') {
            $refunds += $txn['amount'];
        }
    }

    $summary = [
        "total_rent_paid" => $total_rent,
        "active_deposits" => $active_deposits,
        "refunds_processed" => $refunds
    ];

    echo json_encode([
        "summary" => $summary,
        "history" => $history
    ]);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
