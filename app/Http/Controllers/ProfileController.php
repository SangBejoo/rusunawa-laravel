<?php

namespace App\Http\Controllers;

use App\Services\TenantAuthService;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    protected $tenantAuthService;
    protected $tenantService;

    public function __construct(TenantAuthService $tenantAuthService = null, TenantService $tenantService = null)
    {
        $this->tenantAuthService = $tenantAuthService ?? new TenantAuthService();
        $this->tenantService = $tenantService ?? new TenantService();
    }

    /**
     * Display the tenant's profile page.
     */
    public function show()
    {
        try {
            Log::info('ProfileController::show - Starting method');
            
            // Get tenant data from the session
            $tenantData = Session::get('tenant_data');
            Log::info('Retrieved tenant data from session', ['raw_data' => $tenantData]);
            
            if (!$tenantData) {
                Log::warning('No tenant data found in session');
                return redirect()->route('tenant.login')
                    ->with('error', 'Your session has expired. Please login again.');
            }
            
            // Parse tenant data
            $tenant = [];
            try {
                if (is_string($tenantData)) {
                    $tenant = json_decode($tenantData, true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        Log::error('JSON decode error', ['error' => json_last_error_msg()]);
                        $tenant = ['name' => 'JSON Error', 'email' => 'error@example.com'];
                    }
                } else {
                    $tenant = $tenantData;
                }
                
                Log::info('Tenant data parsed', ['tenant' => $tenant]);
            } catch (\Exception $e) {
                Log::error('Failed to parse tenant data from session', [
                    'error' => $e->getMessage(),
                    'tenant_data' => $tenantData
                ]);
                
                // Create minimal tenant data to avoid template errors
                $tenant = [
                    'name' => 'Error loading profile',
                    'email' => 'Please try again later'
                ];
            }
            
            // Add debug timestamp
            $tenant['_debug_timestamp'] = now()->toDateTimeString();
            
            Log::info('Rendering profile view with tenant data', [
                'tenant_keys' => is_array($tenant) ? array_keys($tenant) : 'not_array'
            ]);
            
            return view('tenant.profile', compact('tenant'));
            
        } catch (\Exception $e) {
            Log::error('Exception in ProfileController::show', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return a view with error information rather than redirecting
            return view('tenant.profile', [
                'tenant' => [
                    'name' => 'Error',
                    'email' => 'An unexpected error occurred',
                    'error_message' => $e->getMessage(),
                    '_debug_timestamp' => now()->toDateTimeString()
                ]
            ]);
        }
    }

    /**
     * Update the tenant's profile information.
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
        
        $tenant = $this->tenantAuthService->getTenantData();
        
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
     * Update the tenant's home location.
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
        
        $tenant = $this->tenantAuthService->getTenantData();
        
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
     * Update tenant's NIM.
     */
    public function updateNIM(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nim' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        $tenant = $this->tenantAuthService->getTenantData();
        
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
