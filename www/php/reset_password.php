<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$host = "localhost";
$username = "u237859360_braincloud";
$password = "Braincloud123@";
$database = "u237859360_braincloud";

// Create connection
$conn = new mysqli($host, $username, $password, $database);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = $_POST['username'];
    $newPassword = $_POST['password']; // Raw password from user

    // Hash the password securely
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    if ($conn->connect_error) {
        die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
    }

    // Query to update the user's password
    $sql = "UPDATE users SET password = ? WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ss', $hashedPassword, $user);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Password updated successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error occurred while updating the password."]);
    }

    $stmt->close();
    $conn->close();
}
?>
