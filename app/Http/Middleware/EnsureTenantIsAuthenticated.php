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
            
            // Check for redirect loop - store requested URL in session
            if ($request->is('tenant/profile')) {
                $lastRequestedUrl = Session::get('last_requested_url');
                $lastRedirectTime = Session::get('last_redirect_time', 0);
                $currentTime = time();
                
                // If we just came from login page with a redirect back to profile, we might be in a loop
                if ($lastRequestedUrl === 'tenant/login' && ($currentTime - $lastRedirectTime) < 2) {
                    Log::warning('Possible redirect loop detected! Breaking the cycle.');
                    
                    // Force through to the profile page with a special flag
                    Session::put('force_profile_access', true);
                    return $next($request);
                }
                
                // Update last requested URL and time for tracking
                Session::put('last_requested_url', 'tenant/profile');
                Session::put('last_redirect_time', $currentTime);
            }
            
            // For debugging - log all authentication credentials
            Log::debug('Auth middleware checking authentication for: ' . $request->path(), [
                'session_id' => Session::getId(),
                'has_session_token' => Session::has('tenant_token') ? 'yes' : 'no',
                'has_cookie_token' => $request->cookie('tenant_token') ? 'yes' : 'no',
                'force_profile_access' => Session::get('force_profile_access') ? 'yes' : 'no'
            ]);
            
            // Break the redirect loop if forced access is granted
            if ($request->is('tenant/profile') && Session::get('force_profile_access')) {
                Log::info('Forcing access to profile page to break redirect loop');
                Session::forget('force_profile_access');
                return $next($request);
            }
            
            // Check both JWT token in localStorage via JavaScript and session token
            $token = Session::get('tenant_token');
            
            // Also check cookies as a fallback
            if (!$token) {
                $token = $request->cookie('tenant_token');
                if ($token) {
                    Log::debug('Using token from cookie instead of session');
                    Session::put('tenant_token', $token);
                }
            }
            
            // Try to get the token from the Authorization header as well (for API requests)
            if (!$token && $request->header('Authorization')) {
                $authHeader = $request->header('Authorization');
                if (strpos($authHeader, 'Bearer ') === 0) {
                    $token = substr($authHeader, 7);
                    Log::debug('Using token from Authorization header');
                    Session::put('tenant_token', $token);
                }
            }
            
            // If we still don't have a token, check for tenant_token parameter
            if (!$token && $request->has('tenant_token')) {
                $token = $request->input('tenant_token');
                Log::debug('Using token from request parameter');
                Session::put('tenant_token', $token);
            }
            
            // Final check if user is authenticated
            if (!$token || !$this->authService->isLoggedIn()) {
                Log::info('Auth middleware redirecting to login', [
                    'path' => $request->path(),
                    'is_ajax' => $request->ajax(),
                    'has_session_token' => Session::has('tenant_token') ? 'yes' : 'no',
                    'has_cookie_token' => $request->cookie('tenant_token') ? 'yes' : 'no'
                ]);
                
                // Store the intended URL to redirect back after login
                if (!$request->is('login*') && !$request->is('tenant/login*')) {
                    Session::put('url.intended', $request->fullUrl());
                    Log::debug('Stored intended URL: ' . $request->fullUrl());
                }
                
                // Update last requested URL for tracking redirect loops
                Session::put('last_requested_url', $request->path());
                Session::put('last_redirect_time', time());
                
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
