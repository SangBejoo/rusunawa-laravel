<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class TestLoginController extends Controller
{
    /**
     * Simple test to see if we can render the login view
     */
    public function testLoginForm()
    {
        // Turn off any automatic redirects and see if we can render the view
        Log::info('TestLoginController::testLoginForm', [
            'session_id' => session()->getId(),
            'session_data' => session()->all(),
            'has_tenant_token' => Session::has('tenant_token'),
            'request_path' => request()->path(),
            'request_method' => request()->method()
        ]);
        
        // Force view rendering
        try {
            return response()->view('tenant.login');
        } catch (\Exception $e) {
            Log::error('Error rendering login view', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response($e->getMessage(), 500);
        }
    }
}
