<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use App\Services\TenantAuthService;

class TenantAuthMiddleware
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
        $token = Session::get('tenant_token');
        
        // Double-check that tenant_data is also present
        $tenantData = Session::get('tenant_data');
        
        if (!$token || !$tenantData) {
            Log::warning('TenantAuthMiddleware: Missing token or tenant data', [
                'has_token' => !empty($token),
                'has_tenant_data' => !empty($tenantData),
                'session_id' => session()->getId()
            ]);
            
            // Clear any residual session data
            Session::forget('tenant_token');
            Session::forget('tenant_data');
            
            // Redirect to login with intended URL
            return redirect()->route('tenant.login', ['redirect' => $request->url()]);
        }
        
        // Verify token with API if possible
        try {
            $verifyResponse = $this->tenantAuthService->verifyToken($token);
            
            if (!$verifyResponse['success']) {
                Log::warning('TenantAuthMiddleware: Token verification failed', [
                    'status' => $verifyResponse['status'],
                    'message' => $verifyResponse['body']['status']['message'] ?? 'Unknown error'
                ]);
                
                // Clear invalid session data
                Session::forget('tenant_token');
                Session::forget('tenant_data');
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Authentication failed. Please log in again.'
                    ], 401);
                }
                
                return redirect()->route('tenant.login', ['redirect' => $request->url()]);
            }
        } catch (\Exception $e) {
            // If verification fails due to an exception, continue with the request
            // We already checked for token existence, so this is just an extra check
            Log::error('TenantAuthMiddleware: Exception during token verification', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
        
        return $next($request);
    }
}
