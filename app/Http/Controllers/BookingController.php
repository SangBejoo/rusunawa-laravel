<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\TenantAuthService;

class BookingController extends Controller
{
    protected $apiBaseUrl;
    protected $tenantAuthService;
    
    public function __construct(TenantAuthService $tenantAuthService = null)
    {
        $this->apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
        $this->tenantAuthService = $tenantAuthService ?? new TenantAuthService();
        
        // Require tenant authentication for booking actions
        $this->middleware('auth:tenant');
    }
    
    /**
     * Store a newly created booking in the API.
     */
    public function store(Request $request)
    {
        try {            // Validate the request
            $validated = $request->validate([
                'room_id' => 'required|numeric',
                'check_in' => 'required|date|after:yesterday',
                'check_out' => 'required|date|after:check_in',
                'guests' => 'required|numeric|min:1',
                'notes' => 'nullable|string|max:500',
                'rental_type' => 'nullable|string|in:daily,monthly',
            ]);
            
            // Get tenant data
            $tenant = $this->tenantAuthService->getTenantData();
            
            if (!$tenant) {
                return redirect()->back()->with('error', 'You must be logged in to make a booking.');
            }
            
            // Get tenant ID
            $tenantId = $tenant['tenant_id'] ?? $tenant['tenant']['id'] ?? null;
            
            if (!$tenantId) {
                Log::error('Missing tenant ID in session data', [
                    'tenant_data' => $tenant
                ]);
                return redirect()->back()->with('error', 'Could not identify your account information. Please try logging in again.');
            }
              // Prepare booking data for API
            $bookingData = [
                'tenantId' => $tenantId,
                'roomId' => $validated['room_id'],
                'startDate' => $validated['check_in'],
                'endDate' => $validated['check_out'],
                'guests' => $validated['guests'],
                'notes' => $validated['notes'] ?? '',
                'rentalType' => $validated['rental_type'] ?? 'daily',
            ];
            
            Log::info('Submitting booking request', [
                'data' => $bookingData
            ]);
            
            // Get tenant token for authentication
            $token = session('tenant_token');
            
            // Send booking request to API
            $response = Http::withToken($token)
                ->post("{$this->apiBaseUrl}/bookings", $bookingData);
            
            $data = $response->json();
            
            Log::info('Booking API response', [
                'status_code' => $response->status(),
                'data' => $data
            ]);
            
            // Check response
            if ($response->successful() && isset($data['booking']) && isset($data['status']['status']) && $data['status']['status'] === 'success') {
                // Redirect to booking confirmation page
                return redirect()->route('bookings.confirmation', ['id' => $data['booking']['bookingId']])
                    ->with('success', 'Your booking request has been submitted successfully!');
            } else {
                // Handle error
                $errorMessage = $data['status']['message'] ?? 'Failed to process booking. Please try again later.';
                return redirect()->back()->with('error', $errorMessage);
            }
        } catch (\Exception $e) {
            Log::error('Exception while creating booking', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()->with('error', 'An error occurred: ' . $e->getMessage());
        }
    }
    
    /**
     * Display booking confirmation page.
     */
    public function confirmation($id)
    {
        try {
            // Fetch booking details from API
            $token = session('tenant_token');
            $response = Http::withToken($token)
                ->get("{$this->apiBaseUrl}/bookings/{$id}");
            
            $data = $response->json();
            
            // Check response
            if ($response->successful() && isset($data['booking'])) {
                return view('bookings.confirmation', [
                    'booking' => $data['booking']
                ]);
            } else {
                return view('error', [
                    'message' => 'Failed to load booking details',
                    'details' => $data['status']['message'] ?? 'Booking information not found'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception fetching booking confirmation', [
                'booking_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return view('error', [
                'message' => 'An error occurred while loading your booking details',
                'details' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Display a listing of the tenant's bookings.
     */
    public function index()
    {
        try {
            // Get tenant token
            $token = session('tenant_token');
            
            // Fetch tenant's bookings from API
            $response = Http::withToken($token)
                ->get("{$this->apiBaseUrl}/tenant/bookings");
            
            $data = $response->json();
            
            // Check response
            if ($response->successful() && isset($data['bookings'])) {
                return view('bookings.index', [
                    'bookings' => $data['bookings'],
                    'active' => 'bookings'
                ]);
            } else {
                return view('bookings.index', [
                    'bookings' => [],
                    'error' => $data['status']['message'] ?? 'Failed to retrieve bookings',
                    'active' => 'bookings'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception fetching tenant bookings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return view('bookings.index', [
                'bookings' => [],
                'error' => 'An error occurred while retrieving your bookings: ' . $e->getMessage(),
                'active' => 'bookings'
            ]);
        }
    }
}
