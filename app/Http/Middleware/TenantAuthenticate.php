<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use App\Services\TenantAuthService;

class TenantAuthenticate
{
    protected $tenantAuthService;

    public function __construct(TenantAuthService $tenantAuthService)
    {
        $this->tenantAuthService = $tenantAuthService;
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
        // Check if tenant token exists in session
        if (!Session::has('tenant_token')) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);            }
            
            return redirect()->route('tenant.login');
        }

        // Verify token with API
        $response = $this->tenantAuthService->verifyToken();
        
        if (!$response['success']) {
            // Invalid or expired token, clear session and redirect to login
            Session::forget('tenant_token');
            Session::forget('tenant_data');
            
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session expired. Please log in again.'
                ], 401);
            }            
            return redirect()->route('tenant.login')
                ->with('error', 'Session expired. Please log in again.');
        }

        return $next($request);
    }
}
