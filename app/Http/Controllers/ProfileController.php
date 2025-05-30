<?php

namespace App\Http\Controllers;

use App\Services\TenantAuthService;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    protected $authService;
    protected $tenantService;

    public function __construct(TenantAuthService $authService, TenantService $tenantService)
    {
        $this->authService = $authService;
        $this->tenantService = $tenantService;
        $this->middleware('tenant.auth');
    }

    /**
     * Display tenant profile
     */
    public function show()
    {
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }
        
        return view('tenant.profile', [
            'tenant' => $tenant
        ]);
    }

    /**
     * Update tenant profile
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }
        
        $data = [
            'tenant_id' => $tenant['tenant_id'],
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
        ];
        
        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }
        
        $response = $this->tenantService->updateTenant($data);
        
        if (!$response['success']) {
            return back()->with('error', $response['body']['message'] ?? 'Failed to update profile.');
        }
        
        // Update session data with new values
        $tenant['user']['full_name'] = $data['full_name'];
        $tenant['user']['email'] = $data['email'];
        $tenant['phone'] = $data['phone'];
        $tenant['address'] = $data['address'];
        
        // Store updated tenant data in session
        session()->put('tenant_data', $tenant);
        
        return back()->with('status', 'Profile updated successfully.');
    }

    /**
     * Update tenant location coordinates
     */
    public function updateLocation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'home_latitude' => 'required|numeric',
            'home_longitude' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }
        
        $response = $this->tenantService->updateTenantLocation(
            $tenant['tenant_id'],
            $request->home_latitude,
            $request->home_longitude
        );
        
        if (!$response['success']) {
            return back()->with('error', $response['body']['message'] ?? 'Failed to update location.');
        }
        
        // Update session data
        $tenant['home_latitude'] = $request->home_latitude;
        $tenant['home_longitude'] = $request->home_longitude;
        
        if (isset($response['body']['tenant']['distance_to_campus'])) {
            $tenant['distance_to_campus'] = $response['body']['tenant']['distance_to_campus'];
        }
        
        // Store updated tenant data in session
        session()->put('tenant_data', $tenant);
        
        return back()->with('status', 'Location updated successfully.');
    }

    /**
     * Update tenant NIM (Student ID)
     */
    public function updateNIM(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nim' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }
        
        $response = $this->tenantService->updateTenantNIM(
            $tenant['tenant_id'],
            $request->nim
        );
        
        if (!$response['success']) {
            return back()->with('error', $response['body']['message'] ?? 'Failed to update Student ID.');
        }
        
        // Update session data
        $tenant['nim'] = $request->nim;
        
        // Store updated tenant data in session
        session()->put('tenant_data', $tenant);
        
        return back()->with('status', 'Student ID updated successfully.');
    }
}
