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
    }

    /**
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

        $response = $this->authService->login(
            $request->input('email'),
            $request->input('password')
        );

        if (!$response['success']) {
            $message = $response['body']['message'] ?? 'Invalid credentials';
            return back()->withErrors(['email' => $message])->withInput();
        }

        return redirect()->intended(route('tenant.dashboard'));
    }

    /**
     * Handle logout request
     */
    public function logout()
    {
        $this->authService->logout();
        return redirect()->route('tenant.login');
    }
}
