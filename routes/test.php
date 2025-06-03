<?php
// This file tests the tenant login route to ensure it's working correctly

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Auth\TestLoginController;

// Simple function to display route information
Route::get('/test-tenant-login', function() {
    // Get the URL for the tenant.login route
    $loginUrl = route('tenant.login');
    
    echo "<h1>Route Testing</h1>";
    echo "<p>tenant.login route URL: {$loginUrl}</p>";
    
    // Check if the route exists
    echo "<p>Does the route 'tenant.login' exist? " . 
        (Route::has('tenant.login') ? 'Yes' : 'No') . "</p>";
    
    // Log info for debugging
    Log::info('Test route accessed', [
        'tenant.login_url' => $loginUrl,
        'route_exists' => Route::has('tenant.login'),
        'session_id' => session()->getId(),
        'session_data' => session()->all()
    ]);
    
    // List all tenant.* routes
    echo "<h2>All tenant.* routes:</h2>";
    echo "<ul>";
    foreach (Route::getRoutes() as $route) {
        $name = $route->getName();
        if ($name && strpos($name, 'tenant.') === 0) {
            echo "<li>{$name} - {$route->uri()}</li>";
        }
    }
    echo "</ul>";
    
    // Add test links with different methods
    echo "<h2>Test Links:</h2>";
    echo "<ul>";
    echo "<li><a href='{$loginUrl}'>Regular link to login route</a></li>";
    echo "<li><a href='#' onclick='event.preventDefault(); window.location.href=\"{$loginUrl}\";'>JS redirect with preventDefault</a></li>";
    echo "<li>
        <form action='{$loginUrl}' method='get'>
            <button type='submit'>Form submit to login route</button>
        </form>
    </li>";
    echo "</ul>";
    
    echo "<h2>Navigation Debugging Tool:</h2>";
    echo "<p><a href='/test-navigation.html'>Open Navigation Test Page</a></p>";
    
    echo "<h2>Direct Test Controller:</h2>";
    echo "<p><a href='/test-login-direct'>Test Direct Login View</a></p>";
    
    return "";
});

// Direct test route that bypasses any middleware or filters
Route::get('/test-login-direct', [TestLoginController::class, 'testLoginForm']);
