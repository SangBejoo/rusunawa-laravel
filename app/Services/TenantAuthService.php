<?php

namespace App\Services;

use Illuminate\Support\Facades\Session;

class TenantAuthService extends ApiClient
{
    /**
     * Login a tenant
     */
    public function login(string $email, string $password)
    {
        // Log the login attempt for debugging
        \Illuminate\Support\Facades\Log::debug('Tenant login attempt', [
            'email' => $email,
            'endpoint' => '/v1/tenant/auth/login'
        ]);
        
        try {
            $response = $this->post('/v1/tenant/auth/login', [
                'email' => $email,
                'password' => $password
            ]);

            if ($response['success']) {
                // Store token and user details in session
                Session::put('tenant_token', $response['body']['token']);
                Session::put('tenant_data', $response['body']['tenant']);
                
                // Log successful login
                \Illuminate\Support\Facades\Log::info('Tenant login successful', [
                    'email' => $email,
                    'tenant_id' => $response['body']['tenant']['tenant_id'] ?? null
                ]);
            } else {
                // Log failed login
                \Illuminate\Support\Facades\Log::warning('Tenant login failed', [
                    'email' => $email,
                    'status' => $response['status'],
                    'message' => $response['body']['message'] ?? 'Unknown error'
                ]);
            }

            return $response;
        } catch (\Exception $e) {
            // Log any exceptions
            \Illuminate\Support\Facades\Log::error('Tenant login exception', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'status' => 500,
                'body' => ['message' => 'Login failed: ' . $e->getMessage()]
            ];
        }
    }

    /**
     * Register a new tenant
     */
    public function register(array $data)
    {
        return $this->post('/v1/tenant/auth/register', $data);
    }

    /**
     * Request password reset
     */
    public function forgotPassword(string $email)
    {
        return $this->post('/v1/tenant/auth/forgot-password', [
            'email' => $email
        ]);
    }

    /**
     * Reset password with token
     */
    public function resetPassword(string $token, string $newPassword)
    {
        return $this->post('/v1/tenant/auth/reset-password', [
            'token' => $token,
            'new_password' => $newPassword
        ]);
    }

    /**
     * Verify if the current token is valid
     */
    public function verifyToken()
    {
        $token = Session::get('tenant_token');
        
        if (!$token) {
            return [
                'success' => false,
                'status' => 401,
                'body' => ['message' => 'No authentication token found']
            ];
        }
        
        try {
            $response = $this->post('/v1/tenant/auth/verify-token', ['token' => $token]);
            return $response;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Token verification failed', [
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'status' => 500,
                'body' => ['message' => 'Error verifying token: ' . $e->getMessage()]
            ];
        }
    }

    /**
     * Check if user is logged in
     */
    public function isLoggedIn()
    {
        return Session::has('tenant_token');
    }

    /**
     * Logout the current tenant
     */
    public function logout()
    {
        Session::forget('tenant_token');
        Session::forget('tenant_data');
    }

    /**
     * Get the authenticated tenant's data
     */
    public function getTenantData()
    {
        return Session::get('tenant_data');
    }
}
