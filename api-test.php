<?php

require __DIR__.'/vendor/autoload.php';

// Bootstrap the Laravel application
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get the tenant auth service from the container
$tenantAuthService = app(\App\Services\TenantAuthService::class);

// Test email and password - use real credentials if available
$email = 'tenant@example.com';
$password = 'password';

echo "Testing login with email: {$email} and password: {$password}\n";

// Attempt login
$response = $tenantAuthService->login($email, $password);

// Output the response
echo "Response:\n";
echo "Success: " . ($response['success'] ? 'true' : 'false') . "\n";
echo "Status: " . $response['status'] . "\n";
echo "Body: " . json_encode($response['body'], JSON_PRETTY_PRINT) . "\n";

// Check the API base URL
$apiBaseUrl = env('API_BASE_URL', 'http://localhost:8003');
echo "\nAPI Base URL: {$apiBaseUrl}\n";
echo "API Mock Enabled: " . (env('API_MOCK_ENABLED', false) ? 'true' : 'false') . "\n";

// If the login failed, try a basic HTTP request to check connectivity
if (!$response['success']) {
    echo "\nTesting API connectivity...\n";
    try {
        $httpResponse = \Illuminate\Support\Facades\Http::timeout(5)
            ->get($apiBaseUrl . '/v1/health-check');
        
        echo "Health check response status: " . $httpResponse->status() . "\n";
        echo "Health check response body: " . $httpResponse->body() . "\n";
    } catch (\Exception $e) {
        echo "Error connecting to API: " . $e->getMessage() . "\n";
    }
}
