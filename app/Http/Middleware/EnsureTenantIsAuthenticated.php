<?php

namespace App\Http\Middleware;

use App\Services\TenantAuthService;
use Closure;
use Illuminate\Http\Request;

class EnsureTenantIsAuthenticated
{
    protected $authService;

    public function __construct(TenantAuthService $authService)
    {
        $this->authService = $authService;
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
        // First check if we have a token
        if (!$this->authService->isLoggedIn()) {
            return redirect()->route('tenant.login');
        }

        // Verify token validity with API
        $response = $this->authService->verifyToken();
        
        if (!$response['success']) {
            // Token is invalid or expired, logout and redirect
            $this->authService->logout();
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }

        return $next($request);
    }
}
