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

    // In production, get ID from Session. For MVP:
    $target_id = 1; 

    $name = $data['name'] ?? '';
    $phone = $data['phone'] ?? '';
    $address = $data['address'] ?? '';
    $location = $data['location'] ?? '';
    $gender = $data['gender'] ?? '';
    $dob = $data['dob'] ?? '';
    $bio = $data['bio'] ?? '';
    
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
    $target_id = 1; 
    $stmt = $conn->prepare("SELECT id, name, email, phone, address, location, gender, dob, bio, profile_image, role FROM users WHERE id = ?");
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
