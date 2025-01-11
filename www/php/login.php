<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Database credentials
$host = "localhost";
$username = "u237859360_braincloud";
$password = "Braincloud123@";
$database = "u237859360_braincloud";

// Set timezone to Malaysia
date_default_timezone_set('Asia/Kuala_Lumpur');

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]));
}

// Retrieve data from GET request
$email = isset($_GET['email']) ? $conn->real_escape_string($_GET['email']) : null;
$password = isset($_GET['password']) ? $_GET['password'] : null; // Do not hash the plaintext password here

// Validate input
if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Email and password are required."]);
    $conn->close();
    exit();
}

// Query the database for the user
$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    // Verify the hashed password
    if (password_verify($password, $user['password'])) {
        // Remove the password hash from the response before sending it
        unset($user['password']);

        // Update last_time in the database
        $current_time = date('Y-m-d H:i:s');
        $update_sql = "UPDATE users SET last_time = ? WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param('si', $current_time, $user['id']);
        
        if ($update_stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Login successful.", "user" => $user]);
        } else {
            echo json_encode(["success" => false, "message" => "Error updating last time."]);
        }

        $update_stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid email or password."]);
}

// Close the statement and connection
$stmt->close();
$conn->close();
?>
