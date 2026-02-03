-- Database Schema for HeritX User Dashboard Module

-- Table: items (Traditional rental items)
-- Table: users (Shop Owners and Renters)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'shop_owner', 'renter') DEFAULT 'renter',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: items (Traditional rental items)
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL, -- Link to Shop Owner
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    occasion VARCHAR(100),
    description TEXT,
    price_per_day DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    guidance TEXT,
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT TRUE,
    quantity INT DEFAULT 5,
    dos TEXT,
    donts TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Table: rentals (Active and past rentals)
CREATE TABLE IF NOT EXISTS rentals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('active', 'completed', 'overdue') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: bookings (Booking history / future bookings)
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    booking_date DATE NOT NULL,
    event_date DATE NOT NULL,
    status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: payments
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    rental_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_type ENUM('rent', 'deposit', 'penalty') NOT NULL,
    status ENUM('paid', 'refunded', 'pending') DEFAULT 'paid',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: wishlist (User favorite items)
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE KEY unique_wishlist (user_id, item_id)
);

-- Seed Data: Users
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Melbin James', 'owner@hertix.com', 'password123', 'shop_owner'),
(2, 'Demo Renter', 'renter@hertix.com', 'password123', 'renter')
ON DUPLICATE KEY UPDATE name=name;

-- Seed Data: Items (Assigned to Owner ID 1)
INSERT INTO items (owner_id, name, category, occasion, price_per_day, deposit_amount, description, guidance, image_url, quantity, dos, donts) VALUES 
(1, 'Traditional Nettipattam', 'Decor', 'Wedding', 1500.00, 3000.00, 'Authentic Gold-plated Elephant Caparison used for wall decor.', 'Keep away from moisture', 'nettipattam.png', 5, 'Hang in a dry place\nDust regularly with a soft cloth', 'Do not expose to direct sunlight for long\nDo not wash with water'),
(1, 'Premium Kasavu Saree', 'Attire', 'Onam', 500.00, 1000.00, 'Handwoven Kerala Saree with pure golden zari border.', 'Dry clean only', 'saree.png', 10, 'Dry clean only\nStore in a cool dry place', 'Do not machine wash\nDo not use bleach'),
(1, 'Antique Bronze Lamp', 'Decor', 'Housewarming', 350.00, 700.00, 'Heavy bronze oil lamp (Nilavilakku) for traditional lighting ceremonies.', 'Clean with oil', 'lamp.png', 8, 'Clean with Pitambari or tamarind\nUse good quality oil', 'Do not drop\nDo not leave soot uncleaned'),
(1, 'Kathakali Full Set Costume', 'Attire', 'Festival', 2500.00, 5000.00, 'Complete authentic Kathakali dance costume with headgear.', 'Handle with care', 'kathakali.png', 3, 'Handle with extreme care\nStore in a trunk with silica gel', 'Do not fold the headgear\nDo not wash at home'),
(1, 'Aranmula Kannadi', 'Decor', 'Wedding', 2000.00, 4000.00, 'Distinct handmade metal-alloy mirror from Kerala, known for reflection clarity.', 'Do not touch mirror surface', 'aranmula_kannadi_1767674910851.png', 2, 'Wipe only with a velvet cloth\nKeep away from moisture', 'Do not touch the mirror surface with fingers\nDo not use chemical cleaners'),
(1, 'Traditional Para', 'Ritual', 'Wedding', 300.00, 600.00, 'Brass rice measuring vessel used for filling paddy in auspicious ceremonies.', 'Polish regularly', 'para_measure_1767674927310.png', 12, 'Polish with brass cleaner\nKeep in a prominent place', 'Do not use for liquids\nDo not store in damp areas');

INSERT INTO notifications (user_id, title, message) VALUES 
(1, 'Welcome to HeritX', 'Start browsing our traditional collection today!');
