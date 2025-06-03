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
    }    /**
     * Show the login form
     */
    public function showLoginForm()
    {
        // Log access attempt for debugging
        Log::info('TenantLoginController::showLoginForm accessed', [
            'url' => request()->fullUrl(),
            'session_id' => session()->getId()
        ]);

        // Always ensure a clean session state for login
        if (!Session::has('tenant_token')) {
            Session::regenerate(); // Only regenerate if not logged in
            
            // Also clear authentication cookies if any
            $response = response()->view('tenant.login', ['errors' => $this->getErrorBag()]);
            $response->headers->clearCookie('tenant_session');
            $response->headers->clearCookie('tenant_token');
            
            return $response->withHeaders([
                'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma' => 'no-cache',
                'Expires' => 'Sat, 01 Jan 2000 00:00:00 GMT'
            ]);
        }
        
        // If already logged in, redirect to landing page
        if (Session::has('tenant_token')) {
            Log::info('User already logged in, redirecting to landing page');
            return redirect()->route('landing');
        }
        
        // Return the view with no-cache headers
        return response()->view('tenant.login', ['errors' => $this->getErrorBag()])->withHeaders([
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'Expires' => 'Sat, 01 Jan 2000 00:00:00 GMT'
        ]);
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
            // Make sure any old session data is cleared
            Session::forget('tenant_token');
            Session::forget('tenant_data');
            
            // Attempt login
            $response = $this->tenantAuthService->login(
                $request->input('email'),
                $request->input('password')
            );

            if ($response['success']) {
                // Verify we actually have a token
                if (empty($response['body']['token'])) {
                    Log::error('Missing token in successful login response');
                    
                    if ($request->expectsJson()) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Authentication error: Invalid token'
                        ], 500);
                    }
                    
                    return back()
                        ->withInput($request->only('email'))
                        ->withErrors(['email' => 'Authentication error: Invalid token']);
                }
                
                // Store token
                Session::put('tenant_token', $response['body']['token']);
                
                // Store tenant data for frontend access
                if (isset($response['body']['tenant'])) {
                    // Store both the raw tenant data and the token
                    $tenantData = [
                        'tenant' => $response['body']['tenant'],
                        'token' => $response['body']['token']
                    ];
                    Session::put('tenant_data', json_encode($tenantData));
                } else {
                    Log::error('Missing tenant data in successful login response');
                    
                    if ($request->expectsJson()) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Authentication error: Missing tenant data'
                        ], 500);
                    }
                    
                    return back()
                        ->withInput($request->only('email'))
                        ->withErrors(['email' => 'Authentication error: Missing tenant data']);
                }
                
                // Log successful login
                Log::info('Login successful', [
                    'email' => $request->input('email'),
                    'tenant_id' => $response['body']['tenant']['id'] ?? 'unknown'
                ]);                // Determine redirect URL
                $returnUrl = $request->query('redirect');
                
                // If no redirect URL provided, check for intended URL in session
                if (!$returnUrl && Session::has('url.intended')) {
                    $returnUrl = Session::get('url.intended');
                    Session::forget('url.intended');
                }
                
                // Default to dashboard if no redirect URL found
                if (!$returnUrl) {
                    $returnUrl = route('tenant.dashboard');
                }
                
                // If request is an AJAX request
                if ($request->expectsJson()) {
                    // Create the response with proper session data
                    $jsonResponse = response()->json([
                        'success' => true,
                        'message' => 'Login successful',
                        'redirect' => $returnUrl,
                        'tenant_token' => $response['body']['token'],
                        'tenant_data' => $response['body']['tenant']
                    ]);                // Store token in session cookie
                $jsonResponse->cookie('tenant_token', $response['body']['token'], 60 * 24, null, null, false, true);
                
                // Store tenant data in both session and response
                Session::put('tenant_token', $response['body']['token']);
                Session::put('tenant_data', json_encode([
                    'tenant' => $response['body']['tenant'],
                    'token' => $response['body']['token']
                ]));
                Session::save();
                
                return $jsonResponse;
                }
                
                // Regular form submission
                return redirect($returnUrl)->with([
                    'tenant_token' => $response['body']['token'],
                    'tenant_data' => json_encode([
                        'tenant' => $response['body']['tenant'],
                        'token' => $response['body']['token']
                    ])
                ]);
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
                    ], $response['status'] >= 400 ? $response['status'] : 401);
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
                    'message' => 'An error occurred during login: ' . $e->getMessage()
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
        // Clear all session data
        Session::forget('tenant_token');
        Session::forget('tenant_data');
        
        // If sending and API request
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out'
            ]);
        }
        
        return redirect()->route('landing');
    }

    /**
     * Helper method to get an empty error bag to prevent 'undefined variable' errors
     */
    private function getErrorBag()
    {
        // Create an empty MessageBag instance for errors
        return new \Illuminate\Support\MessageBag();
    }
}
