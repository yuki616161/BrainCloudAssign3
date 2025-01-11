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
    $gender = $_POST['gender'];
    $birthday = $_POST['birthday'];

    // Check connection
    if ($conn->connect_error) {
        die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
    }

    // Query to fetch security question and answer
    $sql = "SELECT security_question, security_answer FROM users WHERE username = ? AND gender = ? AND birthday = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sss', $user, $gender, $birthday);

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        if ($result->num_rows === 1) {
            $row = $result->fetch_assoc();
            echo json_encode([
                "success" => true,
                "security_question" => $row['security_question'],
                "security_answer" => $row['security_answer'] // For later comparison
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "User details not found."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Error occurred while verifying user details."]);
    }

    $stmt->close();
    $conn->close();
}
?>
