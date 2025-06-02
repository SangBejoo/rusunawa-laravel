<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TenantAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TenantPasswordController extends Controller
{
    protected $tenantAuthService;

    public function __construct(TenantAuthService $tenantAuthService)
    {
        $this->tenantAuthService = $tenantAuthService;
    }

    /**
     * Show form to request a password reset link.
     */
    public function showLinkRequestForm()
    {
        return view('tenant.passwords.email');
    }

    /**
     * Send a reset link to the given user.
     */
    public function sendResetLinkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }
            
            return back()
                ->withErrors($validator)
                ->withInput($request->only('email'));
        }

        try {
            $response = $this->tenantAuthService->forgotPassword($request->input('email'));

            if ($response['success']) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Password reset link has been sent to your email'
                    ]);
                }
                
                return back()
                    ->with('status', 'Password reset link has been sent to your email');
            } else {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => $response['body']['message'] ?? 'Unable to send reset link'
                    ], $response['status']);
                }
                
                return back()
                    ->withInput($request->only('email'))
                    ->withErrors(['email' => $response['body']['message'] ?? 'Unable to send reset link']);
            }
        } catch (\Exception $e) {
            Log::error('Exception during password reset request', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'An error occurred while processing your request'
                ], 500);
            }
            
            return back()
                ->withInput($request->only('email'))
                ->withErrors(['email' => 'An error occurred while processing your request']);
        }
    }

    /**
     * Display the password reset view for the given token.
     */
    public function showResetForm(Request $request, $token = null)
    {
        if (is_null($token)) {
            return redirect()->route('tenant.password.request');
        }

        return view('tenant.passwords.reset')->with(
            ['token' => $token, 'email' => $request->email]
        );
    }

    /**
     * Reset the given user's password.
     */
    public function reset(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }
            
            return back()
                ->withErrors($validator)
                ->withInput($request->except('password', 'password_confirmation'));
        }

        try {
            $response = $this->tenantAuthService->resetPassword(
                $request->input('token'),
                $request->input('password')
            );

            if ($response['success']) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Password has been reset successfully',
                        'redirect' => route('login')
                    ]);
                }
                
                return redirect()->route('login')
                    ->with('status', 'Password has been reset successfully');
            } else {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => $response['body']['message'] ?? 'Unable to reset password'
                    ], $response['status']);
                }
                
                return back()
                    ->withInput($request->except('password', 'password_confirmation'))
                    ->withErrors(['email' => $response['body']['message'] ?? 'Unable to reset password']);
            }
        } catch (\Exception $e) {
            Log::error('Exception during password reset', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'An error occurred while resetting your password'
                ], 500);
            }
            
            return back()
                ->withInput($request->except('password', 'password_confirmation'))
                ->withErrors(['email' => 'An error occurred while resetting your password']);
        }
    }
}
