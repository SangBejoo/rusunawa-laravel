<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TenantAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class TenantLoginController extends Controller
{
    protected $tenantAuthService;

    public function __construct(TenantAuthService $tenantAuthService)
    {
        $this->tenantAuthService = $tenantAuthService;
        // Do not apply any middleware in the constructor
    }

    /**
     * Show the login form
     */
    public function showLoginForm()
    {
        // Log access attempt for debugging
        Log::info('TenantLoginController::showLoginForm accessed', [
            'url' => request()->fullUrl(),
            'session_id' => session()->getId(),
        ]);

        // If already logged in, redirect to landing page
        if (Session::has('tenant_token') && !request()->has('force')) {
            Log::info('User already logged in, redirecting to landing page');
            return redirect()->route('landing');
        }
        
        // Always render the login view directly
        return view('tenant.login');
    }

    /**
     * Handle a login request to the application.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $response = $this->tenantAuthService->login(
                $request->input('email'),
                $request->input('password')
            );

            if ($response['success']) {
                // Store token
                Session::put('tenant_token', $response['body']['token'] ?? null);
                
                // Store tenant data for frontend access
                if (isset($response['body']['tenant'])) {
                    // Store both the raw tenant data and the token
                    $tenantData = [
                        'tenant' => $response['body']['tenant'],
                        'token' => $response['body']['token']
                    ];
                    Session::put('tenant_data', json_encode($tenantData));
                }
                
                // Always redirect to landing page
                $returnUrl = route('landing');
                
                // If request is an AJAX request
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Login successful',
                        'redirect' => $returnUrl,
                        'tenant_token' => $response['body']['token'] ?? null,
                        'tenant_data' => $response['body']['tenant'] ?? null
                    ]);
                }
                
                // Regular form submission
                return redirect($returnUrl);
            } else {
                Log::warning('Login failed', [
                    'email' => $request->input('email'),
                    'status' => $response['status'],
                    'message' => $response['body']['status']['message'] ?? 'Unknown error'
                ]);
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => $response['body']['status']['message'] ?? 'Invalid credentials'
                    ], $response['status']);
                }
                
                return back()
                    ->withInput($request->only('email'))
                    ->withErrors(['email' => $response['body']['status']['message'] ?? 'Invalid credentials']);
            }
        } catch (\Exception $e) {
            Log::error('Exception during login', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'An error occurred during login'
                ], 500);
            }
            
            return back()
                ->withInput($request->only('email'))
                ->withErrors(['email' => 'An error occurred during login']);
        }
    }

    /**
     * Log the user out of the application.
     */
    public function logout(Request $request)
    {
        Session::forget('tenant_token');
        Session::forget('tenant_data');
        
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out'
            ]);
        }
        
        return redirect()->route('landing');
    }
}
