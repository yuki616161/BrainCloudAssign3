<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);  // No Content for preflight
    exit();
}

header('Content-Type: application/json');
date_default_timezone_set('Asia/Kuala_Lumpur');

// Database configuration
$config = [
    'host' => 'localhost',
    'username' => 'u237859360_braincloud',
    'password' => 'Braincloud123@',
    'dbname' => 'u237859360_braincloud'
];

// Decode JSON input
$data = json_decode(file_get_contents('php://input'), true);

$user_id = $data['user_id'] ?? null;
$api_used = $data['api_used'] ?? null;
$activity_description = $data['activity_description'] ?? null;

// Validate inputs
if (!$user_id || !$api_used || !$activity_description) {
    echo json_encode(['success' => false, 'message' => 'Invalid input.']);
    exit();
}

// Connect to the database
$conn = new mysqli($config['host'], $config['username'], $config['password'], $config['dbname']);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit();
}

// Get current date and time in Malaysian timezone
$current_time = date('Y-m-d H:i:s');

// Insert activity into the database
$sql = "INSERT INTO user_activities (user_id, api_name, action_description, activity_date) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param('isss', $user_id, $api_used, $activity_description, $current_time);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Activity logged successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to log activity.']);
}

$stmt->close();
$conn->close();
?>
