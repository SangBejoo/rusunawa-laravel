<?php
require __DIR__.'/../vendor/autoload.php';

// Load .env file if it exists
if (file_exists(__DIR__.'/../.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__.'/..');
    $dotenv->load();
}

// Basic diagnostic for the login view
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Capture the request
$request = Illuminate\Http\Request::capture();

// Add logging for what's happening
\Illuminate\Support\Facades\Log::info('Login view test accessed', [
    'url' => $request->fullUrl(),
    'method' => $request->method(),
    'path' => $request->path()
]);

// Show simple login form
echo '<html><head><title>Login Test</title></head><body>';
echo '<h1>Rusunawa Login Test</h1>';
echo '<p>This is a simple login form for testing. It will bypass the React frontend.</p>';
echo '<form method="post" action="/rusunawaaaaaaaaaaaaa/public/tenant/login">';
echo '<input type="hidden" name="_token" value="' . csrf_token() . '">';
echo '<div><label>Email: <input type="email" name="email" required></label></div>';
echo '<div><label>Password: <input type="password" name="password" required></label></div>';
echo '<div><button type="submit">Login</button></div>';
echo '</form>';
echo '<p><a href="/rusunawaaaaaaaaaaaaa/public/tenant/login">Try the normal login page</a></p>';
echo '</body></html>';

?>
