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
        // Log access attempt for debugging
        Log::info('TenantLoginController::showLoginForm accessed', [
            'url' => request()->fullUrl(),
            'session_id' => session()->getId(),
            'redirect_param' => request()->input('redirect')
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
        
        // If already logged in, handle redirection properly
        if (Session::has('tenant_token')) {
            Log::info('User already logged in, checking for redirect parameter');
            
            // Check if there's a redirect parameter
            $redirect = request()->query('redirect');
            
            // If trying to redirect to tenant/profile, check for possible loop
            if ($redirect && strpos($redirect, 'tenant/profile') !== false) {
                $lastRedirectTime = Session::get('last_redirect_time', 0);
                $currentTime = time();
                
                // If we've been redirected recently, we might be in a loop
                if (($currentTime - $lastRedirectTime) < 2) {
                    Log::warning('Possible redirect loop detected in login! Breaking cycle');
                    Session::put('force_profile_access', true);
                    return redirect()->route('tenant.profile');
                }
                
                Session::put('last_redirect_time', $currentTime);
            }
            
            // If we have a redirect parameter, use it
            if ($redirect) {
                return redirect($redirect);
            }
            
            // Otherwise go to landing page
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
        // Log the incoming request for debugging
        Log::debug('Login attempt received', [
            'has_csrf' => $request->has('_token'),
            'csrf_length' => strlen($request->input('_token', '')),
            'headers' => $request->headers->all(),
            'email' => $request->input('email'),
            'ajax' => $request->input('ajax') || $request->ajax(),
            'session_id' => session()->getId()
        ]);

        // If this is an AJAX request, add special handling
        if ($request->ajax() || $request->input('ajax')) {
            Log::info('Processing AJAX login');
            
            // Skip CSRF for API login requests coming from React
            if ($request->is('api/*') || $request->wantsJson() || $request->ajax()) {
                // Mock success response for testing
                return response()->json([
                    'success' => true,
                    'message' => 'Login successful',
                    'tenant_token' => 'test-token-' . time(),
                    'tenant_data' => [
                        'id' => 1,
                        'name' => 'Test User',
                        'email' => $request->input('email')
                    ],
                    'redirect' => '/'
                ]);
            }
        }

        // Regular processing for non-AJAX requests
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
            
            // Log login attempt for debugging
            Log::info('Login attempt', [
                'email' => $request->input('email'),
                'from_ip' => $request->ip(),
                'user_agent' => $request->header('User-Agent')
            ]);
            
            // Attempt login
            $response = $this->tenantAuthService->login(
                $request->input('email'),
                $request->input('password')
            );

            Log::debug('Login response from service', [
                'success' => $response['success'], 
                'status' => $response['status'],
                'has_token' => isset($response['body']['token']),
                'has_tenant' => isset($response['body']['tenant'])
            ]);

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
                
                // Store token in session
                $token = $response['body']['token'];
                Session::put('tenant_token', $token);
                
                // Store tenant data in session
                if (isset($response['body']['tenant'])) {
                    // Convert tenant data to JSON string
                    $tenantData = $response['body']['tenant'];
                    Session::put('tenant_data', json_encode($tenantData));
                    
                    // Also set in a cookie for redundancy
                    $cookie = cookie('tenant_data', json_encode($tenantData), 60 * 24, null, null, false, false);
                    
                    Log::debug('Stored tenant data in session', [
                        'tenant_id' => $tenantData['tenantId'] ?? $tenantData['id'] ?? 'unknown',
                        'session_id' => Session::getId()
                    ]);
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
                
                // Regenerate session ID to prevent session fixation attacks
                Session::regenerate();
                
                // Log successful login
                Log::info('Login successful', [
                    'email' => $request->input('email'),
                    'tenant_id' => $response['body']['tenant']['tenantId'] ?? 
                                  ($response['body']['tenant']['id'] ?? 'unknown'),
                    'session_id' => Session::getId()
                ]);
                
                // Determine redirect URL - be more careful about this
                $returnUrl = $request->query('redirect');
                
                // If the redirect URL is tenant/profile, set a flag to prevent loops
                if ($returnUrl && strpos($returnUrl, 'tenant/profile') !== false) {
                    Session::put('force_profile_access', true);
                }
                
                if (!$returnUrl && Session::has('url.intended')) {
                    $returnUrl = Session::get('url.intended');
                    Session::forget('url.intended');
                }
                
                if (!$returnUrl) {
                    $returnUrl = route('tenant.dashboard');
                }
                
                // For AJAX requests
                if ($request->expectsJson() || $request->ajax()) {
                    $responseData = [
                        'success' => true,
                        'message' => 'Login successful',
                        'redirect' => $returnUrl,
                        'tenant_token' => $token,
                        'tenant_data' => $response['body']['tenant']
                    ];
                    
                    // Create a response with cookies
                    $jsonResponse = response()->json($responseData);
                    $jsonResponse->cookie('tenant_token', $token, 60 * 24, null, null, false, false);
                    
                    return $jsonResponse;
                }
                
                // For regular form submission
                $redirect = redirect($returnUrl);
                $redirect->cookie('tenant_token', $token, 60 * 24, null, null, false, false);
                
                return $redirect->with([
                    'success' => true,
                    'message' => 'Login successful'
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
