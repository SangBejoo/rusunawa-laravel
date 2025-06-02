<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TenantAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TenantRegisterController extends Controller
{
    protected $tenantAuthService;

    public function __construct(TenantAuthService $tenantAuthService)
    {
        $this->tenantAuthService = $tenantAuthService;
    }

    /**
     * Show the registration form
     */
    public function showRegistrationForm()
    {
        return view('tenant.register');
    }

    /**
     * Handle a registration request for the application.
     */
    public function register(Request $request)
    {        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:8',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'gender' => 'required|string|in:L,P',
            'tenant_type' => 'required|string|in:mahasiswa,non-mahasiswa',
            'nim' => 'required_if:tenant_type,mahasiswa|string|max:255',
            'home_latitude' => 'required|numeric',
            'home_longitude' => 'required|numeric',
            'type_id' => 'required|integer|in:1,2',
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

        try {            $response = $this->tenantAuthService->register([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'password' => $request->input('password'),
                'phone' => $request->input('phone'),
                'address' => $request->input('address'),
                'gender' => $request->input('gender'),
                'tenant_type' => $request->input('tenant_type'),
                'nim' => $request->input('nim'),
                'home_latitude' => $request->input('home_latitude'),
                'home_longitude' => $request->input('home_longitude'),
                'type_id' => $request->input('type_id'),
            ]);

            if ($response['success']) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Registration successful! Please login.',
                        'redirect' => route('login')
                    ]);
                }
                
                return redirect()->route('login')
                    ->with('status', 'Registration successful! Please login.');
            } else {
                Log::warning('Registration failed', [
                    'email' => $request->input('email'),
                    'status' => $response['status'],
                    'message' => $response['body']['message'] ?? 'Unknown error'
                ]);
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => $response['body']['message'] ?? 'Registration failed'
                    ], $response['status']);
                }
                
                return back()
                    ->withInput($request->except('password', 'password_confirmation'))
                    ->withErrors(['email' => $response['body']['message'] ?? 'Registration failed']);
            }
        } catch (\Exception $e) {
            Log::error('Exception during registration', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'An error occurred during registration'
                ], 500);
            }
            
            return back()
                ->withInput($request->except('password', 'password_confirmation'))
                ->withErrors(['email' => 'An error occurred during registration']);
        }
    }
}
