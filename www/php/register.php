<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

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

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve form data
    $username = isset($_POST['username']) ? $conn->real_escape_string($_POST['username']) : null;
    $email = isset($_POST['email']) ? $conn->real_escape_string($_POST['email']) : null;
    $password = isset($_POST['password']) ? $_POST['password'] : null;
    $gender = isset($_POST['gender']) ? $conn->real_escape_string($_POST['gender']) : null;
    $birthday = isset($_POST['birthday']) ? $conn->real_escape_string($_POST['birthday']) : null;
    $security_question = isset($_POST['security_question']) ? $conn->real_escape_string($_POST['security_question']) : null;
    $security_answer = isset($_POST['security_answer']) ? $conn->real_escape_string($_POST['security_answer']) : null;

    // Validate input
    if (!$username || !$email || !$password || !$gender || !$birthday || !$security_question || !$security_answer) {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
        $conn->close();
        exit();
    }

    // Validate username length
    if (strlen($username) <= 3) {
        echo json_encode(["success" => false, "message" => "Username must be more than 3 characters."]);
        $conn->close();
        exit();
    }

    // Check if the username already exists
    $usernameCheckQuery = "SELECT id FROM users WHERE username = ?";
    $stmt = $conn->prepare($usernameCheckQuery);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Username already exists
        echo json_encode(["success" => false, "message" => "This username is already taken. Please choose a different one."]);
        $stmt->close();
        $conn->close();
        exit();
    }

    // Check if the email is already registered
    $emailCheckQuery = "SELECT id FROM users WHERE email = ?";
    $stmt = $conn->prepare($emailCheckQuery);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Email already exists
        echo json_encode(["success" => false, "message" => "This email is already registered. Please use a different email."]);
        $stmt->close();
        $conn->close();
        exit();
    }

    $stmt->close();

    // Hash the password for security
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Set the current time for create_time and last_time
    $current_time = date("Y-m-d H:i:s");

    // Insert the user data into the database
    $sql = "INSERT INTO users (username, email, password, gender, birthday, create_time, last_time, security_question, security_answer) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssssss", $username, $email, $hashedPassword, $gender, $birthday, $current_time, $current_time, $security_question, $security_answer);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Registration successful."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
}
?>
