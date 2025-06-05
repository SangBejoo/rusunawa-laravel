<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class TenantAuthService
{
    protected $baseUrl;
    protected $apiClient;

    public function __construct(ApiClient $apiClient = null)
    {
        $this->baseUrl = env('API_BASE_URL', 'http://localhost:8003/v1');
        $this->apiClient = $apiClient ?? app(ApiClient::class);
    }

    /**
     * Authenticate tenant with given credentials
     */
    public function login($email, $password)
    {
        try {
            Log::info('TenantAuthService: Attempting login', ['email' => $email]);
            
            // Try direct HTTP call first as backup
            try {
                $directResponse = Http::withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json'
                ])->timeout(10)->post("{$this->baseUrl}/tenant/auth/login", [
                    'email' => $email,
                    'password' => $password
                ]);
                
                Log::debug('Direct API login call', [
                    'status' => $directResponse->status(),
                    'successful' => $directResponse->successful(),
                    'has_token' => isset($directResponse->json()['token']),
                    'has_tenant' => isset($directResponse->json()['tenant'])
                ]);
                
                // If direct call was successful, use that response
                if ($directResponse->successful() && 
                    isset($directResponse->json()['token']) && 
                    isset($directResponse->json()['tenant'])) {
                    
                    $data = $directResponse->json();
                    return [
                        'success' => true,
                        'status' => $directResponse->status(),
                        'body' => $data
                    ];
                }
            } catch (\Exception $e) {
                Log::warning('Direct API login attempt failed, falling back to ApiClient', [
                    'error' => $e->getMessage()
                ]);
            }
            
            // If direct call failed, fall back to ApiClient
            $response = $this->apiClient->post('/tenant/auth/login', [
                'email' => $email,
                'password' => $password
            ]);
            
            $data = $response['body'] ?? [];
            $statusCode = $response['status'] ?? 500;
            
            // Log response for debugging (remove sensitive data in production)
            Log::info('TenantAuthService: Login response', [
                'status_code' => $statusCode,
                'success' => $response['success'],
                'has_token' => isset($data['token']),
                'has_tenant' => isset($data['tenant']),
                'response_message' => $data['status']['message'] ?? 'No message'
            ]);
            
            // Validate response
            if ($response['success'] && isset($data['token']) && isset($data['tenant'])) {
                return [
                    'success' => true,
                    'status' => $statusCode,
                    'body' => $data
                ];
            }
            
            return [
                'success' => false,
                'status' => $statusCode,
                'body' => $data
            ];
        } catch (\Exception $e) {
            Log::error('TenantAuthService: Exception during login', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'status' => 500,
                'body' => [
                    'status' => [
                        'message' => 'An error occurred during authentication: ' . $e->getMessage()
                    ]
                ]
            ];
        }
    }

    /**
     * Get authenticated tenant data
     */
    public function getTenantData()
    {
        $tenantData = Session::get('tenant_data');
        
        if (!$tenantData) {
            Log::info('TenantAuthService: No tenant data in session');
            return null;
        }
        
        // If stored as JSON string, decode it
        if (is_string($tenantData)) {
            try {
                $tenantData = json_decode($tenantData, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    Log::error('TenantAuthService: JSON decode error', [
                        'error' => json_last_error_msg(),
                        'data_sample' => substr($tenantData, 0, 100) . '...'
                    ]);
                    return null;
                }
            } catch (\Exception $e) {
                Log::error('TenantAuthService: Error decoding tenant data', [
                    'error' => $e->getMessage()
                ]);
                return null;
            }
        }
        
        return $tenantData;
    }
    
    /**
     * Verify if a given token is valid
     */
    public function verifyToken($token)
    {
        try {
            Log::info('TenantAuthService: Verifying token');
            
            // Call the token verification API
            $response = $this->apiClient->get('/tenant/auth/verify', [], [
                'Authorization' => "Bearer {$token}"
            ]);
            
            $data = $response['body'] ?? [];
            $statusCode = $response['status'] ?? 500;
            
            Log::info('TenantAuthService: Token verification response', [
                'status_code' => $statusCode,
                'success' => $response['success']
            ]);
            
            // Token is valid if we get a successful response
            if ($response['success'] && isset($data['tenant'])) {
                return [
                    'success' => true,
                    'tenant' => $data['tenant']
                ];
            }
            
            return [
                'success' => false,
                'message' => $data['status']['message'] ?? 'Invalid token'
            ];
            
        } catch (\Exception $e) {
            Log::error('TenantAuthService: Token verification failed', [
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'message' => 'Token verification failed'
            ];
        }
    }
    
    /**
     * Check if user is logged in
     * 
     * @return bool
     */
    public function isLoggedIn()
    {
        try {
            // Check if tenant token exists in session
            $token = Session::get('tenant_token');
            
            if (!$token) {
                Log::debug('TenantAuthService::isLoggedIn - No token in session');
                return false;
            }
            
            // For better performance, we can optionally skip verification
            // and just check for token existence
            if (env('SKIP_TOKEN_VERIFICATION', false)) {
                Log::debug('TenantAuthService::isLoggedIn - Skipping token verification');
                return true;
            }
            
            // Verify token with API
            $response = $this->verifyToken($token);
            
            if (!$response['success']) {
                Log::warning('TenantAuthService::isLoggedIn - Token verification failed', [
                    'status' => $response['status'],
                    'message' => $response['body']['status']['message'] ?? 'No message'
                ]);
            }
            
            return $response['success'];
        } catch (\Exception $e) {
            Log::error('TenantAuthService: Exception during isLoggedIn check', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return false;
        }
    }
}
