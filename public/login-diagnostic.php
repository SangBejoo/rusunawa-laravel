<?php

// Simple route diagnostic file
// This file is directly accessed at http://localhost/rusunawaaaaaaaaaaaaa/public/login-diagnostic.php

// Output HTTP headers
header('Content-Type: text/plain');

// Show session info
session_start();
echo "=== SESSION INFO ===\n";
echo "Session ID: " . session_id() . "\n";
echo "Session Data: \n";
print_r($_SESSION);
echo "\n\n";

// Show server info
echo "=== SERVER INFO ===\n";
echo "SERVER_NAME: " . $_SERVER['SERVER_NAME'] . "\n";
echo "REQUEST_URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "SCRIPT_NAME: " . $_SERVER['SCRIPT_NAME'] . "\n";
echo "PHP_SELF: " . $_SERVER['PHP_SELF'] . "\n";
echo "DOCUMENT_ROOT: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "\n\n";

// Show environment
echo "=== ENVIRONMENT ===\n";
echo "PHP Version: " . phpversion() . "\n";
echo "Laravel Version: Unknown (not accessible from this diagnostic script)\n";
echo "\n\n";

// Test redirect
echo "=== REDIRECT TEST ===\n";
echo "To test redirects, append ?redirect=1 to this URL\n";

if (isset($_GET['redirect'])) {
    echo "Redirecting to /tenant/login in 3 seconds...\n";
    header("Refresh: 3; URL=/rusunawaaaaaaaaaaaaa/public/tenant/login");
}

?>
