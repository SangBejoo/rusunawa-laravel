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
    }

    /**
     * Show the login form
     */
    public function showLoginForm()
    {
        // If already logged in, redirect to dashboard
        if (Session::has('tenant_token')) {
            return redirect()->route('tenant.dashboard');
        }
        
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
                // If request is an AJAX request
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Login successful',
                        'redirect' => route('tenant.dashboard')
                    ]);
                }
                
                // Regular form submission
                return redirect()->route('tenant.dashboard');
            } else {
                Log::warning('Login failed', [
                    'email' => $request->input('email'),
                    'status' => $response['status'],
                    'message' => $response['body']['message'] ?? 'Unknown error'
                ]);
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => $response['body']['message'] ?? 'Invalid credentials'
                    ], $response['status']);
                }
                
                return back()
                    ->withInput($request->only('email'))
                    ->withErrors(['email' => $response['body']['message'] ?? 'Invalid credentials']);
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
        
        return redirect()->route('login');
    }
}
