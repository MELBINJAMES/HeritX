<?php
include 'db.php';

try {
    // 1. Create Notifications Table
    $sql = "CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )";
    $conn->query($sql);
    echo "Checked/Created notifications table.<br>";

    // 2. Create Payments Table
    $sql = "CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        rental_id INT,
        amount DECIMAL(10, 2) NOT NULL,
        payment_type ENUM('rent', 'deposit', 'penalty') NOT NULL,
        status ENUM('paid', 'refunded', 'pending') DEFAULT 'paid',
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )";
    $conn->query($sql);
    echo "Checked/Created payments table.<br>";

    // 3. Create Bookings Table
    $sql = "CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        item_id INT NOT NULL,
        booking_date DATE NOT NULL,
        event_date DATE NOT NULL,
        status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )";
    $conn->query($sql);
    echo "Checked/Created bookings table.<br>";

    // 4. Create Wishlist Table
    $sql = "CREATE TABLE IF NOT EXISTS wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        item_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (item_id) REFERENCES items(id),
        UNIQUE KEY unique_wishlist (user_id, item_id)
    )";
    $conn->query($sql);
    echo "Checked/Created wishlist table.<br>";

    echo "All tables verified successfully.";

} catch (Exception $e) {
    echo "Table creation error: " . $e->getMessage();
}
?>
