<?php
// updateProfile.php
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

$data = json_decode(file_get_contents('php://input'), true);

// Validate user_id
$user_id = isset($data['user_id']) ? $data['user_id'] : null;
if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit();
}

// Validate and sanitize other input fields (username, email, etc.)
$errors = [];

// Validate username
if (empty($data['username'])) {
    $errors['username'] = 'Username is required';
} elseif (strlen($data['username']) <= 3) {
    $errors['username'] = 'Username must be more than 3 characters';
} else {
    try {
        $conn = new mysqli($config['host'], $config['username'], $config['password'], $config['dbname']);
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }

        // Only check for username collision if the new username is different from the current one
        if ($data['username'] !== $data['original_username']) {
            $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
            $stmt->bind_param("si", $data['username'], $user_id);
            $stmt->execute();
            $result = $stmt->get_result();

            // Only show the "Username already taken" error if the username is different
            if ($result->num_rows > 0) {
                $errors['username'] = 'Username already taken';
            }

            $stmt->close();
        }

        $conn->close();
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit();
    }
}

// Validate email
if (empty($data['email'])) {
    $errors['email'] = 'Email is required';
} elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Invalid email format';
} else {
    try {
        // Check if the email is already registered by another user, excluding the current user's email
        $conn = new mysqli($config['host'], $config['username'], $config['password'], $config['dbname']);
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }

        if ($data['email'] !== $data['original_email']) {
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
            $stmt->bind_param("si", $data['email'], $user_id);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $errors['email'] = 'Email is already registered with another account';
            }

            $stmt->close();
        }

        $conn->close();
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit();
    }
}

// Validate gender
if (empty($data['gender'])) {
    $errors['gender'] = 'Gender is required';
}

// Validate birthday
if (empty($data['birthday'])) {
    $errors['birthday'] = 'Birthday is required';
} else {
    // Check if the birthday is in the future
    $currentDate = new DateTime();
    $birthday = new DateTime($data['birthday']);
    
    if ($birthday > $currentDate) {
        $errors['birthday'] = 'Birthday cannot be in the future';
    }
}

// If there are validation errors, return them in the response
if (!empty($errors)) {
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit();
}

try {
    // Establish database connection
    $conn = new mysqli($config['host'], $config['username'], $config['password'], $config['dbname']);
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // Prepare SQL query to update user profile
    $stmt = $conn->prepare("UPDATE users SET username = ?, email = ?, gender = ?, birthday = ? WHERE id = ?");
    $stmt->bind_param("ssssi", $data['username'], $data['email'], $data['gender'], $data['birthday'], $user_id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
    } else {
        throw new Exception("Error updating profile");
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
