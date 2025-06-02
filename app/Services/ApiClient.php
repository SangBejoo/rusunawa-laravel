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
        $this->baseUrl = 'http://localhost:8001'; // Hardcode for now to debug
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout' => 30,
            'http_errors' => false,
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json'
            ]
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

            return [
                'status' => 500,
                'body' => ['message' => 'Server connection error', 'error' => $e->getMessage()],
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
        // Log request data for debugging
        Log::debug('API Request', [
            'endpoint' => $endpoint,
            'data' => $data
        ]);
        
        $result = $this->request('POST', $endpoint, ['json' => $data]);
        
        // Log response for debugging
        Log::debug('API Response', [
            'endpoint' => $endpoint,
            'status' => $result['status'],
            'body' => $result['body'] ?? null
        ]);
        
        return $result;
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
}
