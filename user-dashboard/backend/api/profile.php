<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../../../admin/public/api/db.php';

$user_id = 1; // Mock User ID

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Determine if it's JSON or FormData
    $contentType = $_SERVER["CONTENT_TYPE"] ?? '';
    
    if (strpos($contentType, "application/json") !== false) {
        $data = json_decode(file_get_contents("php://input"), true);
    } else {
        $data = $_POST;
    }

    // Get User ID from Request (POST or GET)
    $target_id = $_REQUEST['user_id'] ?? $_REQUEST['id'] ?? null;

    if (!$target_id) {
        echo json_encode(["success" => false, "message" => "User ID is required"]);
        exit;
    } 

    $name = $data['name'] ?? '';
    $phone = $data['phone'] ?? '';
    $address = $data['address'] ?? '';
    $location = $data['location'] ?? '';
    $gender = $data['gender'] ?? '';
    $dob = $data['dob'] ?? '';
    $bio = $data['bio'] ?? '';

    // Handle Password Change Action
    if (isset($_GET['action']) && $_GET['action'] === 'change_password') {
        $currentPassword = $data['current_password'] ?? '';
        $newPassword = $data['new_password'] ?? '';

        // Validation
        if (empty($currentPassword) || empty($newPassword)) {
            echo json_encode(["success" => false, "message" => "All password fields are required"]);
            exit;
        }

        // Complexity Validation
        if (strlen($newPassword) < 8) {
            echo json_encode(["success" => false, "message" => "New password must be at least 8 characters"]);
            exit;
        }
        if (!preg_match('/[A-Z]/', $newPassword)) {
            echo json_encode(["success" => false, "message" => "New password must contain at least one uppercase letter"]);
            exit;
        }
        if (!preg_match('/[a-z]/', $newPassword)) {
            echo json_encode(["success" => false, "message" => "New password must contain at least one lowercase letter"]);
            exit;
        }

        // Check current password
        $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->bind_param("i", $target_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $userRow = $result->fetch_assoc();

        if ($userRow && password_verify($currentPassword, $userRow['password'])) {
            $hashedNew = password_hash($newPassword, PASSWORD_DEFAULT);
            $upd = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
            $upd->bind_param("si", $hashedNew, $target_id);
            if ($upd->execute()) {
                echo json_encode(["success" => true, "message" => "Password updated successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update password"]);
            }
            $upd->close();
        } else {
            echo json_encode(["success" => false, "message" => "Current password is incorrect"]);
        }
        $stmt->close();
        exit;
    }
    
    // Handle Image Upload
    $imagePath = null;
    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../../uploads/profiles/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        
        $filename = uniqid() . '_' . basename($_FILES['profile_image']['name']);
        $targetFile = $uploadDir . $filename;
        
        if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $targetFile)) {
            // Save relative URL for frontend
            $imagePath = 'http://localhost/HertiX/uploads/profiles/' . $filename;
        }
    }

    // Build Query dynamically based on if image is updated
    if ($imagePath) {
        $stmt = $conn->prepare("UPDATE users SET name = ?, phone = ?, address = ?, location = ?, gender = ?, dob = ?, bio = ?, profile_image = ? WHERE id = ?");
        $stmt->bind_param("ssssssssi", $name, $phone, $address, $location, $gender, $dob, $bio, $imagePath, $target_id);
    } else {
        $stmt = $conn->prepare("UPDATE users SET name = ?, phone = ?, address = ?, location = ?, gender = ?, dob = ?, bio = ? WHERE id = ?");
        $stmt->bind_param("sssssssi", $name, $phone, $address, $location, $gender, $dob, $bio, $target_id);
    }
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Profile updated successfully", "image_url" => $imagePath]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update profile: " . $stmt->error]);
    }
    $stmt->close();
} else {
    // Get Profile
    // target_id is already set from above request check
    if (!$target_id) {
         $target_id = $_GET['user_id'] ?? null;
         if (!$target_id) {
            echo json_encode(["error" => "User ID is required"]);
            exit;
         }
    } 
    $stmt = $conn->prepare("SELECT id, name, email, phone, address, location, gender, dob, bio, profile_image, role, created_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $target_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        echo json_encode($row);
    } else {
        echo json_encode(["error" => "User not found"]);
    }
    $stmt->close();
}
?>
