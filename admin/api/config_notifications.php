<?php
// ============================================================
//  HertiX Notification Configuration
//  Fill in BOTH sections below for auto notifications to work.
// ============================================================

// --- GMAIL SMTP (for auto email) ---
// Use your Gmail + a 16-char App Password from:
// https://myaccount.google.com/apppasswords
define('SMTP_HOST',       'smtp.gmail.com');
define('SMTP_PORT',       587);
define('SMTP_USER',       'melbinjames0011@gmail.com');  // Your Gmail address
define('SMTP_PASS',       'nwfv uckk qdec eiiw');         // 16-char App Password
define('SMTP_FROM_EMAIL', 'no-reply@hertix.com');
define('SMTP_FROM_NAME',  'HertiX Rentals');

// --- TWILIO WhatsApp API (for auto WhatsApp) ---
// 1. Sign up free at https://www.twilio.com
// 2. Go to Console -> Messaging -> Try it Out -> Send a WhatsApp message
// 3. Get your Account SID, Auth Token, and Twilio sandbox number
define('TWILIO_ACCOUNT_SID', 'YOUR_TWILIO_ACCOUNT_SID');   // e.g. AC1234...
define('TWILIO_AUTH_TOKEN',  'YOUR_TWILIO_AUTH_TOKEN');     // Your auth token
define('TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886');    // Twilio sandbox number
// Note: Customer must first send "join <sandbox-word>" to the Twilio number
//       before they can receive sandbox messages. Production removes this need.

// --- RAZORPAY API (for deposit refunds) ---
// Get your keys from: https://dashboard.razorpay.com/app/keys
// Use TEST keys for development, LIVE keys for production
define('RAZORPAY_KEY_ID',     'rzp_test_SKRfndOwhJc8en');
define('RAZORPAY_KEY_SECRET', 'zE5u0yT0cqkFf2OhAqnKUJm4');
?>
