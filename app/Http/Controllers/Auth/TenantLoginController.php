<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TenantAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TenantLoginController extends Controller
{
    protected $authService;

    public function __construct(TenantAuthService $authService)
    {
        $this->authService = $authService;
        $this->middleware('guest')->except('logout');
    }    /**
     * Show the login form
     */
    public function showLoginForm()
    {
        return view('auth.tenant-login');
    }
    
    /**
     * Handle login request
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Create a direct API client connection
            $apiClient = new \App\Services\ApiClient();            \Illuminate\Support\Facades\Log::info('Attempting login', [
                'email' => $request->input('email'),
                'api_url' => config('services.api.url')
            ]);

            $response = $apiClient->post('/v1/tenant/auth/login', [
                'email' => $request->input('email'),
                'password' => $request->input('password')
            ]);

            \Illuminate\Support\Facades\Log::info('Login response', [
                'response' => $response
            ]);
            
            if (isset($response['body']['token'])) {
                // API call was successful, store the token and user data
                \Illuminate\Support\Facades\Session::put('tenant_token', $response['body']['token']);
                \Illuminate\Support\Facades\Session::put('tenant_data', $response['body']['tenant']);
                
                return redirect()->route('tenant.dashboard');
            }
            
            // If we got here, something went wrong
            $message = isset($response['body']['status']['message']) 
                ? $response['body']['status']['message'] 
                : (isset($response['body']['message']) 
                    ? $response['body']['message'] 
                    : 'Login failed. Please try again.');
                    
            return back()->withErrors(['email' => $message])->withInput();
            
            return redirect()->route('tenant.direct.dashboard');
        } catch (\Exception $e) {
            // Log the error for debugging
            \Illuminate\Support\Facades\Log::error('Login exception', [
                'email' => $request->input('email'),
                'error' => $e->getMessage()
            ]);
              return back()->withErrors(['email' => 'Login failed: ' . $e->getMessage()])->withInput();        }
    }
    
    /**
     * Handle logout request
     */
    public function logout()
    {
        // Just clear the session
        \Illuminate\Support\Facades\Session::forget('tenant_token');
        \Illuminate\Support\Facades\Session::forget('tenant_data');
        
        return redirect()->route('tenant.login');
    }
}
