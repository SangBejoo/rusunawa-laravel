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
        $response = $this->post('/v1/tenant/auth/login', [
            'email' => $email,
            'password' => $password
        ]);

        if ($response['success']) {
            // Store token and user details in session
            Session::put('tenant_token', $response['body']['token']);
            Session::put('tenant_data', $response['body']['tenant']);
        }

        return $response;
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
        
        return $this->post('/v1/tenant/auth/verify-token', ['token' => $token]);
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
