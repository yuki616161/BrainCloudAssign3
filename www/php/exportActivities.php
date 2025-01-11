<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="user_activities.csv"');

// Database configuration
$config = [
    'host' => 'localhost',
    'username' => 'u237859360_braincloud',
    'password' => 'Braincloud123@',
    'dbname' => 'u237859360_braincloud'
];

// Output buffering to prevent whitespace issues
ob_start();

try {
    // Get user ID from request
    $user_id = $_GET['user_id'] ?? null;

    if (!$user_id) {
        throw new Exception('User ID is required.');
    }

    // Database connection
    $dsn = "mysql:host=" . $config['host'] . ";dbname=" . $config['dbname'] . ";charset=utf8mb4";
    $pdo = new PDO($dsn, $config['username'], $config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Build SQL query with user ID filter
    $sql = "SELECT activity_id, user_id, api_name, action_description, activity_date
            FROM user_activities 
            WHERE user_id = ?";
    $params = [$user_id];

    // Apply additional filters
    if (!empty($_GET['api'])) {
        $sql .= " AND api_name LIKE ?";
        $params[] = "%" . $_GET['api'] . "%";
    }

    if (!empty($_GET['date'])) {
        $sql .= " AND DATE(activity_date) = ?";
        $params[] = $_GET['date'];
    }

    $sql .= " ORDER BY activity_date DESC";

    // Execute query
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($activities)) {
        throw new Exception('No data available for export');
    }

    // Start CSV output
    $output = fopen('php://output', 'w');

    // Add UTF-8 BOM to support Excel formatting
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    // Write column headers
    fputcsv($output, ['Activity ID', 'User ID', 'API Name', 'Action Description', 'Activity Date']);

    // Write activities to CSV
    foreach ($activities as $activity) {
        fputcsv($output, [
            $activity['activity_id'],
            $activity['user_id'],
            $activity['api_name'],
            $activity['action_description'],
            (new DateTime($activity['activity_date']))->format('Y-m-d H:i:s')
        ]);
    }

    // Close the file
    fclose($output);

    // Flush output buffer
    ob_flush();
    exit();
} catch (Exception $e) {
    ob_end_clean();
    error_log('Export error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Export failed: ' . $e->getMessage()]);
    exit();
}
?>
