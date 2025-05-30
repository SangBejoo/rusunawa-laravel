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
        $this->baseUrl = config('services.api.url', 'http://localhost:8080');
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout' => 30,
            'http_errors' => false,
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
            $response = $this->client->request($method, $endpoint, $options);
            $statusCode = $response->getStatusCode();
            $body = json_decode($response->getBody(), true);

            // Log errors for debugging
            if ($statusCode >= 400) {
                Log::error('API Error', [
                    'endpoint' => $endpoint,
                    'status' => $statusCode,
                    'response' => $body
                ]);
            }

            return [
                'status' => $statusCode,
                'body' => $body,
                'success' => $statusCode >= 200 && $statusCode < 300,
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
        return $this->request('POST', $endpoint, ['json' => $data]);
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
