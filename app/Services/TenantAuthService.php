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
        $this->baseUrl = env('API_BASE_URL', 'http://localhost:8001');
        $this->apiClient = $apiClient ?? app(ApiClient::class);
    }

    /**
     * Authenticate tenant with given credentials
     */
    public function login($email, $password)
    {
        try {
            Log::info('TenantAuthService: Attempting login', ['email' => $email]);
            
            // Call the authentication API using the ApiClient
            $response = $this->apiClient->post('/v1/tenant/auth/login', [
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
            
            // Validate response has required fields
            // Only return success if we get a 2xx response, a valid token AND tenant data
            if ($response['success'] && isset($data['token']) && isset($data['tenant'])) {
                // Make sure token is a non-empty string
                if (empty($data['token']) || !is_string($data['token'])) {
                    Log::error('TenantAuthService: Invalid token format', [
                        'token_type' => gettype($data['token'])
                    ]);
                    
                    return [
                        'success' => false,
                        'status' => 401,
                        'body' => [
                            'status' => [
                                'message' => 'Authentication failed: Invalid token format'
                            ]
                        ]
                    ];
                }
                
                // Validate that tenant data has required fields
                if (!isset($data['tenant']['id']) || !isset($data['tenant']['user'])) {
                    Log::error('TenantAuthService: Invalid tenant data structure', [
                        'tenant_data' => $data['tenant']
                    ]);
                    
                    return [
                        'success' => false,
                        'status' => 401,
                        'body' => [
                            'status' => [
                                'message' => 'Authentication failed: Invalid tenant data'
                            ]
                        ]
                    ];
                }
                
                return [
                    'success' => true,
                    'status' => $statusCode,
                    'body' => $data
                ];
            }
            
            // If response was successful but missing data
            if ($response['success'] && (!isset($data['token']) || !isset($data['tenant']))) {
                Log::warning('TenantAuthService: Successful response but missing token or tenant data', [
                    'has_token' => isset($data['token']),
                    'has_tenant' => isset($data['tenant'])
                ]);
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
            return null;
        }
        
        // If stored as JSON string, decode it
        if (is_string($tenantData)) {
            try {
                $tenantData = json_decode($tenantData, true);
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
     * Verify if token is valid
     */
    public function verifyToken($token)
    {
        try {
            $response = $this->apiClient->get('/v1/tenant/auth/verify', [], [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token
                ]
            ]);
            
            $data = $response['body'] ?? [];
            
            return [
                'success' => $response['success'] && isset($data['status']) && $data['status']['status'] === 'success',
                'status' => $response['status'],
                'body' => $data
            ];
        } catch (\Exception $e) {
            Log::error('TenantAuthService: Exception during token verification', [
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'status' => 500,
                'body' => [
                    'status' => [
                        'message' => 'Failed to verify token: ' . $e->getMessage()
                    ]
                ]
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
