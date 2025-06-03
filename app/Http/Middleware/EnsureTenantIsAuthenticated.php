<?php

namespace App\Http\Middleware;

use App\Services\TenantAuthService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EnsureTenantIsAuthenticated
{
    protected $authService;

    public function __construct(TenantAuthService $authService = null)
    {
        $this->authService = $authService ?? new \App\Services\TenantAuthService();
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            // Skip auth check for specific routes
            if ($request->is('tenant/login*') || $request->is('tenant/register*') || $request->is('tenant/password/*')) {
                return $next($request);
            }
            
            // Check if user is logged in
            if (!$this->authService->isLoggedIn()) {
                Log::info('Auth middleware redirecting to login', [
                    'path' => $request->path(),
                    'is_ajax' => $request->ajax(),
                    'has_session_token' => Session::has('tenant_token')
                ]);
                
                // Store the intended URL to redirect back after login
                if (!$request->is('login*') && !$request->is('tenant/login*')) {
                    Session::put('url.intended', $request->fullUrl());
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
