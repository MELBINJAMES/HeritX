<?php
include 'db.php';

$email = '';
$fullName = '';
$role = 'Finder';
$rawPassword = '';
$shopAddress = '';
$shopCity = '';
$shopPhone = '';
$proofPath = '';

// Check for JSON or FormData
$jsonData = json_decode(file_get_contents("php://input"));
if ($jsonData) {
    $email = $conn->real_escape_string($jsonData->email);
    $fullName = isset($jsonData->full_name) ? $conn->real_escape_string($jsonData->full_name) : '';
    $role = isset($jsonData->role) ? $conn->real_escape_string($jsonData->role) : 'Finder';
    $rawPassword = $jsonData->password;
} else {
    // FormData
    $email = isset($_POST['email']) ? $conn->real_escape_string($_POST['email']) : '';
    $fullName = isset($_POST['full_name']) ? $conn->real_escape_string($_POST['full_name']) : '';
    $role = isset($_POST['role']) ? $conn->real_escape_string($_POST['role']) : 'Finder';
    $rawPassword = isset($_POST['password']) ? $_POST['password'] : '';
    $shopAddress = isset($_POST['shop_address']) ? $conn->real_escape_string($_POST['shop_address']) : '';
    $shopCity = isset($_POST['shop_city']) ? $conn->real_escape_string($_POST['shop_city']) : '';
    $shopPincode = isset($_POST['shop_pincode']) ? $conn->real_escape_string($_POST['shop_pincode']) : '';
    $shopPhone = isset($_POST['shop_phone']) ? $conn->real_escape_string($_POST['shop_phone']) : '';
    $shopLat = isset($_POST['shop_lat']) && is_numeric($_POST['shop_lat']) ? floatval($_POST['shop_lat']) : null;
    $shopLng = isset($_POST['shop_lng']) && is_numeric($_POST['shop_lng']) ? floatval($_POST['shop_lng']) : null;

    // File Upload Handler
    if (isset($_FILES['proof_doc']) && $_FILES['proof_doc']['error'] == 0) {
        $targetDir = "../uploads/proofs/";
        if (!file_exists($targetDir)) mkdir($targetDir, 0777, true);
        
        $fileName = time() . '_' . basename($_FILES['proof_doc']['name']);
        $targetFile = $targetDir . $fileName;
        $fileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
        
        // Simple check for image types
        if (in_array($fileType, ['jpg', 'png', 'jpeg', 'pdf'])) {
            if (move_uploaded_file($_FILES['proof_doc']['tmp_name'], $targetFile)) {
                $proofPath = "uploads/proofs/" . $fileName;
            }
        }
    }
}

if (empty($email) || empty($rawPassword)) {
    echo json_encode(["status" => "error", "message" => "Email and Password are required"]);
    exit();
}

// Password Complexity Validation
if (strlen($rawPassword) < 8) {
    echo json_encode(["status" => "error", "message" => "Password must be at least 8 characters"]);
    exit();
}
if (!preg_match('/[A-Z]/', $rawPassword)) {
    echo json_encode(["status" => "error", "message" => "Password must contain at least one uppercase letter"]);
    exit();
}
if (!preg_match('/[a-z]/', $rawPassword)) {
    echo json_encode(["status" => "error", "message" => "Password must contain at least one lowercase letter"]);
    exit();
}

$password = password_hash($rawPassword, PASSWORD_DEFAULT);

// Check if email already exists
$table = 'users'; // UNIFIED TABLE: Always use users table for both Finders and Shop Owners

$check_sql = "SELECT id FROM $table WHERE email = '$email'";
$result = $conn->query($check_sql);

if ($result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Email already registered. Please login."]);
} else {
    // Insert into respective table
    // Updated INSERT to include new shop columns and approval status
    $is_approved = ($role === 'Shop Owner') ? 0 : 1;
    $latVal  = $shopLat  !== null ? "'$shopLat'"  : 'NULL';
    $lngVal  = $shopLng  !== null ? "'$shopLng'"  : 'NULL';
    $sql = "INSERT INTO $table (email, name, password, role, shop_address, shop_city, shop_pincode, shop_phone, shop_proof, lat, lng, is_approved) VALUES ('$email', '$fullName', '$password', '$role', '$shopAddress', '$shopCity', '$shopPincode', '$shopPhone', '$proofPath', $latVal, $lngVal, '$is_approved')";
    
    if ($conn->query($sql) === TRUE) {
        $msg = "Account created successfully!";
        if ($role === 'Shop Owner') {
            $msg .= " Your shop is pending verification.";
        }
        echo json_encode(["status" => "success", "message" => $msg]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error: " . $conn->error]);
    }
}

$conn->close();
?>
