-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 18, 2026 at 07:08 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `HeritX`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `action`, `details`, `created_at`) VALUES
(1, 'Added Category', ' (occasion)', '2026-02-01 06:19:29'),
(2, 'Approved Owner', 'Owner ID: 8 - Email Sent', '2026-02-01 15:19:36'),
(3, 'Approved Owner', 'Owner ID: 9 - Email Sent to melbinjames0011@gmail.com', '2026-02-01 15:27:31'),
(4, 'Approved Owner', 'Owner ID: 10 - Email Sent to melbinjames267@gmail.com', '2026-02-01 15:44:08'),
(5, 'Approved Item', 'Item ID: 14', '2026-02-01 16:59:06'),
(6, 'Approved Item', 'Item ID: 19', '2026-02-01 17:29:31'),
(7, 'Approved Item', 'Item ID: 18', '2026-02-01 17:29:32'),
(8, 'Approved Item', 'Item ID: 17', '2026-02-01 17:29:33'),
(9, 'Approved Item', 'Item ID: 16', '2026-02-01 17:29:35'),
(10, 'Approved Item', 'Item ID: 15', '2026-02-01 17:29:36'),
(11, 'Approved Item', 'Item ID: 20', '2026-02-02 05:00:25'),
(12, 'Deleted User/Owner', 'Deleted ID: 11', '2026-02-03 12:45:17'),
(13, 'Deleted Category', 'ID: 9', '2026-02-03 12:45:30'),
(14, 'Sent Custom Email', 'To: melbinjames267@gmail.com, Subject: Important: Regarding your HeritX Shop', '2026-02-03 13:02:01'),
(15, 'Approved Item', 'Item ID: 21', '2026-02-03 15:07:28'),
(16, 'Approved Owner', 'Owner ID: 15 - Email Sent to melbinjames2028@mca.ajce.in', '2026-02-04 06:19:20'),
(17, 'Rejected Item', 'Item ID: 23', '2026-02-10 05:49:32'),
(18, 'Approved Owner', 'Owner ID: 16 - Email Sent to shop@gmail.com', '2026-02-23 04:43:32'),
(19, 'Approved Item', 'Item ID: 24', '2026-03-01 04:56:46'),
(20, 'Rejected Owner', 'Owner ID: 17 - Email Sent to new_owner_1772983443208@example.com', '2026-03-09 05:56:36'),
(21, 'Rejected Owner', 'Owner ID: 17 - Email Sent to ', '2026-03-09 05:56:37'),
(22, 'Rejected Owner', 'Owner ID: 17 - Email Sent to ', '2026-03-09 05:56:37'),
(23, 'Approved Owner', 'Owner ID: 45 - Email Sent to owner_ile5h@gmail.com', '2026-03-10 06:08:18'),
(24, 'Approved Owner', 'Owner ID: 46 - Email Sent to owner_ee1t3@gmail.com', '2026-03-10 06:11:19'),
(25, 'Approved Owner', 'Owner ID: 47 - Email Sent to owner_h6523@gmail.com', '2026-03-10 06:12:26'),
(26, 'Approved Owner', 'Owner ID: 48 - Email Sent to owner_nn2ep@gmail.com', '2026-03-10 06:13:08'),
(27, 'Approved Owner', 'Owner ID: 49 - Email Sent to owner_kz28q@gmail.com', '2026-03-10 06:14:09'),
(28, 'Approved Owner', 'Owner ID: 50 - Email Sent to owner_hi4sa@gmail.com', '2026-03-10 06:15:08'),
(29, 'Approved Owner', 'Owner ID: 51 - Email Sent to owner_s19ir@gmail.com', '2026-03-10 06:18:56'),
(30, 'Approved Owner', 'Owner ID: 52 - Email Sent to owner_q89hy@gmail.com', '2026-03-10 06:20:08'),
(31, 'Rejected Owner', 'Owner ID: 44 - Email Sent to owner_vkreo@gmail.com', '2026-03-10 16:18:08'),
(32, 'Rejected Owner', 'Owner ID: 44 - Email Sent to ', '2026-03-10 16:18:10'),
(33, 'Rejected Owner', 'Owner ID: 28 - Email Sent to owner_1773074949@test-auto.com', '2026-03-10 16:18:17'),
(34, 'Rejected Owner', 'Owner ID: 28 - Email Sent to ', '2026-03-10 16:18:19'),
(35, 'Rejected Owner', 'Owner ID: 27 - Email Sent to owner_1773074902@test-auto.com', '2026-03-10 16:18:24'),
(36, 'Rejected Owner', 'Owner ID: 27 - Email Sent to ', '2026-03-10 16:18:26'),
(37, 'Rejected Owner', 'Owner ID: 26 - Email Sent to owner_1773074836@test-auto.com', '2026-03-10 16:18:39'),
(38, 'Rejected Owner', 'Owner ID: 26 - Email Sent to ', '2026-03-10 16:18:40'),
(39, 'Rejected Owner', 'Owner ID: 26 - Email Sent to ', '2026-03-10 16:18:41'),
(40, 'Rejected Owner', 'Owner ID: 25 - Email Sent to owner_1773074503322@test-auto.com', '2026-03-10 16:18:46'),
(41, 'Rejected Owner', 'Owner ID: 24 - Email Sent to owner_1773074469700@test-auto.com', '2026-03-10 16:19:00'),
(42, 'Rejected Owner', 'Owner ID: 24 - Email Sent to ', '2026-03-10 16:19:02'),
(43, 'Rejected Owner', 'Owner ID: 24 - Email Sent to ', '2026-03-10 16:19:02'),
(44, 'Rejected Owner', 'Owner ID: 23 - Email Sent to owner_1773074086271@test-auto.com', '2026-03-10 16:19:20'),
(45, 'Rejected Owner', 'Owner ID: 23 - Email Sent to ', '2026-03-10 16:19:20'),
(46, 'Rejected Owner', 'Owner ID: 23 - Email Sent to ', '2026-03-10 16:19:21'),
(47, 'Rejected Owner', 'Owner ID: 23 - Email Sent to ', '2026-03-10 16:19:22'),
(48, 'Rejected Owner', 'Owner ID: 22 - Email Sent to owner_1773074025686@test-auto.com', '2026-03-10 16:19:29'),
(49, 'Rejected Owner', 'Owner ID: 21 - Email Sent to owner_1773073721185@test-auto.com', '2026-03-10 16:19:36'),
(50, 'Rejected Owner', 'Owner ID: 20 - Email Sent to owner_1773073394453@test-auto.com', '2026-03-10 16:19:53'),
(51, 'Rejected Owner', 'Owner ID: 19 - Email Sent to owner_1773072533686@test-auto.com', '2026-03-10 16:20:01'),
(52, 'Rejected Owner', 'Owner ID: 19 - Email Sent to ', '2026-03-10 16:20:03'),
(53, 'Toggled Shop Status', 'Owner ID: 52 to 0', '2026-03-11 03:45:51'),
(54, 'Toggled Shop Status', 'Owner ID: 52 to 0', '2026-03-11 03:45:51'),
(55, 'Toggled Shop Status', 'Owner ID: 52 to 0', '2026-03-11 03:45:52'),
(56, 'Toggled Shop Status', 'Owner ID: 52 to 1', '2026-03-11 03:45:52'),
(57, 'Toggled Shop Status', 'Owner ID: 52 to 1', '2026-03-11 03:45:52'),
(58, 'Toggled Shop Status', 'Owner ID: 52 to 0', '2026-03-11 03:45:52'),
(59, 'Toggled Shop Status', 'Owner ID: 52 to 0', '2026-03-11 03:45:52'),
(60, 'Toggled Shop Status', 'Owner ID: 52 to 0', '2026-03-11 03:45:52'),
(61, 'Toggled Shop Status', 'Owner ID: 52 to 0', '2026-03-11 03:45:52'),
(62, 'Toggled Shop Status', 'Owner ID: 52 to 0', '2026-03-11 03:45:52'),
(63, 'Toggled Shop Status', 'Owner ID: 52 to 1', '2026-03-11 03:45:52'),
(64, 'Toggled Shop Status', 'Owner ID: 52 to 0', '2026-03-11 03:45:56'),
(65, 'Toggled Shop Status', 'Owner ID: 52 to 1', '2026-03-11 03:46:01'),
(66, 'Toggled Shop Status', 'Owner ID: 52 to 0', '2026-03-11 03:46:05'),
(67, 'Toggled Shop Status', 'Owner ID: 52 to 1', '2026-03-11 03:46:06');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `booking_date` datetime NOT NULL,
  `event_date` datetime NOT NULL,
  `status` enum('confirmed','pending','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('category','occasion') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `type`, `created_at`) VALUES
(1, 'Attire', 'category', '2026-02-01 05:47:44'),
(2, 'Jewelry', 'category', '2026-02-01 05:47:44'),
(3, 'Art/Decor', 'category', '2026-02-01 05:47:44'),
(4, 'Ritual Items', 'category', '2026-02-01 05:47:44'),
(5, 'Onam', 'occasion', '2026-02-01 05:47:44'),
(6, 'Vishu', 'occasion', '2026-02-01 05:47:44'),
(7, 'Wedding', 'occasion', '2026-02-01 05:47:44'),
(8, 'Festival', 'occasion', '2026-02-01 05:47:44'),
(10, 'Housewarming', 'occasion', '2026-02-23 15:16:45'),
(11, 'Decor', 'category', '2026-02-23 15:16:45'),
(12, 'Ritual', 'category', '2026-02-23 15:16:45'),
(13, 'Martial Arts', 'category', '2026-02-23 15:16:45'),
(14, 'Costumes', 'category', '2026-02-23 15:16:45'),
(15, 'Handicrafts', 'category', '2026-02-23 15:16:45'),
(16, 'Instruments', 'category', '2026-02-23 15:16:45');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `occasion` varchar(100) DEFAULT 'Onam',
  `quality` varchar(50) DEFAULT 'Good',
  `quantity` int(11) DEFAULT 1,
  `price_per_day` decimal(10,2) DEFAULT NULL,
  `deposit_amount` decimal(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_approved` tinyint(1) DEFAULT 0,
  `item_condition` varchar(50) DEFAULT 'Good',
  `dos` text DEFAULT NULL,
  `donts` text DEFAULT NULL,
  `shop_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `owner_id`, `name`, `category`, `occasion`, `quality`, `quantity`, `price_per_day`, `deposit_amount`, `description`, `image_url`, `is_available`, `created_at`, `is_approved`, `item_condition`, `dos`, `donts`, `shop_name`) VALUES
(15, 10, 'Chenda', 'Musical Instruments', 'Cultural Program', 'Good', 6, 3500.00, 3500.00, 'Chenda is a traditional percussion instrument of Kerala, commonly used in temple festivals and cultural performances. It produces powerful rhythmic beats and is a key part of traditional art forms like Chenda Melam.', 'uploads/item_1769965494_Chenda-img-1.webp', 1, '2026-02-01 17:04:54', 1, 'New', 'Use only with proper drumsticks\r\n\r\nStore in a dry place after use', 'Do not expose to water\r\n\r\nDo not place heavy objects on it', NULL),
(16, 10, 'Kathakali Costume', 'Costumes', 'Kathakali Performance', 'Good', 6, 5000.00, 5000.00, 'Kathakali costume is a traditional performance attire known for its elaborate makeup, vibrant colors, and detailed ornaments. It represents characters from classical stories and is used in Kathakali dance-drama performances.', 'uploads/item_1769965681_9b44ed_1e42ea3f2dc1483280650edf25eeb2dc~mv2.avif', 1, '2026-02-01 17:08:01', 1, 'Used', 'Wear with professional assistance\r\n\r\nKeep accessories safely packed', 'Do not wash with water\r\n\r\nDo not mix costume parts carelessly', NULL),
(17, 10, 'Aranmula Kannadi', 'Ritual Items', 'Housewarming', 'Good', 4, 500.00, 548.00, 'Aranmula Kannadi is a traditional metal mirror from Kerala, believed to bring prosperity and positive energy. It is commonly gifted during housewarming ceremonies and religious occasions.', 'uploads/item_1769966171_Aranmula Kannadi.webp', 1, '2026-02-01 17:16:11', 1, 'Good', '', '', NULL),
(18, 10, 'Pulikali Costume', 'Costumes', 'Onam', 'Good', 12, 450.00, 498.00, 'Pulikali Costume', 'uploads/item_1769966549_Pulikali Costume.jpg', 1, '2026-02-01 17:22:29', 1, 'New', '', '', NULL),
(19, 10, 'Urumi', 'Musical Instruments', 'Temple Festival', 'Good', 12, 1400.00, 1450.00, 'Urumi is a flexible percussion instrument known for its deep, resonant sound. It is often used in temple festivals and traditional percussion ensembles', 'uploads/item_1769966801_urumi.jpg', 1, '2026-02-01 17:26:41', 1, 'Used', '', '', NULL),
(24, 16, 'flute', 'Musical Instruments', 'Cultural Program', 'Good', 1, 1000.00, 5000.00, 'qwertyuioplkjhgfdsazxcvbn', 'uploads/item_1771822157_flute.jpg', 1, '2026-02-23 04:49:17', 1, 'Good', '', '', NULL),
(25, 1, 'Traditional Nettipattam', 'Decor', 'Wedding', 'Good', 5, 1500.00, 3000.00, 'Authentic Gold-plated Elephant Caparison used for wall decor.', 'uploads/nettipattam.png', 1, '2026-03-14 13:32:26', 1, 'Good', 'Hang in a dry place\nDust regularly with a soft cloth', 'Do not expose to direct sunlight for long\nDo not wash with water', NULL),
(26, 1, 'Premium Kasavu Saree', 'Attire', 'Onam', 'Good', 10, 500.00, 1000.00, 'Handwoven Kerala Saree with pure golden zari border.', 'uploads/saree.png', 1, '2026-03-14 13:32:26', 1, 'Good', 'Dry clean only\nStore in a cool dry place', 'Do not machine wash\nDo not use bleach', NULL),
(27, 1, 'Antique Bronze Lamp', 'Decor', 'Housewarming', 'Good', 8, 350.00, 700.00, 'Heavy bronze oil lamp (Nilavilakku) for traditional lighting ceremonies.', 'uploads/lamp.png', 1, '2026-03-14 13:32:26', 1, 'Good', 'Clean with Pitambari or tamarind\nUse good quality oil', 'Do not drop\nDo not leave soot uncleaned', NULL),
(28, 1, 'Kathakali Full Set Costume', 'Attire', 'Festival', 'Good', 3, 2500.00, 5000.00, 'Complete authentic Kathakali dance costume with headgear.', 'uploads/kathakali.png', 1, '2026-03-14 13:32:26', 1, 'Good', 'Handle with extreme care\nStore in a trunk with silica gel', 'Do not fold the headgear\nDo not wash at home', NULL),
(29, 1, 'Traditional Para', 'Ritual', 'Wedding', 'Good', 12, 300.00, 600.00, 'Brass rice measuring vessel used for filling paddy in auspicious ceremonies.', 'uploads/para.png', 1, '2026-03-14 13:32:26', 1, 'Good', 'Polish with brass cleaner\nKeep in a prominent place', 'Do not use for liquids\nDo not store in damp areas', NULL),
(30, 10, 'defrfrf h', 'Musical Instruments', 'Vishu', 'Good', 3, 200.00, 250.00, 'eerbrbbhhfrnfrfnfthnfrfgrfnerfhyertfberfygrf', 'uploads/item_1773551567_5.avif', 1, '2026-03-15 05:12:48', 1, 'Used', '', '', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 12, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-02-20 to 2026-02-21.', 0, '2026-02-19 05:07:43'),
(2, 12, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-02-20 to 2026-02-24.', 0, '2026-02-19 05:11:25'),
(3, 12, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-02-20 to 2026-02-21.', 0, '2026-02-19 05:12:13'),
(4, 12, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-02-20 to 2026-02-21.', 0, '2026-02-19 05:30:09'),
(5, 12, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-02-20 to 2026-02-21.', 0, '2026-02-19 06:24:06'),
(6, 14, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-02-20 to 2026-02-22.', 0, '2026-02-19 06:31:42'),
(7, 14, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-02-20 to 2026-02-23.', 0, '2026-02-19 06:34:11'),
(8, 14, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-02-20 to 2026-02-21.', 0, '2026-02-19 06:37:53'),
(9, 14, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-02-20 to 2026-02-21.', 0, '2026-02-19 06:45:24'),
(10, 10, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-02-20 to 2026-02-21.', 0, '2026-02-19 09:39:10'),
(11, 10, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-02-20 to 2026-02-21.', 0, '2026-02-19 09:45:11'),
(12, 12, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-02-21 to 2026-02-22.', 0, '2026-02-20 08:28:18'),
(13, 14, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-02-23 to 2026-02-28.', 0, '2026-02-23 04:39:00'),
(14, 14, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-02-25 to 2026-02-26.', 0, '2026-02-24 04:33:35'),
(15, 14, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-01 05:29:23'),
(16, 14, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-03-04 to 2026-03-05.', 0, '2026-03-02 10:12:10'),
(17, 14, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-02 17:17:40'),
(18, 14, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-02 17:37:10'),
(19, 10, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-02 18:56:19'),
(20, 14, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-05 09:35:55'),
(21, 10, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-05 09:57:27'),
(22, 10, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-05 14:55:24'),
(23, 12, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-05 16:01:21'),
(24, 12, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-06 04:40:15'),
(25, 12, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-06 06:45:49'),
(26, 10, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-06 06:56:01'),
(27, 10, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-06 06:59:27'),
(28, 10, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-07 08:57:13'),
(29, 10, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-07 09:18:06'),
(30, 10, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-07 09:28:13'),
(31, 10, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-07 10:02:46'),
(32, 10, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-07 10:04:09'),
(33, 10, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-07 10:05:08'),
(34, 10, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-07 11:16:29'),
(35, 10, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-07 16:05:13'),
(36, 12, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-09 10:29:08'),
(37, 12, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-09 10:57:21'),
(38, 53, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-10 10:42:54'),
(39, 12, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-03-17 to 2026-03-19.', 0, '2026-03-10 16:13:59'),
(40, 12, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-03-17 to 2026-03-19.', 0, '2026-03-10 16:34:36'),
(41, 12, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-03-26 to 2026-03-17.', 0, '2026-03-10 16:43:42'),
(42, 12, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-11 03:42:54'),
(43, 12, 'Booking Confirmed', 'Your rental for 1 items has been confirmed from 2026-03-14 to 2026-03-22.', 0, '2026-03-13 15:21:10'),
(44, 12, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-15 06:16:12'),
(45, 12, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-15 06:18:59'),
(46, 12, 'Payment & Booking Confirmed', 'Your online payment and rental for 1 items was successful.', 0, '2026-03-15 09:30:17');

-- --------------------------------------------------------

--
-- Table structure for table `owner_profile`
--

CREATE TABLE `owner_profile` (
  `id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `shop_name` varchar(255) DEFAULT NULL,
  `shop_description` text DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `shop_address` text DEFAULT NULL,
  `shop_city` varchar(100) DEFAULT NULL,
  `shop_pincode` varchar(20) DEFAULT NULL,
  `maps_url` text DEFAULT NULL,
  `instagram_url` varchar(255) DEFAULT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `opening_time` varchar(20) DEFAULT NULL,
  `closing_time` varchar(20) DEFAULT NULL,
  `working_days` varchar(255) DEFAULT NULL,
  `rental_terms` text DEFAULT NULL,
  `late_fee_policy` text DEFAULT NULL,
  `bank_details` text DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `operating_hours` varchar(255) DEFAULT NULL,
  `default_deposit_percent` int(11) DEFAULT 20,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `owner_profile`
--

INSERT INTO `owner_profile` (`id`, `owner_id`, `shop_name`, `shop_description`, `profile_photo`, `phone`, `shop_address`, `shop_city`, `shop_pincode`, `maps_url`, `instagram_url`, `facebook_url`, `opening_time`, `closing_time`, `working_days`, `rental_terms`, `late_fee_policy`, `bank_details`, `tax_id`, `operating_hours`, `default_deposit_percent`, `created_at`) VALUES
(39, 10, 'Joe rental', '', 'http://localhost/HertiX/admin/public/uploads/shop_logos/shop_10_1770182701.webp', '', '', '', '', '', '', '', '', '', 'Mon,Tue,Wed,Thu,Sat,Fri', '', '', '', '', '', 20, '2026-02-04 04:16:55');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `transaction_date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_type` varchar(50) NOT NULL,
  `status` enum('paid','refunded','pending','failed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `user_id`, `transaction_date`, `amount`, `payment_type`, `status`, `created_at`) VALUES
(1, 10, '2026-02-19', 900.00, 'credit_revenue', '', '2026-02-19 05:07:43'),
(2, 12, '2026-02-19', 900.00, 'rent', 'pending', '2026-02-19 05:07:43'),
(3, 12, '2026-02-19', 498.00, 'deposit', 'pending', '2026-02-19 05:07:43'),
(4, 10, '2026-02-19', 2250.00, 'credit_revenue', '', '2026-02-19 05:11:25'),
(5, 12, '2026-02-19', 2250.00, 'rent', 'paid', '2026-02-19 05:11:25'),
(6, 12, '2026-02-19', 498.00, 'deposit', 'paid', '2026-02-19 05:11:25'),
(7, 10, '2026-02-19', 1000.00, 'credit_revenue', '', '2026-02-19 05:12:13'),
(8, 12, '2026-02-19', 1000.00, 'rent', 'pending', '2026-02-19 05:12:13'),
(9, 12, '2026-02-19', 548.00, 'deposit', 'pending', '2026-02-19 05:12:13'),
(10, 10, '2026-02-19', 1000.00, 'credit_revenue', '', '2026-02-19 05:30:09'),
(11, 12, '2026-02-19', 1000.00, 'rent', 'pending', '2026-02-19 05:30:09'),
(12, 12, '2026-02-19', 548.00, 'deposit', 'pending', '2026-02-19 05:30:09'),
(13, 10, '2026-02-19', 10000.00, 'credit_revenue', '', '2026-02-19 06:24:06'),
(14, 12, '2026-02-19', 10000.00, 'rent', 'pending', '2026-02-19 06:24:06'),
(15, 12, '2026-02-19', 5000.00, 'deposit', 'pending', '2026-02-19 06:24:06'),
(16, 10, '2026-02-19', 1500.00, 'credit_revenue', '', '2026-02-19 06:31:42'),
(17, 14, '2026-02-19', 1500.00, 'rent', 'pending', '2026-02-19 06:31:42'),
(18, 14, '2026-02-19', 548.00, 'deposit', 'pending', '2026-02-19 06:31:42'),
(19, 10, '2026-02-19', 14000.00, 'credit_revenue', '', '2026-02-19 06:34:11'),
(20, 14, '2026-02-19', 14000.00, 'rent', 'pending', '2026-02-19 06:34:11'),
(21, 14, '2026-02-19', 3500.00, 'deposit', 'pending', '2026-02-19 06:34:11'),
(22, 10, '2026-02-19', 976.26, 'credit_revenue', '', '2026-02-19 06:37:53'),
(23, 14, '2026-02-19', 976.26, 'rent', 'pending', '2026-02-19 06:37:53'),
(24, 14, '2026-02-19', 498.00, 'deposit', 'pending', '2026-02-19 06:37:53'),
(25, 10, '2026-02-19', 7000.00, 'credit_revenue', '', '2026-02-19 06:45:24'),
(26, 14, '2026-02-19', 7000.00, 'rent', 'paid', '2026-02-19 06:45:24'),
(27, 14, '2026-02-19', 3500.00, 'deposit', 'paid', '2026-02-19 06:45:24'),
(28, 10, '2026-02-19', 2800.00, 'credit_revenue', '', '2026-02-19 09:39:10'),
(29, 10, '2026-02-19', -1450.00, 'rent', 'pending', '2026-02-19 09:39:10'),
(30, 10, '2026-02-19', 1450.00, 'deposit', 'pending', '2026-02-19 09:39:10'),
(31, 10, '2026-02-19', 900.00, 'credit_revenue', '', '2026-02-19 09:45:11'),
(32, 10, '2026-02-19', -498.00, 'rent', 'pending', '2026-02-19 09:45:11'),
(33, 10, '2026-02-19', 498.00, 'deposit', 'pending', '2026-02-19 09:45:11'),
(34, 10, '2026-02-20', 10000.00, 'credit_revenue', '', '2026-02-20 08:28:18'),
(35, 12, '2026-02-20', -5000.00, 'rent', 'pending', '2026-02-20 08:28:18'),
(36, 12, '2026-02-20', 5000.00, 'deposit', 'pending', '2026-02-20 08:28:18'),
(37, 10, '2026-02-23', 42000.00, 'credit_revenue', '', '2026-02-23 04:39:00'),
(38, 14, '2026-02-23', -7000.00, 'rent', 'pending', '2026-02-23 04:39:00'),
(39, 14, '2026-02-23', 7000.00, 'deposit', 'pending', '2026-02-23 04:39:00'),
(40, 10, '2026-02-24', 10000.00, 'credit_revenue', '', '2026-02-24 04:33:35'),
(41, 14, '2026-02-24', -5000.00, 'rent', 'pending', '2026-02-24 04:33:35'),
(42, 14, '2026-02-24', 5000.00, 'deposit', 'pending', '2026-02-24 04:33:35'),
(43, 10, '2026-03-01', 4950.00, 'credit_revenue', '', '2026-03-01 05:29:23'),
(44, 14, '2026-03-01', 4950.00, 'rent', 'paid', '2026-03-01 05:29:23'),
(45, 14, '2026-03-01', 498.00, 'deposit', 'paid', '2026-03-01 05:29:23'),
(46, 10, '2026-03-02', 900.00, 'credit_revenue', '', '2026-03-02 10:12:10'),
(47, 14, '2026-03-02', -498.00, 'rent', 'pending', '2026-03-02 10:12:10'),
(48, 14, '2026-03-02', 498.00, 'deposit', 'pending', '2026-03-02 10:12:10'),
(49, 10, '2026-03-02', 4200.00, 'credit_revenue', '', '2026-03-02 17:17:40'),
(50, 14, '2026-03-02', 4200.00, 'rent', 'paid', '2026-03-02 17:17:40'),
(51, 14, '2026-03-02', 1450.00, 'deposit', 'paid', '2026-03-02 17:17:40'),
(52, 10, '2026-03-02', 900.00, 'credit_revenue', '', '2026-03-02 17:37:10'),
(53, 14, '2026-03-02', 900.00, 'rent', 'paid', '2026-03-02 17:37:10'),
(54, 14, '2026-03-02', 498.00, 'deposit', 'paid', '2026-03-02 17:37:10'),
(55, 10, '2026-03-03', 2800.00, 'credit_revenue', '', '2026-03-02 18:56:19'),
(56, 10, '2026-03-03', 2800.00, 'rent', 'paid', '2026-03-02 18:56:19'),
(57, 10, '2026-03-03', 1450.00, 'deposit', 'paid', '2026-03-02 18:56:19'),
(58, 10, '2026-03-05', 9100.00, 'credit_revenue', '', '2026-03-05 09:35:55'),
(59, 14, '2026-03-05', 9100.00, 'rent', 'paid', '2026-03-05 09:35:55'),
(60, 14, '2026-03-05', 5000.00, 'deposit', 'paid', '2026-03-05 09:35:55'),
(61, 10, '2026-03-05', 1820.00, 'credit_revenue', '', '2026-03-05 09:57:27'),
(62, 10, '2026-03-05', 1820.00, 'rent', 'paid', '2026-03-05 09:57:27'),
(63, 10, '2026-03-05', 1096.00, 'deposit', 'paid', '2026-03-05 09:57:27'),
(64, 10, '2026-03-05', 1638.00, 'credit_revenue', '', '2026-03-05 14:55:24'),
(65, 10, '2026-03-05', 1638.00, 'rent', 'paid', '2026-03-05 14:55:24'),
(66, 10, '2026-03-05', 996.00, 'deposit', 'paid', '2026-03-05 14:55:24'),
(67, 10, '2026-03-05', 7000.00, 'credit_revenue', '', '2026-03-05 16:01:21'),
(68, 12, '2026-03-05', 7000.00, 'rent', 'paid', '2026-03-05 16:01:21'),
(69, 12, '2026-03-05', 3500.00, 'deposit', 'paid', '2026-03-05 16:01:21'),
(70, 10, '2026-03-06', 2800.00, 'credit_revenue', '', '2026-03-06 04:40:15'),
(71, 12, '2026-03-06', 2800.00, 'rent', 'paid', '2026-03-06 04:40:15'),
(72, 12, '2026-03-06', 1450.00, 'deposit', 'paid', '2026-03-06 04:40:15'),
(73, 10, '2026-03-06', 9800.00, 'credit_revenue', '', '2026-03-06 06:45:49'),
(74, 12, '2026-03-06', 9800.00, 'rent', 'paid', '2026-03-06 06:45:49'),
(75, 12, '2026-03-06', 1450.00, 'deposit', 'paid', '2026-03-06 06:45:49'),
(76, 10, '2026-03-06', 3150.00, 'credit_revenue', '', '2026-03-06 06:56:01'),
(77, 10, '2026-03-06', 3150.00, 'rent', 'paid', '2026-03-06 06:56:01'),
(78, 10, '2026-03-06', 498.00, 'deposit', 'paid', '2026-03-06 06:56:01'),
(79, 10, '2026-03-06', 2500.00, 'credit_revenue', '', '2026-03-06 06:59:27'),
(80, 10, '2026-03-06', 2500.00, 'rent', 'paid', '2026-03-06 06:59:27'),
(81, 10, '2026-03-06', 548.00, 'deposit', 'paid', '2026-03-06 06:59:27'),
(82, 10, '2026-03-07', 1350.00, 'credit_revenue', '', '2026-03-07 08:57:13'),
(83, 10, '2026-03-07', 1350.00, 'rent', 'paid', '2026-03-07 08:57:13'),
(84, 10, '2026-03-07', 498.00, 'deposit', 'paid', '2026-03-07 08:57:13'),
(85, 10, '2026-03-07', 25000.00, 'credit_revenue', '', '2026-03-07 09:18:06'),
(86, 10, '2026-03-07', 25000.00, 'rent', 'paid', '2026-03-07 09:18:06'),
(87, 10, '2026-03-07', 5000.00, 'deposit', 'paid', '2026-03-07 09:18:06'),
(88, 10, '2026-03-07', 15000.00, 'credit_revenue', '', '2026-03-07 09:28:13'),
(89, 10, '2026-03-07', 15000.00, 'rent', 'paid', '2026-03-07 09:28:13'),
(90, 10, '2026-03-07', 5000.00, 'deposit', 'paid', '2026-03-07 09:28:13'),
(91, 10, '2026-03-07', 3600.00, 'credit_revenue', '', '2026-03-07 10:02:46'),
(92, 10, '2026-03-07', 3600.00, 'rent', 'paid', '2026-03-07 10:02:46'),
(93, 10, '2026-03-07', 498.00, 'deposit', 'paid', '2026-03-07 10:02:46'),
(94, 10, '2026-03-07', 17500.00, 'credit_revenue', '', '2026-03-07 10:04:09'),
(95, 10, '2026-03-07', 17500.00, 'rent', 'paid', '2026-03-07 10:04:09'),
(96, 10, '2026-03-07', 3500.00, 'deposit', 'paid', '2026-03-07 10:04:09'),
(97, 10, '2026-03-07', 16800.00, 'credit_revenue', '', '2026-03-07 10:05:08'),
(98, 10, '2026-03-07', 16800.00, 'rent', 'paid', '2026-03-07 10:05:08'),
(99, 10, '2026-03-07', 1450.00, 'deposit', 'paid', '2026-03-07 10:05:08'),
(100, 10, '2026-03-07', 10000.00, 'credit_revenue', '', '2026-03-07 11:16:29'),
(101, 10, '2026-03-07', 10000.00, 'rent', 'paid', '2026-03-07 11:16:29'),
(102, 10, '2026-03-07', 5000.00, 'deposit', 'paid', '2026-03-07 11:16:29'),
(103, 10, '2026-03-07', 22400.00, 'credit_revenue', '', '2026-03-07 16:05:13'),
(104, 10, '2026-03-07', 22400.00, 'rent', 'paid', '2026-03-07 16:05:13'),
(105, 10, '2026-03-07', 11600.00, 'deposit', 'paid', '2026-03-07 16:05:13'),
(106, 10, '2026-03-09', 1500.00, 'credit_revenue', '', '2026-03-09 10:29:08'),
(107, 12, '2026-03-09', 1500.00, 'rent', 'paid', '2026-03-09 10:29:08'),
(108, 12, '2026-03-09', 548.00, 'deposit', 'paid', '2026-03-09 10:29:08'),
(109, 10, '2026-03-09', 2000.00, 'credit_revenue', '', '2026-03-09 10:57:21'),
(110, 12, '2026-03-09', 2000.00, 'rent', 'paid', '2026-03-09 10:57:21'),
(111, 12, '2026-03-09', 548.00, 'deposit', 'paid', '2026-03-09 10:57:21'),
(112, 10, '2026-03-10', 450.00, 'credit_revenue', '', '2026-03-10 10:42:54'),
(113, 53, '2026-03-10', 450.00, 'rent', 'paid', '2026-03-10 10:42:54'),
(114, 53, '2026-03-10', 498.00, 'deposit', 'paid', '2026-03-10 10:42:54'),
(120, 16, '2026-03-10', 3000.00, 'credit_revenue', '', '2026-03-10 16:13:59'),
(121, 12, '2026-03-10', 3000.00, 'rent', 'pending', '2026-03-10 16:13:59'),
(122, 12, '2026-03-10', 5000.00, 'deposit', 'pending', '2026-03-10 16:13:59'),
(123, 10, '2026-03-10', 4200.00, 'credit_revenue', '', '2026-03-10 16:34:36'),
(124, 12, '2026-03-10', 4200.00, 'rent', 'pending', '2026-03-10 16:34:36'),
(125, 12, '2026-03-10', 1450.00, 'deposit', 'pending', '2026-03-10 16:34:36'),
(126, 16, '2026-03-10', 10000.00, 'credit_revenue', '', '2026-03-10 16:43:42'),
(127, 12, '2026-03-10', 10000.00, 'rent', 'pending', '2026-03-10 16:43:42'),
(128, 12, '2026-03-10', 5000.00, 'deposit', 'pending', '2026-03-10 16:43:42'),
(129, 10, '2026-03-11', 1350.00, 'credit_revenue', '', '2026-03-11 03:42:54'),
(130, 12, '2026-03-11', 1350.00, 'rent', 'paid', '2026-03-11 03:42:54'),
(131, 12, '2026-03-11', 498.00, 'deposit', 'paid', '2026-03-11 03:42:54'),
(132, 10, '2026-03-13', 31500.00, 'credit_revenue', '', '2026-03-13 15:21:10'),
(133, 12, '2026-03-13', 31500.00, 'rent', 'pending', '2026-03-13 15:21:10'),
(134, 12, '2026-03-13', 3500.00, 'deposit', 'pending', '2026-03-13 15:21:10'),
(135, 1, '2026-03-15', 1500.00, 'credit_revenue', '', '2026-03-15 06:16:12'),
(136, 12, '2026-03-15', 1500.00, 'rent', 'paid', '2026-03-15 06:16:12'),
(137, 12, '2026-03-15', 3000.00, 'deposit', 'paid', '2026-03-15 06:16:12'),
(138, 10, '2026-03-15', 1400.00, 'credit_revenue', '', '2026-03-15 06:18:59'),
(139, 12, '2026-03-15', 1400.00, 'rent', 'paid', '2026-03-15 06:18:59'),
(140, 12, '2026-03-15', 1450.00, 'deposit', 'paid', '2026-03-15 06:18:59'),
(141, 10, '2026-03-15', 2800.00, 'credit_revenue', '', '2026-03-15 09:30:17'),
(142, 12, '2026-03-15', 2800.00, 'rent', 'paid', '2026-03-15 09:30:17'),
(143, 12, '2026-03-15', 1450.00, 'deposit', 'paid', '2026-03-15 09:30:17');

-- --------------------------------------------------------

--
-- Table structure for table `rentals`
--

CREATE TABLE `rentals` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `actual_return_date` date DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `deposit_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','active','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `delivery_method` enum('pickup','delivery') DEFAULT 'pickup',
  `delivery_charge` decimal(10,2) DEFAULT 0.00,
  `total_price` decimal(10,2) DEFAULT 0.00,
  `delivery_address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `delivery_city` varchar(100) DEFAULT NULL,
  `delivery_pincode` varchar(20) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `delivery_fee` decimal(10,2) DEFAULT 0.00,
  `delivery_distance` decimal(10,2) DEFAULT 0.00 COMMENT 'Distance in km',
  `delivery_status` enum('Pending','Confirmed','Shipped','Out for Delivery','Delivered','Cancelled') DEFAULT 'Pending',
  `pickup_time` varchar(50) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT 'online',
  `payment_status` varchar(20) DEFAULT 'unpaid',
  `address` text DEFAULT NULL,
  `razorpay_order_id` varchar(100) DEFAULT NULL,
  `razorpay_payment_id` varchar(100) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `damage_note` text DEFAULT NULL,
  `damage_deduction` decimal(10,2) DEFAULT 0.00,
  `refund_status` varchar(30) DEFAULT NULL,
  `refund_id` varchar(100) DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `late_days` int(11) DEFAULT 0,
  `return_time` datetime DEFAULT NULL,
  `total_paid` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rentals`
--

INSERT INTO `rentals` (`id`, `user_id`, `item_id`, `start_date`, `end_date`, `actual_return_date`, `total_amount`, `deposit_amount`, `status`, `created_at`, `delivery_method`, `delivery_charge`, `total_price`, `delivery_address`, `city`, `pincode`, `contact_phone`, `delivery_city`, `delivery_pincode`, `contact_number`, `delivery_fee`, `delivery_distance`, `delivery_status`, `pickup_time`, `payment_method`, `payment_status`, `address`, `razorpay_order_id`, `razorpay_payment_id`, `quantity`, `damage_note`, `damage_deduction`, `refund_status`, `refund_id`, `refund_amount`, `late_days`, `return_time`, `total_paid`) VALUES
(4, 12, 18, '2026-02-20 00:00:00', '2026-02-21 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-02-19 05:07:43', 'pickup', 0.00, 900.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '11:00 AM - 02:00 PM', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(5, 12, 18, '2026-02-20 00:00:00', '2026-02-24 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-02-19 05:11:25', 'pickup', 0.00, 2250.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '11:00 AM - 01:00 PM', 'upi', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(6, 12, 17, '2026-02-20 00:00:00', '2026-02-21 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-02-19 05:12:13', 'pickup', 0.00, 1000.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '10:00 AM - 11:00 AM', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(7, 12, 17, '2026-02-20 00:00:00', '2026-02-21 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-02-19 05:30:09', 'pickup', 0.00, 1000.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '12:00 PM - 04:00 PM', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(8, 12, 16, '2026-02-20 00:00:00', '2026-02-21 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-02-19 06:24:06', 'pickup', 0.00, 10000.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '10:00 AM - 11:00 AM', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(9, 14, 17, '2026-02-20 00:00:00', '2026-02-22 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-02-19 06:31:42', 'pickup', 0.00, 1500.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '12:00 PM - 04:00 PM', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(10, 14, 15, '2026-02-20 00:00:00', '2026-02-23 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-02-19 06:34:11', 'pickup', 0.00, 14000.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '03:00 PM - 07:00 PM', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(11, 14, 18, '2026-02-20 00:00:00', '2026-02-21 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-02-19 06:37:53', 'delivery', 0.00, 900.00, 'sweety shop kanjirappally', 'kanjirappally', '686518', '1628239832', NULL, NULL, NULL, 76.26, 2.63, 'Pending', '12:00 PM - 02:00 PM', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(12, 14, 15, '2026-02-20 00:00:00', '2026-02-21 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-02-19 06:45:24', 'pickup', 0.00, 7000.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '12:00 PM - 05:00 PM', 'upi', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(13, 10, 19, '2026-02-20 00:00:00', '2026-02-21 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-02-19 09:39:09', 'pickup', 0.00, 2800.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '02:00 PM - 02:00 PM', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(14, 10, 18, '2026-02-20 00:00:00', '2026-02-21 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-02-19 09:45:11', 'pickup', 0.00, 900.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '02:00 PM - 03:00 PM', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(15, 12, 16, '2026-02-21 00:00:00', '2026-02-22 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-02-20 08:28:18', 'pickup', 0.00, 10000.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '03:00 PM - 06:00 PM', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(16, 14, 15, '2026-02-23 00:00:00', '2026-02-28 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-02-23 04:39:00', 'pickup', 0.00, 42000.00, '', '', '', '9633421864', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '09:00 AM - 12:00 PM', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(17, 14, 16, '2026-02-25 00:00:00', '2026-02-26 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-02-24 04:33:35', 'pickup', 0.00, 10000.00, '', '', '', '9633421864', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '12:00 PM - 01:00 PM', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(18, 14, 18, '2026-03-05 00:00:00', '2026-03-15 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-01 05:29:23', 'pickup', 0.00, 4950.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '04:00 PM - 05:00 PM', 'upi', 'paid', NULL, 'order_SLqPxoZ7BDTGJb', 'pay_SLqTEzxmkNrLV0', 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(19, 14, 18, '2026-03-04 00:00:00', '2026-03-05 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-02 10:12:10', 'pickup', 0.00, 900.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '05:00 PM - 06:00 PM', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(20, 14, 19, '2026-03-04 00:00:00', '2026-03-06 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-02 17:17:40', 'pickup', 0.00, 4200.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '03:00 PM - 05:00 PM', 'online', 'paid', NULL, 'order_SMR7CHlHg0k1M5', 'pay_SMR7zZVM71cd3Z', 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(21, 14, 18, '2026-03-03 00:00:00', '2026-03-04 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-02 17:37:10', 'pickup', 0.00, 900.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '01:00 PM - 02:00 PM', 'online', 'paid', NULL, 'order_SMRSX9unHYre98', 'pay_SMRSduNAlgh6CG', 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 0.00),
(25, 10, 18, '2026-03-06 00:00:00', '2026-03-07 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-05 14:55:24', 'pickup', 0.00, 1638.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '11:00 AM - 02:00 PM', 'online', 'paid', NULL, 'order_SNaItsmkOXcPli', 'pay_SNaJ4ZgKi0IBOe', 1, 'Minor Damage', 125.00, NULL, NULL, NULL, 0, NULL, 0.00),
(26, 12, 15, '2026-03-06 00:00:00', '2026-03-07 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-05 16:01:21', 'pickup', 0.00, 7000.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '11:00 AM - 03:00 PM', 'online', 'paid', NULL, 'order_SNbPqMK2tcXlou', 'pay_SNbQkKxqXrtfFw', 1, 'Minor Damage', 875.00, 'refunded', 'rfnd_SNoJTbMfca0SdK', 3500.00, 0, NULL, 0.00),
(27, 12, 19, '2026-03-07 00:00:00', '2026-03-08 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-06 04:40:15', 'pickup', 0.00, 2800.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '02:00 PM - 04:00 PM', 'online', 'paid', NULL, 'order_SNoMC2atTTMm4l', 'pay_SNoMOpqBZkNTux', 1, 'Minor (25%) Damage: Minor (25%)', 362.50, 'refunded', 'rfnd_SNoVnJSbQPAOZO', 1087.50, 0, NULL, 0.00),
(28, 12, 19, '2026-03-07 00:00:00', '2026-03-13 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-06 06:45:49', 'pickup', 0.00, 9800.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '04:00 PM - 05:00 PM', 'online', 'paid', NULL, 'order_SNqUk38YrvVqSt', 'pay_SNqV1yGuZA1YhF', 1, '25% Damage Damage: ', 362.50, 'refunded', 'rfnd_SNqWPFCHNMCRcI', 1087.50, 0, NULL, 0.00),
(29, 10, 18, '2026-03-07 00:00:00', '2026-03-13 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-06 06:56:01', 'pickup', 0.00, 3150.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '03:00 PM - 07:00 PM', 'online', 'paid', NULL, 'order_SNqfhAb5ZgVVOc', 'pay_SNqfo0hgMJtT8X', 1, 'Severe (75%) Damage Damage: ', 373.50, 'refunded', 'rfnd_SNqhG2VaEW5uzO', 124.50, 0, NULL, 0.00),
(30, 10, 17, '2026-03-07 00:00:00', '2026-03-11 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-06 06:59:27', 'pickup', 0.00, 2500.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '11:00 AM - 04:00 PM', 'online', 'paid', NULL, 'order_SNqjIT06NQ3dEI', 'pay_SNqjQgNzc2aD4f', 1, 'Minor (25%) Damage Damage: ', 137.00, 'refunded', 'rfnd_SOFA6GAPZhcyhm', 411.00, 0, NULL, 0.00),
(31, 10, 18, '2026-03-09 00:00:00', '2026-03-11 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-07 08:57:13', 'pickup', 0.00, 1350.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '02:00 PM - 04:00 PM', 'online', 'paid', NULL, 'order_SOHGrneZCQzRl0', 'pay_SOHGxryYVOleza', 1, 'Returned Late: More than 5 Days (25%)', 124.50, 'refunded', 'rfnd_SOIJAWlPeYwq5i', 373.50, 5, '2026-03-07 15:27:43', 1848.00),
(32, 10, 16, '2026-03-14 00:00:00', '2026-03-18 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-07 09:18:06', 'pickup', 0.00, 25000.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '03:00 PM - 05:00 PM', 'online', 'paid', NULL, 'order_SOHcoLURp8Pw6c', 'pay_SOHczOu01MIhw2', 1, 'No Damage', 0.00, 'refunded', 'rfnd_SOICe4GLwzeWmX', 5000.00, 0, '2026-03-07 15:21:32', 30000.00),
(33, 10, 16, '2026-03-13 00:00:00', '2026-03-15 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-07 09:28:13', 'pickup', 0.00, 15000.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '12:00 PM - 02:00 PM', 'online', 'paid', NULL, 'order_SOHncEgKSxvy9q', 'pay_SOHnhYkiZl2SN4', 1, 'Minor Damage (25%)', 1250.00, 'refunded', 'rfnd_SOIBapSQi9nne5', 3750.00, 0, '2026-03-07 15:20:32', 20000.00),
(34, 10, 18, '2026-03-20 00:00:00', '2026-03-27 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-07 10:02:46', 'pickup', 0.00, 3600.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '06:00 PM - 08:00 PM', 'online', 'paid', NULL, 'order_SOIO4fAJ16PR3M', 'pay_SOIOCXkcRBYwrY', 1, 'Minor Damage (25%)', 124.50, 'refunded', 'rfnd_SOIlLedpV9s2S2', 373.50, 0, '2026-03-07 15:54:23', 4098.00),
(35, 10, 15, '2026-03-20 00:00:00', '2026-03-24 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-07 10:04:09', 'pickup', 0.00, 17500.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '01:00 PM - 01:00 PM', 'online', 'paid', NULL, 'order_SOIPYTNplvbkQT', 'pay_SOIPhH57NpMBKC', 1, 'Minor Damage (25%)', 875.00, 'refunded', 'rfnd_SOIZJlPVFy1EW8', 2625.00, 0, '2026-03-07 15:43:00', 21000.00),
(36, 10, 19, '2026-03-14 00:00:00', '2026-03-25 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-07 10:05:08', 'pickup', 0.00, 16800.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '12:00 PM - 03:00 PM', 'online', 'paid', NULL, 'order_SOIQf8iCJ7348U', 'pay_SOIQkDmhV9sgwJ', 1, 'Minor Damage (25%)', 362.50, 'refunded', 'rfnd_SOIS2hviQgyFB4', 1087.50, 0, '2026-03-07 15:36:07', 18250.00),
(37, 10, 16, '2026-03-12 00:00:00', '2026-03-13 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-07 11:16:29', 'pickup', 0.00, 10000.00, '', '', '', '6282822648', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '11:00 AM - 01:00 PM', 'online', 'paid', NULL, 'order_SOJdyMKOiJmuUc', 'pay_SOJe6YnCygs0lE', 1, 'Medium Damage (50%)', 2500.00, 'refunded', 'rfnd_SOJg6edVp0HAI2', 2500.00, 0, '2026-03-07 16:48:07', 15000.00),
(38, 10, 19, '2026-03-10 00:00:00', '2026-03-11 00:00:00', '2026-03-07', 0.00, 0.00, 'completed', '2026-03-07 16:05:13', 'pickup', 0.00, 22400.00, '', '', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '03:00 PM - 04:00 PM', 'online', 'paid', NULL, 'order_SOOZ0y8FSEMP1a', 'pay_SOOZ5yuSNSGip1', 1, 'Returned Late: < 24 hours (5%)', 72.50, 'refunded', 'rfnd_SOOe8tFx8xGbvQ', 1377.50, 1, '2026-03-07 21:39:45', 34000.00),
(39, 12, 17, '2026-03-10 00:00:00', '2026-03-12 00:00:00', '2026-03-09', 0.00, 0.00, 'completed', '2026-03-09 10:29:08', 'pickup', 0.00, 1500.00, '', 'koovapally', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '', 'online', 'paid', NULL, 'order_SP5u7ztf3zBxY1', 'pay_SP5uJGdqA8CCvf', 1, 'Minor Damage (25%)', 137.00, 'refunded', 'rfnd_SP5vuDxFqDYtOP', 411.00, 0, '2026-03-09 16:00:24', 2048.00),
(40, 12, 17, '2026-03-08 00:00:00', '2026-03-11 00:00:00', '2026-03-09', 0.00, 0.00, 'completed', '2026-03-09 10:57:21', 'pickup', 0.00, 2000.00, '', 'koovapally', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '', 'online', 'paid', NULL, 'order_SP6NmuzeQNQlGX', 'pay_SP6O5glKuEKn1n', 1, 'Minor Damage (25%)', 137.00, 'refunded', 'rfnd_SPBLhnZErRLUE5', 411.00, 0, '2026-03-09 21:18:17', 2548.00),
(41, 53, 18, '2026-03-11 00:00:00', '2026-03-11 00:00:00', '2026-03-10', 0.00, 0.00, 'completed', '2026-03-10 10:42:53', 'pickup', 0.00, 450.00, '', '', '', '9605341193', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '', 'online', 'paid', NULL, 'order_SPUffJrg7H39a2', 'pay_SPUfvHBIenkLaD', 1, 'Medium Damage (50%)', 249.00, 'refunded', 'rfnd_SPUiRkhIu4HxmO', 249.00, 0, '2026-03-10 16:15:00', 948.00),
(47, 12, 24, '2026-03-17 00:00:00', '2026-03-19 00:00:00', NULL, 0.00, 0.00, 'confirmed', '2026-03-10 16:13:59', 'pickup', 0.00, 3000.00, '', 'koovapally', '', '9876543210', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 8000.00),
(48, 12, 19, '2026-03-17 00:00:00', '2026-03-19 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-10 16:34:36', 'pickup', 0.00, 4200.00, '', 'koovapally', '', '9876543210', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 5650.00),
(49, 12, 24, '2026-03-26 00:00:00', '2026-03-17 00:00:00', NULL, 0.00, 0.00, 'confirmed', '2026-03-10 16:43:42', 'pickup', 0.00, 10000.00, '', 'koovapally', '', '9876543210', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 15000.00),
(50, 12, 18, '2026-03-10 00:00:00', '2026-03-12 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-11 03:42:54', 'pickup', 0.00, 1350.00, '', 'koovapally', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '', 'online', 'paid', NULL, 'order_SPm3H0yqAEtD2F', 'pay_SPm3R2thepim3K', 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 1848.00),
(51, 12, 15, '2026-03-14 00:00:00', '2026-03-22 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-13 15:21:10', 'pickup', 0.00, 31500.00, '', 'koovapally', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '', 'cod', 'unpaid', NULL, NULL, NULL, 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 35000.00),
(52, 12, 25, '2026-03-26 00:00:00', '2026-03-26 00:00:00', NULL, 0.00, 0.00, 'confirmed', '2026-03-15 06:16:12', 'pickup', 0.00, 1500.00, '', 'koovapally', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '', 'online', 'paid', NULL, 'order_SROnaac0m7hnaw', 'pay_SROnpJ56D7YQWp', 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 4500.00),
(53, 12, 19, '2026-03-15 00:00:00', '2026-03-15 00:00:00', NULL, 0.00, 0.00, 'completed', '2026-03-15 06:18:59', 'pickup', 0.00, 1400.00, '', 'koovapally', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '', 'online', 'paid', NULL, 'order_SROqhmdyTaT3zQ', 'pay_SROqnN3tjWWiub', 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 2850.00),
(54, 12, 19, '2026-03-16 00:00:00', '2026-03-17 00:00:00', NULL, 0.00, 0.00, 'confirmed', '2026-03-15 09:30:17', 'pickup', 0.00, 2800.00, '', 'koovapally', '', '6282398321', NULL, NULL, NULL, 0.00, 0.00, 'Pending', '', 'online', 'paid', NULL, 'order_SRS6hMsYRyeUv9', 'pay_SRS6r7yx6RTPb4', 1, NULL, 0.00, NULL, NULL, NULL, 0, NULL, 4250.00);

-- --------------------------------------------------------

--
-- Table structure for table `shopowners`
--

CREATE TABLE `shopowners` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'Shop Owner',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `youtube_url` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'Finder',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reset_token` varchar(10) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `shop_address` text DEFAULT NULL,
  `shop_city` varchar(255) DEFAULT NULL,
  `shop_pincode` varchar(10) DEFAULT NULL,
  `shop_phone` varchar(50) DEFAULT NULL,
  `shop_proof` varchar(255) DEFAULT NULL,
  `is_approved` int(11) DEFAULT 1,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `wallet_balance` decimal(10,2) DEFAULT 0.00,
  `shop_name` varchar(255) DEFAULT NULL,
  `offer_message` varchar(255) DEFAULT NULL,
  `offer_title` varchar(255) DEFAULT NULL,
  `offer_start` datetime DEFAULT NULL,
  `offer_end` datetime DEFAULT NULL,
  `offer_discount_percent` int(11) DEFAULT 0,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `reset_token`, `reset_token_expiry`, `phone`, `address`, `gender`, `dob`, `bio`, `profile_image`, `location`, `shop_address`, `shop_city`, `shop_pincode`, `shop_phone`, `shop_proof`, `is_approved`, `latitude`, `longitude`, `wallet_balance`, `shop_name`, `offer_message`, `offer_title`, `offer_start`, `offer_end`, `offer_discount_percent`, `lat`, `lng`) VALUES
(1, 'Melbin James', 'owner@hertix.com', '$2y$10$eUJ60AOHOBn.Ln3ObqDh3ePWOIfjkyHKkv1RUaMWUE.5CKly24sZ2', 'Shop Owner', '2026-02-18 05:40:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, 1500.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(2, 'Demo Renter', 'renter@hertix.com', 'password123', 'Finder', '2026-02-18 05:40:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(9, 'Ajas Rentas', 'melbinjames0011@gmail.com', '$2y$10$QvAJ/oX2QwhOHAFxu7YEKOC5LR.5qGRNIhFBtSf.zejZl.H0z0lvS', 'Shop Owner', '2026-02-01 15:26:43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'sweety shop kanjirappally', 'kanjirappally', NULL, '+3116282398321', 'uploads/proofs/1769959603_Ottamthullal_kerala.jpg', 1, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(10, 'Joe rental', 'melbinjames267@gmail.com', '$2y$10$m16aI1azlwsSHgE3UQCWg.olSwdQHELkUUQ7uspLG/raF5LUa8azC', 'Shop Owner', '2026-02-01 15:42:32', NULL, NULL, '6282398321', '', 'Male', '2005-12-12', '.............', 'http://localhost/HertiX/uploads/profiles/69ae55aae617a_5.avif', 'koovapally', 'boutique shop kanjirappally', 'kanjirappally', NULL, '+3116282398321', 'uploads/proofs/1769960552_payment sucess.png', 1, 9.54403240, 76.81041660, 312734.26, NULL, 'Get 10 % on all items', 'weekend', '2026-03-04 13:30:00', '2026-03-06 04:09:00', 9, 9.54403240, 76.81041660),
(12, 'Melbin James', 'melbinjames1212@gmail.com', '$2y$10$zpxeGKugFwHIMjTYgcKdJ.sEqqBJcAYZ.L4E.HDiO/C73gs.bZe6i', 'Finder', '2026-02-01 13:05:22', NULL, NULL, '6282398321', '', 'Male', '2026-03-11', '..............', NULL, 'koovapally', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, 0.00, NULL, '', NULL, NULL, NULL, 0, NULL, NULL),
(13, 'Sharon Shibu', 'shibusharon2013@gmail.com', '$2y$10$XUM3agFiApZg54wxcmEB8.oCc8IE.MuLMePVv/IQF49qdKJZTli2W', 'Finder', '2026-02-01 18:50:07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', NULL, '', '', 1, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(14, 'Melbin James', 'melbinjames8120@gmail.com', '$2y$10$vvobidizG.NBTy78hc2tH.HcJGgUsOYd7vFCAM7ISIzf6hyet2eh2', 'Finder', '2026-02-03 10:26:36', NULL, NULL, '6282398321', '', '', '0000-00-00', '', NULL, '', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(15, 'Dev rentals', 'melbinjames2028@mca.ajce.in', '$2y$10$.K.GCeo5UdDF.YURY1jxL.1hgboDqCmjNPjM841/c0pKyNTORxUFK', 'Shop Owner', '2026-02-04 05:39:07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'dev rentals shop kanjirappally', 'kanjirappally', NULL, '+916282398321', 'uploads/proofs/1770183547_pexels-adhwaith-chandran-214377112-20258867.jpg', 1, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(16, 'kudu stores ', 'shop@gmail.com', '$2y$10$tcJ/w1vchNYcjJR6Bda4tevHlNdNqp/nzuoLfNRn6aLoFc008x1f6', 'Shop Owner', '2026-02-23 04:42:51', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'koovapally', 'kanjirappally', NULL, '+3116282398321', 'uploads/proofs/1771821771_Chengila.jpg', 1, NULL, NULL, 13000.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(18, 'Lifecycle Shop 1772989179288', 'new_owner_1772989179288@hertix.com', '$2y$10$s/UK7KwVAV/zIFON9nZYyOVjHHncJqZlkvnBlEXwppAln3C8E0AeG', 'Shop Owner', '2026-03-08 16:59:43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '123 Heritage Lane', 'Kochi', '682001', '9876543210', 'uploads/proofs/1772989183_test_proof_image_1772987057291.png', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(29, 'Selenium Shop 1773075225', 'owner_1773075225@test-auto.com', '$2y$10$jlT2cnOu4LhEoSJhFZMzju9owuytP0exOuZqTb3SzI2iKwgwgaTn2', 'Shop Owner', '2026-03-09 16:53:48', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '123 Selenium Lane', 'Cochin', '682001', '919876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(30, 'Selenium Shop 1773075381', 'owner_1773075381@test-auto.com', '$2y$10$F9df6pVJeIjFUX6SKZk88OLUHvVjrZl/beRs7ScJxMRe9TepKwXcO', 'Shop Owner', '2026-03-09 16:56:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '123 Selenium Lane', 'Cochin', '682001', '919876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(31, 'Selenium Shop 1773075606', 'owner_1773075606@test-auto.com', '$2y$10$VI.dkFDfAbwUmWNen8NAe.GeX/56gYNVwfS1jufdyImBtNY7eie8e', 'Shop Owner', '2026-03-09 17:00:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '123 Selenium Lane', 'Cochin', '682001', '919876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(32, 'Selenium Shop 1773075759', 'owner_1773075759@test-auto.com', '$2y$10$sWZFqPc4QMUqJ.W2BZdbBuD9CWqJL5WkbpeCBrc9RB/2hiNdkpbii', 'Shop Owner', '2026-03-09 17:02:42', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '123 Selenium Lane', 'Cochin', '682001', '919876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(33, 'Selenium Shop 1773075819', 'owner_1773075819@test-auto.com', '$2y$10$kpSYfberA/2iygB/.O085uwNqb3zi8x1E9.xXEF4rjohvfrKLJTii', 'Shop Owner', '2026-03-09 17:03:44', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '123 Selenium Lane', 'Cochin', '682001', '919876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(34, 'Selenium Shop 1773076242', 'owner_1773076242@test-auto.com', '$2y$10$A9ZXdov7KeRvZNfeZH3xxexff2DgYHb.iiqWyk90k7Rpf7VSIjRMi', 'Shop Owner', '2026-03-09 17:10:50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '123 Selenium Lane', 'Cochin', '682001', '919876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(35, 'Selenium Shop 1773076315', 'owner_1773076315@test-auto.com', '$2y$10$R1r51wDI4V1B0jTUes7zOOVIWpsenJgGhur57Pglg5tiK8FgbXSQC', 'Shop Owner', '2026-03-09 17:11:58', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '123 Selenium Lane', 'Cochin', '682001', '919876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(36, 'Selenium Shop 1773076520', 'owner_1773076520@test-auto.com', '$2y$10$90NYVOkW7HjsOIxsMLMciuwqyGHI5iQ8VYjxVInZr5hz7kHD1P66i', 'Shop Owner', '2026-03-09 17:15:22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '123 Selenium Lane', 'Cochin', '682001', '919876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(37, 'Python Shop 1773077638', 'owner_py_1773077638@test-auto.com', '$2y$10$XaRKm/fZCe6W2VxdO47/H.IzfZnUQYB/Qus0CO9DiLF8SaotN/fte', 'Shop Owner', '2026-03-09 17:34:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pythonic Street 101', 'Kochi', '682001', '917000000000', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(38, 'Python Shop 1773077713', 'owner_py_1773077713@test-auto.com', '$2y$10$nYCF1g0MnaOZpbRdqDnU2uPy01KbTyoM4qltk8rt4UxrdUilQXDwi', 'Shop Owner', '2026-03-09 17:35:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pythonic Street 101', 'Kochi', '682001', '917000000000', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(39, 'Selenium Finder', 'finder_test@heritx.com', '$2y$10$Mjl043kQy0eSbzK2YD.nhOBRqbPVZGIco0mfmWorllgu0aEbQ7yKO', 'Finder', '2026-03-09 18:05:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(40, 'Selenium Test Owner', 'selenium_owner@test-auto.com', '$2y$10$MCzrZ5xhbu8FaGprzzDmMufySC1u8iowXZ889ZslZVt2/CfL2SkTC', 'Shop Owner', '2026-03-10 05:46:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '123 Heritage Lane', 'Kochi', '682001', '9876543210', '', 1, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(41, 'HeritX Test Shop 7dvw9', 'owner_7dvw9@test-auto.com', '$2y$10$6trxRKvfPgYUp23hK0PVtu39fb4NwWGYD8zXpBWjow8ufePXItZRK', 'Shop Owner', '2026-03-10 05:56:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '45 Heritage Lane, Fort Kochi', 'Cochin', '682001', '9876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(42, 'HeritX Test Shop g84l8', 'owner_g84l8@test-auto.com', '$2y$10$v30rLKe7GRxzAZMzEr3VgOJqznVX9AfHxeNC1S1WxvLrfDs766oNy', 'Shop Owner', '2026-03-10 05:58:42', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '45 Heritage Lane, Fort Kochi', 'Cochin', '682001', '9876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(43, 'HeritX Test Shop 5rs11', 'owner_5rs11@test-auto.com', '$2y$10$Q9JlWyTN6ZrUDs7V81FbxuBPCjTvJASVdoRadS68afJHi2H5s/5Ii', 'Shop Owner', '2026-03-10 05:59:30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '45 Heritage Lane, Fort Kochi', 'Cochin', '682001', '9876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(45, 'Heritage Shop ile5h', 'owner_ile5h@gmail.com', '$2y$10$qEMAKtSBw8eTquULZG4b5e7HzhJ2CCjilKOgxANDyZlprhWZD2PUC', 'Shop Owner', '2026-03-10 06:08:08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '45 Fort Kochi Lane', 'Cochin', '682001', '9876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(46, 'Heritage Shop ee1t3', 'owner_ee1t3@gmail.com', '$2y$10$xhOvslxxej6e3ql7VaBR0urAKRwG6Wyy7bddyCINWRnrlZ1wW4G3a', 'Shop Owner', '2026-03-10 06:11:09', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '45 Fort Kochi Lane', 'Cochin', '682001', '9876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(47, 'Heritage Shop h6523', 'owner_h6523@gmail.com', '$2y$10$jthkAHJWz0TILz1wMhVxyuCF6vrWBjySZHkANwRHhrO.8P73zY2Bq', 'Shop Owner', '2026-03-10 06:12:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '45 Fort Kochi Lane', 'Cochin', '682001', '9876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(48, 'Heritage Shop nn2ep', 'owner_nn2ep@gmail.com', '$2y$10$5TKZ0lw0QckdUuTTVZFlLeXNUpP2lyydoVjpOaDTfgEi3/vmKIQD2', 'Shop Owner', '2026-03-10 06:12:58', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '45 Fort Kochi Lane', 'Cochin', '682001', '9876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(49, 'Heritage Shop kz28q', 'owner_kz28q@gmail.com', '$2y$10$cOsjyJK6Z5QlKhdwbe7GGu8K8yruCVfluaNx6UlQLwXglaOSeb2OK', 'Shop Owner', '2026-03-10 06:13:58', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '45 Fort Kochi Lane', 'Cochin', '682001', '9876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(50, 'Heritage Shop hi4sa', 'owner_hi4sa@gmail.com', '$2y$10$ACyH01cCjFTcLh3uP9dRLOdUIB1IZAHhvSF8GwQLK4FHJMxIpIDLi', 'Shop Owner', '2026-03-10 06:14:59', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '45 Fort Kochi Lane', 'Cochin', '682001', '9876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(51, 'Heritage Shop s19ir', 'owner_s19ir@gmail.com', '$2y$10$4fp3vIVP24W6cbiNVKrmPeN9KKBVMJSbsxkPEH9/AZI5.6NkDnvvC', 'Shop Owner', '2026-03-10 06:18:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '45 Fort Kochi Lane', 'Cochin', '682001', '9876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(52, 'Heritage Shop q89hy', 'owner_q89hy@gmail.com', '$2y$10$TF52UsnDmlUzQ2whC70KXOVpwC615v4dR5yAaIxjZZd4.TZGvNrBW', 'Shop Owner', '2026-03-10 06:19:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '45 Fort Kochi Lane', 'Cochin', '682001', '9876543210', '', 1, 9.96790320, 76.24443780, 0.00, NULL, NULL, NULL, NULL, NULL, 0, 9.96790320, 76.24443780),
(53, 'Ashish', 'ashishajce@gmail.com', '$2y$10$EOH/.QYAUg6OR1KjVwBH9ezn0Q.7ahWcoiQy4TxMVqoCR0CEg0tZO', 'Finder', '2026-03-10 10:40:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', 'Kottayam', '', '9605341193', '', 1, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wishlist`
--

INSERT INTO `wishlist` (`id`, `user_id`, `item_id`, `created_at`) VALUES
(2, 12, 18, '2026-02-01 18:13:35'),
(4, 13, 18, '2026-02-01 18:52:09'),
(6, 13, 16, '2026-02-01 18:52:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_items_owner_user` (`owner_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `owner_profile`
--
ALTER TABLE `owner_profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_owner` (`owner_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rentals`
--
ALTER TABLE `rentals`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `shopowners`
--
ALTER TABLE `shopowners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wishlist` (`user_id`,`item_id`),
  ADD KEY `item_id` (`item_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `owner_profile`
--
ALTER TABLE `owner_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=144;

--
-- AUTO_INCREMENT for table `rentals`
--
ALTER TABLE `rentals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `shopowners`
--
ALTER TABLE `shopowners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `fk_items_owner_user` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `owner_profile`
--
ALTER TABLE `owner_profile`
  ADD CONSTRAINT `fk_owner_user` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
