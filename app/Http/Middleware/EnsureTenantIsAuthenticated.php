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
            // Check if user is logged in
            if (!$this->authService->isLoggedIn()) {
                return redirect()->route('login');
            }
            
            return $next($request);
        } catch (\Exception $e) {
            // Log the error but don't output it directly
            Log::error('Authentication middleware error', [
                'error' => $e->getMessage()
            ]);
            
            // Safely redirect
            return redirect()->route('login');
        }
    }
}
