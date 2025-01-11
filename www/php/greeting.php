<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); // Allow cross-origin requests
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

date_default_timezone_set('Asia/Kuala_Lumpur');

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection configuration
$config = [
    'host' => 'localhost',
    'username' => 'u237859360_braincloud',
    'password' => 'Braincloud123@',
    'dbname' => 'u237859360_braincloud'
];

// Establish a database connection
$conn = new mysqli($config['host'], $config['username'], $config['password'], $config['dbname']);

// Check database connection
if ($conn->connect_error) {
    http_response_code(500); // Internal Server Error
    echo json_encode(["success" => false, "message" => "Database connection error: " . $conn->connect_error]);
    exit();
}

// Validate and sanitize user_id from GET parameter
$user_id = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);
if (!$user_id) {
    http_response_code(400); // Bad Request
    echo json_encode(["success" => false, "message" => "Invalid or missing User ID."]);
    $conn->close();
    exit();
}

// Prepare SQL query to fetch the username
$sql = "SELECT username FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500); // Internal Server Error
    echo json_encode(["success" => false, "message" => "Database query preparation error."]);
    $conn->close();
    exit();
}

$stmt->bind_param("i", $user_id);

if (!$stmt->execute()) {
    http_response_code(500); // Internal Server Error
    echo json_encode(["success" => false, "message" => "Error executing query."]);
    $stmt->close();
    $conn->close();
    exit();
}

$stmt->bind_result($username);
$stmt->fetch();
$stmt->close();

if ($username) {
    // Determine the greeting based on the current time
    $hours = date('G');
    if ($hours >= 5 && $hours < 12) {
        $greeting = "Good morning, $username!";
    } elseif ($hours >= 12 && $hours < 17) {
        $greeting = "Good afternoon, $username!";
    } elseif ($hours >= 17 && $hours < 21) {
        $greeting = "Good evening, $username!";
    } else {
        $greeting = "Good night, $username!";
    }

    echo json_encode(["success" => true, "message" => $greeting]);
} else {
    http_response_code(404); // Not Found
    echo json_encode(["success" => false, "message" => "User not found."]);
}

$conn->close();
?>
