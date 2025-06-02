<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class ApiClient
{
    protected $client;
    protected $baseUrl;

    public function __construct()
    {
        $this->baseUrl = env('API_BASE_URL', 'http://localhost:8001');
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout' => env('API_TIMEOUT', 30),
            'http_errors' => false,
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json'
            ]
        ]);
        
        // Log API configuration
        Log::info('API Client initialized', [
            'base_url' => $this->baseUrl,
            'timeout' => env('API_TIMEOUT', 30),
            'mock_enabled' => env('API_MOCK_ENABLED', false)
        ]);
    }

    /**
     * Make an authenticated request to the API
     */
    protected function request(string $method, string $endpoint, array $options = [])
    {
        // Add authentication token if available
        $token = Session::get('tenant_token');
        if ($token) {
            $options['headers'] = array_merge(
                $options['headers'] ?? [],
                ['Authorization' => 'Bearer ' . $token]
            );
        }

        try {
            // Log the request for debugging
            Log::debug('API Request', [
                'endpoint' => $this->baseUrl . $endpoint,
                'method' => $method,
                'options' => $options
            ]);

            $response = $this->client->request($method, $endpoint, $options);
            $statusCode = $response->getStatusCode();
            $body = json_decode($response->getBody(), true);

            // Log response for debugging
            Log::debug('API Response', [
                'endpoint' => $endpoint,
                'status' => $statusCode,
                'body' => $body
            ]);

            // For successful responses, return the response body directly
            if ($statusCode >= 200 && $statusCode < 300) {
                return [
                    'status' => $statusCode,
                    'body' => $body,
                    'success' => true,
                ];
            }

            // For errors, log them and return formatted error response
            Log::error('API Error', [
                'endpoint' => $endpoint,
                'status' => $statusCode,
                'response' => $body
            ]);

            return [
                'status' => $statusCode,
                'body' => [
                    'message' => $body['message'] ?? 'An error occurred while connecting to the server',
                    'status' => [
                        'message' => $body['status']['message'] ?? 'Server error',
                        'status' => 'error'
                    ]
                ],
                'success' => false,
            ];
        } catch (GuzzleException $e) {
            Log::error('API Connection Error', [
                'endpoint' => $endpoint,
                'message' => $e->getMessage(),
            ]);
            
            // Check if it's a connection error
            if (strpos($e->getMessage(), 'Connection refused') !== false || 
                strpos($e->getMessage(), 'Could not resolve host') !== false ||
                strpos($e->getMessage(), 'Connection timed out') !== false) {
                
                Log::critical('Backend API service is not available', [
                    'endpoint' => $this->baseUrl . $endpoint,
                    'error' => $e->getMessage()
                ]);
                
                return [
                    'status' => 500,
                    'body' => [
                        'message' => 'Cannot connect to backend API service. Please make sure the service is running.',
                        'error' => $e->getMessage()
                    ],
                    'success' => false,
                ];
            }

            return [
                'status' => 500,
                'body' => [
                    'message' => 'Server connection error', 
                    'error' => $e->getMessage()
                ],
                'success' => false,
            ];
        }
    }

    /**
     * Make a GET request
     */
    public function get(string $endpoint, array $query = [])
    {
        return $this->request('GET', $endpoint, ['query' => $query]);
    }

    /**
     * Make a POST request
     */
    public function post(string $endpoint, array $data = [])
    {
        // Check if mock mode is enabled
        if (env('API_MOCK_ENABLED', false)) {
            Log::warning('API MOCK MODE is enabled - real API calls are not being made', [
                'endpoint' => $endpoint,
                'data' => $data
            ]);
            
            // Return a mock success response for testing purposes
            return $this->getMockResponse($endpoint, $data);
        }
        
        // Log request data for debugging
        Log::debug('API Request', [
            'endpoint' => $endpoint,
            'data' => $data
        ]);
        
        try {
            $result = $this->request('POST', $endpoint, ['json' => $data]);
            
            // Log response for debugging
            Log::debug('API Response', [
                'endpoint' => $endpoint,
                'status' => $result['status'],
                'body' => $result['body'] ?? null
            ]);
            
            return $result;
        } catch (\Exception $e) {
            Log::error('API Post Exception', [
                'endpoint' => $endpoint,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'status' => 500,
                'body' => ['message' => 'API error: ' . $e->getMessage()],
                'success' => false,
            ];
        }
    }
    
    /**
     * Generate mock responses for testing when API is not available
     */
    private function getMockResponse(string $endpoint, array $data = [])
    {
        Log::warning('Generating mock response', [
            'endpoint' => $endpoint
        ]);
        
        // Mock responses for different endpoints
        if ($endpoint === '/v1/tenant/auth/register') {
            return [
                'status' => 200,
                'body' => [
                    'tenant_id' => rand(1, 1000),
                    'email' => $data['email'] ?? 'mock@example.com',
                    'message' => 'Registration successful (MOCK MODE)',
                    'status' => [
                        'message' => 'Success',
                        'status' => 'success'
                    ]
                ],
                'success' => true,
            ];
        }
        
        if ($endpoint === '/v1/tenant/auth/login') {
            return [
                'status' => 200,
                'body' => [
                    'token' => 'mock_token_' . time(),
                    'tenant' => [
                        'tenant_id' => rand(1, 1000),
                        'user_id' => rand(1, 1000),
                        'email' => $data['email'] ?? 'mock@example.com',
                        'name' => 'Mock User',
                    ],
                    'status' => [
                        'message' => 'Login successful (MOCK MODE)',
                        'status' => 'success'
                    ]
                ],
                'success' => true,
            ];
        }
        
        // Default mock response
        return [
            'status' => 200,
            'body' => [
                'message' => 'Mock response for ' . $endpoint,
                'data' => $data,
                'status' => [
                    'message' => 'Success (MOCK MODE)',
                    'status' => 'success'
                ]
            ],
            'success' => true,
        ];
    }

    /**
     * Make a PUT request
     */
    public function put(string $endpoint, array $data = [])
    {
        return $this->request('PUT', $endpoint, ['json' => $data]);
    }

    /**
     * Make a DELETE request
     */
    public function delete(string $endpoint, array $data = [])
    {
        return $this->request('DELETE', $endpoint, ['json' => $data]);
    }
    
    /**
     * Check API health
     */
    public function checkHealth()
    {
        try {
            $response = $this->get('/v1/health');
            return $response['success'];
        } catch (\Exception $e) {
            Log::error('API Health Check Failed', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
