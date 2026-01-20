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

-- Seed Data: Users
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Melbin James', 'owner@hertix.com', 'password123', 'shop_owner'),
(2, 'Demo Renter', 'renter@hertix.com', 'password123', 'renter')
ON DUPLICATE KEY UPDATE name=name;

-- Seed Data: Items (Assigned to Owner ID 1)
INSERT INTO items (owner_id, name, category, occasion, price_per_day, deposit_amount, description, guidance, image_url) VALUES 
(1, 'Traditional Nettipattam', 'Decor', 'Wedding', 1500.00, 3000.00, 'Authentic Gold-plated Elephant Caparison used for wall decor.', 'Keep away from moisture', 'nettipattam.png'),
(1, 'Premium Kasavu Saree', 'Attire', 'Onam', 500.00, 1000.00, 'Handwoven Kerala Saree with pure golden zari border.', 'Dry clean only', 'saree.png'),
(1, 'Antique Bronze Lamp', 'Decor', 'Housewarming', 350.00, 700.00, 'Heavy bronze oil lamp (Nilavilakku) for traditional lighting ceremonies.', 'Clean with oil', 'lamp.png'),
(1, 'Kathakali Full Set Costume', 'Attire', 'Festival', 2500.00, 5000.00, 'Complete authentic Kathakali dance costume with headgear.', 'Handle with care', 'kathakali.png'),
(1, 'Aranmula Kannadi', 'Decor', 'Wedding', 2000.00, 4000.00, 'Distinct handmade metal-alloy mirror from Kerala, known for reflection clarity.', 'Do not touch mirror surface', 'aranmula_kannadi_1767674910851.png'),
(1, 'Traditional Para', 'Ritual', 'Wedding', 300.00, 600.00, 'Brass rice measuring vessel used for filling paddy in auspicious ceremonies.', 'Polish regularly', 'para_measure_1767674927310.png'),
(1, 'Kindi Vessel', 'Ritual', 'Pooja', 200.00, 400.00, 'Traditional brass spouted vessel used for rituals and washing feet.', 'Wash with tamarind', 'kindi_vessel_1767674944913.png'),
(1, 'Large Uruli', 'Decor', 'Event', 600.00, 1200.00, 'Wide-mouthed brass cooking vessel, often filled with water and flowers.', 'Heavy item, handle care', 'uruli_vessel_1767674959512.png'),
(1, 'Thookkuvilakku', 'Decor', 'Festival', 450.00, 900.00, 'Hanging bronze oil lamp with intricate chain details.', 'Hang securely', 'thookkuvilakku_1767674974908.png'),
(1, 'Chenda Drum', 'Art', 'Festival', 800.00, 2000.00, 'Cylindrical percussion instrument used in festivals and Kathakali.', 'Keep dry', 'chenda_drum_1767674998851.png'),
(1, 'Idakka', 'Art', 'Temple', 700.00, 1500.00, 'Hourglass-shaped drum, considered a divine instrument.', 'Sensitive skin', 'idakka_drum_1767675014335.png'),
(1, 'Theyyam Headgear', 'Art', 'Performance', 3000.00, 6000.00, 'Elaborate crown used in Theyyam ritual art forms.', 'Extremely fragile', 'theyyam_headgear_1767675032833.png'),
(1, 'Mohiniyattam Costume', 'Attire', 'Dance', 1200.00, 2400.00, 'Classical dance costume, off-white saree with gold borders.', 'Dry clean', 'mohiniyattam_costume_1767675048561.png'),
(1, 'Settu Mundu', 'Attire', 'Onam', 400.00, 800.00, 'Traditional two-piece attire for women with kasavu border.', 'Iron low heat', 'settu_mundu_1767675065583.png'),
(1, 'Palakka Mala', 'Jewelry', 'Wedding', 1000.00, 5000.00, 'Green stone necklace resembling leaves, gold plated.', 'Store in box', 'palakka_mala_1767675089138.png'),
(1, 'Nagapada Thali', 'Jewelry', 'Wedding', 1200.00, 5000.00, 'Vintage necklace with snake hood shaped pendants.', 'Avoid perfume', 'nagapada_thali_1767675109162.png'),
(1, 'Kasu Mala', 'Jewelry', 'Wedding', 1500.00, 6000.00, 'Traditional Lakshmi coin necklace.', 'Store separately', 'kasu_mala_1767675127547.png'),
(1, 'Odakkuzhal', 'Art', 'Music', 150.00, 300.00, 'Bamboo flute used in classical music.', 'Fragile bamboo', 'odakkuzhal_flute_1767675143419.png'),
(1, 'Kathakali Mask', 'Decor', 'Home', 250.00, 500.00, 'Decorative papier-mache mask for wall hanging.', 'Dust gently', 'kathakali_mask_decor_1767675161290.png'),
(1, 'Chundan Vallam Model', 'Decor', 'Souvenir', 350.00, 700.00, 'Miniature wooden model of the famous Snake Boat.', 'Wood polish', 'chundan_vallam_model_1767675187482.png'),
(1, 'Mural Painting', 'Art', 'Decor', 2000.00, 5000.00, 'Framed Kerala mural painting of Hindu gods.', 'Keep out of direct sun', 'mural_painting_1767675205390.png'),
(1, 'Vennai Thali', 'Ritual', 'Krishna Jayanthi', 400.00, 800.00, 'Pot for Butter Krishna, decorated clay or brass.', 'Fragile if clay', 'vennai_thali_1767675223415.png'),
(1, 'Puli Kali Mask', 'Art', 'Festival', 300.00, 600.00, 'Tiger mask used in street folk art.', 'Paper pulp, keep dry', 'puli_kali_mask_1767675241281.png'),
(1, 'Elephant Carving', 'Decor', 'Souvenir', 1800.00, 3600.00, 'Rosewood elephant carving, premium handicraft.', 'Wood care', 'elephant_carving_1767675259304.png');

INSERT INTO notifications (user_id, title, message) VALUES 
(1, 'Welcome to HeritX', 'Start browsing our traditional collection today!');
