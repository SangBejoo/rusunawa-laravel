<?php
// A basic diagnostic PHP file to test routes and redirects
header('Content-Type: text/plain');

echo "Login Route Test\n";
echo "===============\n\n";
echo "Date/Time: " . date('Y-m-d H:i:s') . "\n";
echo "Request URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "Current PHP file: " . __FILE__ . "\n\n";

echo "Session Information:\n";
session_start();
echo "Session ID: " . session_id() . "\n";
echo "Session Content:\n";
print_r($_SESSION);

echo "\nCookies:\n";
print_r($_COOKIE);
