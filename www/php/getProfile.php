<?php
// getProfile.php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

$config = [
    'host' => 'localhost',
    'username' => 'u237859360_braincloud',
    'password' => 'Braincloud123@',
    'dbname' => 'u237859360_braincloud'
];

// Retrieve user_id from GET request
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'User ID not provided']);
    exit();
}

try {
    // Establish database connection
    $conn = new mysqli($config['host'], $config['username'], $config['password'], $config['dbname']);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // Prepare SQL query to fetch user profile
    $stmt = $conn->prepare("SELECT username, email, gender, DATE_FORMAT(birthday, '%d/%m/%Y') AS birthday FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);  // Bind user_id from request

    // Execute query and fetch result
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            echo json_encode([
                'success' => true,
                'users' => $row
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'User not found']);
        }
    } else {
        throw new Exception("Error executing query");
    }

    // Close statement and connection
    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
