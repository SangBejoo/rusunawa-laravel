<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TenantAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DebugTenantLoginController extends Controller
{
    protected $tenantAuthService;

    public function __construct(TenantAuthService $tenantAuthService)
    {
        $this->tenantAuthService = $tenantAuthService;
    }

    /**
     * Display a simplified login form for debugging
     */
    public function showDebugLoginForm()
    {
        // Log access for debugging
        Log::info('DebugTenantLoginController::showDebugLoginForm accessed', [
            'url' => request()->fullUrl(),
            'session_id' => session()->getId()
        ]);
        
        return view('tenant.debug-login');
    }

    /**
     * Handle a simple login request for debugging
     */
    public function login(Request $request)
    {
        // Log the request
        Log::info('DebugTenantLoginController::login accessed', [
            'email' => $request->input('email'),
            'session_id' => session()->getId()
        ]);
        
        // Validate input
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
        
        // Attempt login
        $response = $this->tenantAuthService->login(
            $request->input('email'),
            $request->input('password')
        );
        
        // Log the response
        Log::info('DebugTenantLoginController::login response', [
            'success' => $response['success'],
            'status' => $response['status'],
            'message' => $response['body']['status']['message'] ?? 'No message'
        ]);
        
        // Handle the response
        if ($response['success']) {
            // Store token in session
            session(['tenant_token' => $response['body']['token']]);
            
            // Store tenant data
            if (isset($response['body']['tenant'])) {
                $tenantData = [
                    'tenant' => $response['body']['tenant'],
                    'token' => $response['body']['token']
                ];
                session(['tenant_data' => json_encode($tenantData)]);
            }
            
            // Show success page
            return view('tenant.debug-login-success', [
                'token' => $response['body']['token'],
                'tenant' => $response['body']['tenant'] ?? null,
                'response' => $response
            ]);
        } else {
            // Show error with details
            return back()
                ->withInput($request->only('email'))
                ->withErrors(['login_error' => $response['body']['status']['message'] ?? 'Login failed'])
                ->with('response_debug', $response);
        }
    }
}
