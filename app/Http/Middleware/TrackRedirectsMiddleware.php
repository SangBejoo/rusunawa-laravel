<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class TrackRedirectsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Log the incoming request
        Log::info('TrackRedirectsMiddleware: Request before handling', [
            'path' => $request->path(),
            'method' => $request->method(),
            'session_id' => session()->getId(),
            'has_tenant_token' => session()->has('tenant_token')
        ]);
        
        // Process the request
        $response = $next($request);
        
        // Check if the response is a redirect
        if ($response instanceof RedirectResponse) {
            Log::warning('TrackRedirectsMiddleware: Redirect detected', [
                'from' => $request->path(),
                'to' => $response->getTargetUrl(),
                'status' => $response->getStatusCode()
            ]);
        }
        
        return $response;
    }
}
