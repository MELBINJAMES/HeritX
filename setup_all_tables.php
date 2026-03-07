<?php
/**
 * HeritX - Full Database Setup / Repair Script
 * Run this once via: http://localhost/HertiX/setup_all_tables.php
 */

$host     = '127.0.0.1';
$username = 'root';
$password = '';
$dbname   = 'Heritx';

$conn = new mysqli($host, $username, $password);
if ($conn->connect_error) {
    die("<b style='color:red'>Connection Failed:</b> " . $conn->connect_error);
}

// Create / Use database
$conn->query("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$conn->select_db($dbname);

$results = [];

// ─── HELPER ───────────────────────────────────────────────────────────────────
function run($conn, $sql, $label, &$results) {
    if ($conn->query($sql) === TRUE) {
        $results[] = ["✅", $label];
    } else {
        $results[] = ["❌", "$label → " . $conn->error];
    }
}

// ─── USERS TABLE ─────────────────────────────────────────────────────────────
run($conn, "CREATE TABLE IF NOT EXISTS `users` (
    `id`            INT AUTO_INCREMENT PRIMARY KEY,
    `name`          VARCHAR(255) NOT NULL,
    `email`         VARCHAR(255) NOT NULL UNIQUE,
    `password`      VARCHAR(255) NOT NULL,
    `role`          ENUM('admin','shop_owner','renter','Finder','Shop Owner') DEFAULT 'renter',
    `phone`         VARCHAR(30) DEFAULT NULL,
    `address`       TEXT DEFAULT NULL,
    `location`      VARCHAR(255) DEFAULT NULL,
    `gender`        VARCHAR(20) DEFAULT NULL,
    `dob`           DATE DEFAULT NULL,
    `bio`           TEXT DEFAULT NULL,
    `profile_image` VARCHAR(500) DEFAULT NULL,
    `is_approved`   TINYINT(1) DEFAULT 1,
    `shop_name`     VARCHAR(255) DEFAULT NULL,
    `shop_address`  TEXT DEFAULT NULL,
    `shop_city`     VARCHAR(100) DEFAULT NULL,
    `shop_phone`    VARCHAR(30) DEFAULT NULL,
    `shop_proof`    VARCHAR(500) DEFAULT NULL,
    `pincode`       VARCHAR(20) DEFAULT NULL,
    `lat`           DECIMAL(10,8) DEFAULT NULL,
    `lng`           DECIMAL(11,8) DEFAULT NULL,
    `otp`           VARCHAR(10) DEFAULT NULL,
    `otp_expiry`    DATETIME DEFAULT NULL,
    `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", "users table", $results);

// ─── SEED ADMIN ───────────────────────────────────────────────────────────────
run($conn, "INSERT IGNORE INTO `users` (id, name, email, password, role, is_approved) VALUES
    (1, 'HeritX Admin', 'admin@heritx.com', '" . password_hash('Admin@123', PASSWORD_DEFAULT) . "', 'admin', 1)",
    "Seed admin user", $results);

// ─── ITEMS TABLE ──────────────────────────────────────────────────────────────
run($conn, "CREATE TABLE IF NOT EXISTS `items` (
    `id`            INT AUTO_INCREMENT PRIMARY KEY,
    `owner_id`      INT NOT NULL,
    `name`          VARCHAR(255) NOT NULL,
    `category`      VARCHAR(100) NOT NULL,
    `occasion`      VARCHAR(100) DEFAULT NULL,
    `description`   TEXT DEFAULT NULL,
    `price_per_day` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `price`         DECIMAL(10,2) DEFAULT NULL,
    `deposit_amount`DECIMAL(10,2) NOT NULL DEFAULT 0,
    `guidance`      TEXT DEFAULT NULL,
    `image_url`     VARCHAR(500) DEFAULT NULL,
    `is_available`  TINYINT(1) DEFAULT 1,
    `is_approved`   TINYINT(1) DEFAULT 1,
    `quantity`      INT DEFAULT 5,
    `dos`           TEXT DEFAULT NULL,
    `donts`         TEXT DEFAULT NULL,
    `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", "items table", $results);

// ─── RENTALS TABLE ────────────────────────────────────────────────────────────
run($conn, "CREATE TABLE IF NOT EXISTS `rentals` (
    `id`                INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`           INT NOT NULL,
    `item_id`           INT NOT NULL,
    `start_date`        DATE NOT NULL,
    `end_date`          DATE NOT NULL,
    `total_price`       DECIMAL(10,2) NOT NULL DEFAULT 0,
    `deposit_amount`    DECIMAL(10,2) DEFAULT 0,
    `status`            ENUM('active','pending','completed','overdue','cancelled') DEFAULT 'pending',
    `delivery_method`   VARCHAR(50) DEFAULT 'pickup',
    `delivery_address`  TEXT DEFAULT NULL,
    `delivery_city`     VARCHAR(100) DEFAULT NULL,
    `delivery_pincode`  VARCHAR(20) DEFAULT NULL,
    `delivery_cost`     DECIMAL(10,2) DEFAULT 0,
    `phone`             VARCHAR(30) DEFAULT NULL,
    `payment_method`    VARCHAR(50) DEFAULT 'cash',
    `razorpay_order_id` VARCHAR(255) DEFAULT NULL,
    `razorpay_payment_id` VARCHAR(255) DEFAULT NULL,
    `created_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", "rentals table", $results);

// ─── PAYMENTS TABLE ───────────────────────────────────────────────────────────
run($conn, "CREATE TABLE IF NOT EXISTS `payments` (
    `id`                    INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`               INT NOT NULL,
    `rental_id`             INT DEFAULT NULL,
    `amount`                DECIMAL(10,2) NOT NULL,
    `payment_type`          ENUM('rent','deposit','penalty','delivery') NOT NULL,
    `status`                ENUM('paid','refunded','pending') DEFAULT 'paid',
    `razorpay_order_id`     VARCHAR(255) DEFAULT NULL,
    `razorpay_payment_id`   VARCHAR(255) DEFAULT NULL,
    `razorpay_signature`    VARCHAR(500) DEFAULT NULL,
    `transaction_date`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", "payments table", $results);

// ─── NOTIFICATIONS TABLE ──────────────────────────────────────────────────────
run($conn, "CREATE TABLE IF NOT EXISTS `notifications` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`    INT NOT NULL,
    `title`      VARCHAR(255) NOT NULL,
    `message`    TEXT NOT NULL,
    `is_read`    TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", "notifications table", $results);

// ─── WISHLIST TABLE ───────────────────────────────────────────────────────────
run($conn, "CREATE TABLE IF NOT EXISTS `wishlist` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`    INT NOT NULL,
    `item_id`    INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_wishlist` (`user_id`, `item_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", "wishlist table", $results);

// ─── BOOKINGS TABLE ───────────────────────────────────────────────────────────
run($conn, "CREATE TABLE IF NOT EXISTS `bookings` (
    `id`           INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`      INT NOT NULL,
    `item_id`      INT NOT NULL,
    `booking_date` DATE NOT NULL,
    `event_date`   DATE NOT NULL,
    `status`       ENUM('confirmed','pending','cancelled') DEFAULT 'pending',
    `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", "bookings table", $results);

// ─── CATEGORIES TABLE (needed by admin_dashboard_data.php) ────────────────────
run($conn, "CREATE TABLE IF NOT EXISTS `categories` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `name`       VARCHAR(100) NOT NULL,
    `type`       VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", "categories table", $results);

// ─── AUDIT_LOGS TABLE (needed by admin_dashboard_data.php) ───────────────────
run($conn, "CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `action`     VARCHAR(255) NOT NULL,
    `details`    TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", "audit_logs table", $results);

// ─── SEED CATEGORIES ──────────────────────────────────────────────────────────
run($conn, "INSERT IGNORE INTO `categories` (name, type) VALUES
    ('Wedding','occasion'),('Onam','occasion'),('Festival','occasion'),('Housewarming','occasion'),
    ('Attire','category'),('Decor','category'),('Ritual','category'),
    ('Martial Arts','category'),('Costumes','category'),('Handicrafts','category'),('Instruments','category')",
    "Seed categories", $results);

// ─── SHOW TABLES ─────────────────────────────────────────────────────────────
$tables = [];
$res = $conn->query("SHOW TABLES");
while ($row = $res->fetch_row()) $tables[] = $row[0];

$conn->close();
?>
<!DOCTYPE html>
<html>
<head>
<title>HeritX DB Setup</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 750px; margin: 40px auto; background: #f4f4f4; }
  h1 { color: #333; }
  h2 { color: #555; margin-top: 30px; }
  table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 6px rgba(0,0,0,.1); }
  th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #eee; }
  th { background: #2c3e50; color: white; }
  .tag { display: inline-block; background: #27ae60; color: white; border-radius: 4px; padding: 2px 8px; font-size: 12px; }
  .done { background: #d4edda; color: #155724; padding: 12px 18px; border-radius: 6px; margin-top: 20px; font-weight: bold; }
</style>
</head>
<body>
<h1>🛕 HeritX — Database Setup Complete</h1>

<h2>Setup Results</h2>
<table>
  <tr><th>Status</th><th>Task</th></tr>
  <?php foreach ($results as [$icon, $msg]): ?>
  <tr><td><?= $icon ?></td><td><?= htmlspecialchars($msg) ?></td></tr>
  <?php endforeach; ?>
</table>

<h2>Tables in <code><?= $dbname ?></code></h2>
<table>
  <tr><th>#</th><th>Table Name</th></tr>
  <?php foreach ($tables as $i => $t): ?>
  <tr><td><?= $i+1 ?></td><td><span class="tag"><?= $t ?></span></td></tr>
  <?php endforeach; ?>
</table>

<p class="done">✅ Database is fully set up and connected to XAMPP! You can now run both frontends.</p>
</body>
</html>
