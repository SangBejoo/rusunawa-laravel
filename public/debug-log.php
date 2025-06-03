<?php
// Manually create a log file to monitor redirects and session issues

if (!file_exists('../storage/logs')) {
    mkdir('../storage/logs', 0777, true);
}

$logFile = '../storage/logs/debug.log';

// Log function
function debugLog($message, $data = []) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    $dataStr = !empty($data) ? ' - ' . json_encode($data) : '';
    $logEntry = "[{$timestamp}] {$message}{$dataStr}" . PHP_EOL;
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}

// Log request information
debugLog('Debug log accessed', [
    'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'unknown',
    'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
    'HTTP_REFERER' => $_SERVER['HTTP_REFERER'] ?? 'unknown',
    'REMOTE_ADDR' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
]);

// Log session information if available
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

debugLog('Session information', [
    'session_id' => session_id(),
    'session_data' => $_SESSION ?? 'No session data',
    'cookies' => $_COOKIE ?? 'No cookies'
]);

// Display debug information
echo "<h1>Debug Log</h1>";
echo "<p>Logged to: {$logFile}</p>";

echo "<h2>Request Information</h2>";
echo "<pre>";
print_r($_SERVER);
echo "</pre>";

echo "<h2>Session Information</h2>";
echo "<pre>";
print_r($_SESSION ?? 'No session data');
echo "</pre>";

echo "<h2>Cookie Information</h2>";
echo "<pre>";
print_r($_COOKIE ?? 'No cookies');
echo "</pre>";

echo "<h2>Test Links</h2>";
echo "<ul>";
echo "<li><a href='/tenant/login'>Go to Login Page</a></li>";
echo "<li><a href='/tenant/login-direct'>Direct Login View Test</a></li>";
echo "<li><a href='/test-login-direct'>Test Login Controller</a></li>";
echo "<li><a href='/'>Back to Home</a></li>";
echo "</ul>";
