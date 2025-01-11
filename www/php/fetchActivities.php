<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Database configuration
$config = [
    'host' => 'localhost',
    'username' => 'u237859360_braincloud',
    'password' => 'Braincloud123@',
    'dbname' => 'u237859360_braincloud'
];

// Get the user_id from GET parameter
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'User ID is missing']);
    exit();
}

// Get filter inputs
$api_filter = isset($_GET['api']) ? $_GET['api'] : '';
$date_filter = isset($_GET['date']) ? $_GET['date'] : '';

// Pagination setup
$limit = 15; 
$page = isset($_GET['page']) ? $_GET['page'] : 1;
$offset = ($page - 1) * $limit;

// Establish database connection
$conn = new mysqli($config['host'], $config['username'], $config['password'], $config['dbname']);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit();
}

// Base SQL query with dynamic filters
$sql = "SELECT * FROM user_activities WHERE user_id = ?";
$params = [$user_id];
$types = "i";

if ($api_filter) {
    $sql .= " AND api_name LIKE ?";
    $params[] = "%$api_filter%";
    $types .= "s";
}

if ($date_filter) {
    $sql .= " AND DATE(activity_date) = ?";
    $params[] = $date_filter;
    $types .= "s";
}

$sql .= " ORDER BY activity_date DESC LIMIT ? OFFSET ?";
$params[] = $limit;
$params[] = $offset;
$types .= "ii";

// Prepare query for activities
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'SQL prepare error: ' . $conn->error]);
    exit();
}

$stmt->bind_param($types, ...$params);
if ($stmt->execute()) {
    $result = $stmt->get_result();
    $activities = [];
    while ($row = $result->fetch_assoc()) {
        $date = new DateTime($row['activity_date']);
        $row['formatted_date'] = $date->format('d/m/Y H:i:s');
        $activities[] = $row;
    }

    // Adjust the total count query for filters
    $total_query = "SELECT COUNT(*) AS total FROM user_activities WHERE user_id = ?";
    $total_params = [$user_id];
    $total_types = "i";

    // Apply API filter to total query
    if ($api_filter) {
        $total_query .= " AND api_name LIKE ?";
        $total_params[] = "%$api_filter%";
        $total_types .= "s";
    }

    // Apply date filter to total query
    if ($date_filter) {
        $total_query .= " AND DATE(activity_date) = ?";
        $total_params[] = $date_filter;
        $total_types .= "s";
    }

    // Prepare and execute total count query
    $total_stmt = $conn->prepare($total_query);
    $total_stmt->bind_param($total_types, ...$total_params);
    $total_stmt->execute();
    $total_result = $total_stmt->get_result();
    $total_activities = $total_result->fetch_assoc()['total'];
    $total_pages = ceil($total_activities / $limit);

    echo json_encode([
        'success' => true,
        'activities' => $activities,
        'pagination' => [
            'total_pages' => $total_pages,
            'current_page' => $page
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to fetch activities: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>

