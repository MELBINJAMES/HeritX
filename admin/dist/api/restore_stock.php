<?php
include 'db.php';

// Script to restore items.quantity to "Total physical stock"
// because it was being decreased on every order but never increased back.

$items_query = "SELECT id, quantity, name FROM items";
$items_res = $conn->query($items_query);

$restored_count = 0;

while ($item = $items_res->fetch_assoc()) {
    $item_id = $item['id'];
    $current_qty = intval($item['quantity']);
    
    // Sum all quantities from rentals that were NOT cancelled 
    // (these were the ones that triggered a subtraction in legacy code)
    $rentals_query = "SELECT SUM(quantity) as subtracted_total FROM rentals WHERE item_id = $item_id AND status != 'cancelled'";
    $rentals_res = $conn->query($rentals_query);
    $rentals_data = $rentals_res->fetch_assoc();
    $subtracted_total = intval($rentals_data['subtracted_total'] ?? 0);
    
    if ($subtracted_total > 0) {
        $new_total = $current_qty + $subtracted_total;
        $update_query = "UPDATE items SET quantity = $new_total WHERE id = $item_id";
        if ($conn->query($update_query)) {
            echo "Item '{$item['name']}': Restored $subtracted_total units. New total stock: $new_total\n";
            $restored_count++;
        }
    }
}

echo "\nFinished. Restored stock for $restored_count items.\n";
?>
