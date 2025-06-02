<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TenantAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TenantPasswordController extends Controller
{
    protected $authService;

    public function __construct(TenantAuthService $authService)
    {
        $this->authService = $authService;
        $this->middleware('guest');
    }

    /**
     * Show the form to request a password reset link
     */
    public function showLinkRequestForm()
    {
        return view('auth.tenant-password-email');
    }

    /**
     * Send a password reset link
     */
    public function sendResetLinkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $response = $this->authService->forgotPassword($request->email);

        if (!$response['success']) {
            $message = $response['body']['message'] ?? 'Unable to send password reset link';
            return back()->withErrors(['email' => $message])->withInput();
        }

        return back()->with('status', 'Password reset link has been sent to your email address.');
    }

    /**
     * Show the password reset form
     */
    public function showResetForm(Request $request, $token)
    {
        return view('auth.tenant-password-reset', ['token' => $token, 'email' => $request->email]);
    }

    /**
     * Reset the password
     */
    public function reset(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $response = $this->authService->resetPassword($request->token, $request->password);

        if (!$response['success']) {
            $message = $response['body']['message'] ?? 'Unable to reset password';
            return back()->withErrors(['email' => $message])->withInput();
        }

        return redirect()->route('tenant.login')->with('status', 'Your password has been reset. You can now login with your new password.');
    }
}
