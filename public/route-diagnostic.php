<?php
// Route diagnostic tool

// Import necessary classes
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Request;
use App\Services\TenantAuthService;

// Bootstrap the Laravel application
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// Get all registered routes
$routes = Route::getRoutes();

// Header
echo '<html><head>';
echo '<title>Route Diagnostic Tool</title>';
echo '<style>';
echo 'body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }';
echo '.container { max-width: 1200px; margin: 0 auto; }';
echo 'table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }';
echo 'table, th, td { border: 1px solid #ddd; }';
echo 'th, td { padding: 10px; text-align: left; }';
echo 'th { background-color: #f2f2f2; }';
echo 'tr:hover { background-color: #f5f5f5; }';
echo '.highlight { background-color: #e6f7ff; }';
echo '.method { display: inline-block; padding: 3px 6px; border-radius: 3px; color: white; font-size: 12px; }';
echo '.get { background-color: #61affe; }';
echo '.post { background-color: #49cc90; }';
echo '.put { background-color: #fca130; }';
echo '.delete { background-color: #f93e3e; }';
echo '.active { font-weight: bold; background-color: #e8f5e9; }';
echo '</style>';
echo '</head><body>';
echo '<div class="container">';

// Current request info
echo '<h1>Route Diagnostic Tool</h1>';
echo '<h2>Current Request</h2>';
echo '<table>';
echo '<tr><th>Parameter</th><th>Value</th></tr>';
echo '<tr><td>URL</td><td>' . Request::fullUrl() . '</td></tr>';
echo '<tr><td>Method</td><td>' . Request::method() . '</td></tr>';
echo '<tr><td>Route</td><td>' . (Route::currentRouteName() ?: 'Not named') . '</td></tr>';
echo '<tr><td>Action</td><td>' . (Route::currentRouteAction() ?: 'No action') . '</td></tr>';
echo '<tr><td>Path</td><td>' . Request::path() . '</td></tr>';
echo '</table>';

// Login route specific info
echo '<h2>Login Route Information</h2>';
echo '<table>';
echo '<tr><th>Parameter</th><th>Value</th></tr>';

// Try to find the login route
$loginRoutes = [];
foreach ($routes as $route) {
    if (strpos($route->uri, 'login') !== false) {
        $loginRoutes[] = $route;
    }
}

if (!empty($loginRoutes)) {
    foreach ($loginRoutes as $index => $route) {
        $methods = implode('|', $route->methods);
        $uri = $route->uri;
        $name = $route->getName() ?: 'unnamed';
        $action = $route->getActionName();
        
        $isActive = Request::path() === $uri;
        $rowClass = $isActive ? 'active' : '';
        
        echo '<tr class="' . $rowClass . '">';
        echo '<td>Login Route #' . ($index + 1) . '</td>';
        echo '<td>';
        foreach ($route->methods as $method) {
            $methodClass = strtolower($method);
            echo '<span class="method ' . $methodClass . '">' . $method . '</span> ';
        }
        echo $uri . ' (' . $name . ')<br>';
        echo '<small>' . $action . '</small>';
        echo '</td></tr>';
    }
} else {
    echo '<tr><td colspan="2">No login routes found</td></tr>';
}

echo '</table>';

// API connection test
echo '<h2>API Connection Test</h2>';
echo '<table>';
echo '<tr><th>Parameter</th><th>Value</th></tr>';

// Check API configuration
$apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001');
$apiMockEnabled = env('API_MOCK_ENABLED', false);

echo '<tr><td>API Base URL</td><td>' . $apiBaseUrl . '</td></tr>';
echo '<tr><td>API Mock Enabled</td><td>' . ($apiMockEnabled ? 'Yes' : 'No') . '</td></tr>';

// Test API connection
try {
    $tenantAuthService = new TenantAuthService();
    $testResponse = $tenantAuthService->login('test@example.com', 'password');
    
    echo '<tr><td>API Test Response</td><td>';
    echo 'Success: ' . ($testResponse['success'] ? 'Yes' : 'No') . '<br>';
    echo 'Status: ' . ($testResponse['status'] ?? 'Unknown') . '<br>';
    echo 'Message: ' . ($testResponse['body']['status']['message'] ?? 'No message') . '<br>';
    
    // Show more details if available
    if (isset($testResponse['body']) && is_array($testResponse['body'])) {
        echo '<pre>';
        print_r($testResponse['body']);
        echo '</pre>';
    }
    
    echo '</td></tr>';
} catch (Exception $e) {
    echo '<tr><td>API Test Error</td><td>Error: ' . $e->getMessage() . '</td></tr>';
}

echo '</table>';

// Routes listing
echo '<h2>All Registered Routes</h2>';
echo '<table>';
echo '<tr><th>Method</th><th>URI</th><th>Name</th><th>Action</th></tr>';

foreach ($routes as $route) {
    $methods = implode('|', $route->methods);
    $uri = $route->uri;
    $name = $route->getName() ?: '';
    $action = $route->getActionName();
    
    // Highlight the current route
    $isCurrentRoute = Request::path() === $uri;
    $rowClass = $isCurrentRoute ? 'highlight' : '';
    
    echo '<tr class="' . $rowClass . '">';
    echo '<td>';
    foreach ($route->methods as $method) {
        $methodClass = strtolower($method);
        echo '<span class="method ' . $methodClass . '">' . $method . '</span> ';
    }
    echo '</td>';
    echo '<td>' . $uri . '</td>';
    echo '<td>' . $name . '</td>';
    echo '<td>' . $action . '</td>';
    echo '</tr>';
}

echo '</table>';

echo '</div>';
echo '</body></html>';
