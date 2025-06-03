<?php

namespace App\Http\Middleware;

use App\Services\TenantAuthService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class EnsureTenantIsAuthenticated
{
    protected $authService;

    public function __construct(TenantAuthService $authService = null)
    {
        $this->authService = $authService ?? new \App\Services\TenantAuthService();
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            // Skip auth check for specific routes
            if ($request->is('tenant/login*') || $request->is('tenant/register*') || $request->is('tenant/password/*')) {
                Log::debug('Skipping auth check for excluded route: ' . $request->path());
                return $next($request);
            }
            
            Log::debug('Auth middleware checking authentication for: ' . $request->path(), [
                'session_id' => Session::getId(),
                'has_session_token' => Session::has('tenant_token'),
                'has_cookie_token' => $request->cookie('tenant_token') ? 'yes' : 'no'
            ]);
            
            // First check if auth_token was passed from frontend
            if ($request->has('auth_token')) {
                $authToken = $request->input('auth_token');
                Log::debug('Using auth_token from request parameter');
                
                // Validate the token with API
                $verifyResponse = $this->authService->verifyToken($authToken);
                
                if ($verifyResponse['success']) {
                    Log::debug('Token from request parameter is valid');
                    // Store the token in session
                    session(['tenant_token' => $authToken]);
                    
                    if ($request->has('tenant_data')) {
                        session(['tenant_data' => $request->input('tenant_data')]);
                    }
                }
            }
            
            // Check session for token, then cookie as fallback
            $token = Session::get('tenant_token');
            if (!$token) {
                $token = $request->cookie('tenant_token');
                if ($token) {
                    Log::debug('Using token from cookie instead of session');
                    Session::put('tenant_token', $token);
                }
            }
            
            // Final check if user is authenticated
            if (!$this->authService->isLoggedIn()) {
                Log::info('Auth middleware redirecting to login', [
                    'path' => $request->path(),
                    'is_ajax' => $request->ajax(),
                    'has_session_token' => Session::has('tenant_token'),
                    'has_cookie_token' => $request->cookie('tenant_token') ? 'yes' : 'no'
                ]);
                
                // Store the intended URL to redirect back after login
                if (!$request->is('login*') && !$request->is('tenant/login*')) {
                    Session::put('url.intended', $request->fullUrl());
                    Log::debug('Stored intended URL: ' . $request->fullUrl());
                }
                
                if ($request->ajax() || $request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthenticated',
                        'redirect' => route('tenant.login', ['redirect' => $request->fullUrl()])
                    ], 401);
                }
                
                return redirect()->route('tenant.login', ['redirect' => $request->fullUrl()]);
            }
            
            Log::debug('Auth middleware: User authenticated successfully for: ' . $request->path());
            return $next($request);
            
        } catch (\Exception $e) {
            // Log the error but don't output it directly
            Log::error('Authentication middleware error', [
                'error' => $e->getMessage(),
                'path' => $request->path()
            ]);
            
            // Safely redirect
            if ($request->ajax() || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication error',
                    'redirect' => route('tenant.login')
                ], 500);
            }
            
            return redirect()->route('tenant.login');
        }
    }
}
