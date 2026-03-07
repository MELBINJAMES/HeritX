<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Use the shared admin db.php (mysqli) — consistent with other admin APIs
require_once '../../../admin/public/api/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$target_id = $_REQUEST['user_id'] ?? $_REQUEST['id'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $contentType = $_SERVER["CONTENT_TYPE"] ?? '';
    $data = strpos($contentType, "application/json") !== false
        ? json_decode(file_get_contents("php://input"), true)
        : $_POST;

    if (!$target_id) {
        echo json_encode(["success" => false, "message" => "User ID is required"]);
        exit;
    }

    // ── PASSWORD CHANGE ──────────────────────────────────────────────────────
    if (isset($_GET['action']) && $_GET['action'] === 'change_password') {
        $currentPassword = $data['current_password'] ?? '';
        $newPassword     = $data['new_password'] ?? '';

        if (empty($currentPassword) || empty($newPassword)) {
            echo json_encode(["success" => false, "message" => "All password fields are required"]); exit;
        }
        if (strlen($newPassword) < 8) {
            echo json_encode(["success" => false, "message" => "New password must be at least 8 characters"]); exit;
        }
        if (!preg_match('/[A-Z]/', $newPassword)) {
            echo json_encode(["success" => false, "message" => "Password must contain at least one uppercase letter"]); exit;
        }
        if (!preg_match('/[a-z]/', $newPassword)) {
            echo json_encode(["success" => false, "message" => "Password must contain at least one lowercase letter"]); exit;
        }

        $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->bind_param("i", $target_id);
        $stmt->execute();
        $userRow = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($userRow && password_verify($currentPassword, $userRow['password'])) {
            $hashedNew = password_hash($newPassword, PASSWORD_DEFAULT);
            $upd = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
            $upd->bind_param("si", $hashedNew, $target_id);
            echo json_encode(["success" => $upd->execute(), "message" => $upd->execute() ? "Password updated" : "Failed to update"]);
            $upd->close();
        } else {
            echo json_encode(["success" => false, "message" => "Current password is incorrect"]);
        }
        exit;
    }

    // ── PROFILE UPDATE ───────────────────────────────────────────────────────
    $name     = $data['name']     ?? '';
    $phone    = $data['phone']    ?? '';
    $address  = $data['address']  ?? '';
    $location = $data['location'] ?? '';
    $gender   = $data['gender']   ?? '';
    $dob      = $data['dob']      ?? '';
    $bio      = $data['bio']      ?? '';
    $offer_msg= $data['offer_message'] ?? '';

    // Check if the offer_message has changed to send a notification
    $stmt_old = $conn->prepare("SELECT offer_message, name FROM users WHERE id = ?");
    $stmt_old->bind_param("i", $target_id);
    $stmt_old->execute();
    $oldRow = $stmt_old->get_result()->fetch_assoc();
    $stmt_old->close();

    $old_offer_msg = $oldRow['offer_message'] ?? '';
    $shop_name = $oldRow['name'] ?? 'A shop';

    if ($offer_msg !== '' && $offer_msg !== $old_offer_msg) {
        // Offer message changed and is not empty. Notify all renters.
        $renter_stmt = $conn->prepare("SELECT id FROM users WHERE role = 'renter'");
        $renter_stmt->execute();
        $renters = $renter_stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $renter_stmt->close();

        $notif_title = "New Offer from " . $shop_name . "!";
        $notif_msg = $offer_msg;
        
        $insert_notif = $conn->prepare("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)");
        foreach ($renters as $r) {
            $insert_notif->bind_param("iss", $r['id'], $notif_title, $notif_msg);
            $insert_notif->execute();
        }
        $insert_notif->close();
    }

    $imagePath = null;
    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../../../uploads/profiles/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        $filename = uniqid() . '_' . basename($_FILES['profile_image']['name']);
        if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $uploadDir . $filename)) {
            $imagePath = 'http://localhost/HertiX/uploads/profiles/' . $filename;
        }
    }

    if ($imagePath) {
        $stmt = $conn->prepare("UPDATE users SET name=?,phone=?,address=?,location=?,gender=?,dob=?,bio=?,offer_message=?,profile_image=? WHERE id=?");
        $stmt->bind_param("sssssssssi", $name, $phone, $address, $location, $gender, $dob, $bio, $offer_msg, $imagePath, $target_id);
    } else {
        $stmt = $conn->prepare("UPDATE users SET name=?,phone=?,address=?,location=?,gender=?,dob=?,bio=?,offer_message=? WHERE id=?");
        $stmt->bind_param("ssssssssi", $name, $phone, $address, $location, $gender, $dob, $bio, $offer_msg, $target_id);
    }

    echo json_encode([
        "success"   => $stmt->execute(),
        "message"   => $stmt->execute() ? "Profile updated successfully" : "Failed: " . $stmt->error,
        "image_url" => $imagePath
    ]);
    $stmt->close();

} else {
    // ── GET PROFILE ──────────────────────────────────────────────────────────
    if (!$target_id) {
        echo json_encode(["error" => "User ID is required"]); exit;
    }
    $stmt = $conn->prepare("SELECT id, name, email, phone, address, location, gender, dob, bio, offer_message, profile_image, role, created_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $target_id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    echo json_encode($row ?: ["error" => "User not found"]);
}
?>
