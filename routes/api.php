<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Token verification endpoint
Route::post('/verify-token', function (Request $request) {
    $token = $request->input('token');
    
    if (empty($token)) {
        return response()->json([
            'success' => false,
            'message' => 'Token is required'
        ], 400);
    }
    
    $tenantAuthService = app(App\Services\TenantAuthService::class);
    $result = $tenantAuthService->verifyToken($token);
    
    if ($result['success']) {
        return response()->json([
            'success' => true,
            'tenant' => $result['tenant']
        ]);
    }
    
    return response()->json([
        'success' => false,
        'message' => $result['message']
    ], 401);
});

// Room listing API proxy
Route::get('/rooms', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        Log::info('Fetching rooms from API', [
            'endpoint' => "{$apiBaseUrl}/rooms",
            'query_params' => $request->query()
        ]);
        
        $response = Http::timeout(10)->get("{$apiBaseUrl}/rooms", $request->query());
        
        if ($response->successful()) {
            return $response->json();
        }
        
        // Log failed response
        Log::error('API returned error response for rooms', [
            'status' => $response->status(),
            'body' => $response->body()
        ]);
        
        // Return a user-friendly error
        return response()->json([
            'rooms' => [],
            'totalCount' => 0,
            'status' => [
                'message' => 'Unable to retrieve rooms at this time',
                'status' => 'error'
            ]
        ], 500);
    } catch (\Exception $e) {
        // Log the exception
        Log::error('Exception when calling rooms API', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        // Return a fallback response with sample data in development
        if (app()->environment('local', 'development')) {
            return response()->json([
                'rooms' => [
                    [
                        'roomId' => 1,
                        'name' => 'Marina',
                        'classificationId' => 2,
                        'rentalTypeId' => 1,
                        'rate' => 100000,
                        'capacity' => 4,
                        'description' => 'Twin bed male student room with fan',
                        'classification' => [
                            'classificationId' => 2,
                            'name' => 'laki_laki'
                        ],
                        'rentalType' => [
                            'rentalTypeId' => 1,
                            'name' => 'harian'
                        ],
                        'amenities' => [
                            [
                                'roomId' => 1,
                                'featureId' => 5,
                                'quantity' => 1,
                                'feature' => [
                                    'featureId' => 5,
                                    'name' => 'double_bed',
                                    'description' => 'Double bed'
                                ]
                            ],
                            [
                                'roomId' => 1,
                                'featureId' => 6,
                                'quantity' => 1,
                                'feature' => [
                                    'featureId' => 6,
                                    'name' => 'desk',
                                    'description' => 'Study desk'
                                ]
                            ]
                        ]
                    ],
                    [
                        'roomId' => 2,
                        'name' => 'A101',
                        'classificationId' => 1,
                        'rentalTypeId' => 2,
                        'rate' => 350000,
                        'capacity' => 2,
                        'description' => 'Twin bed female student room with AC',
                        'classification' => [
                            'classificationId' => 1,
                            'name' => 'perempuan'
                        ],
                        'rentalType' => [
                            'rentalTypeId' => 2,
                            'name' => 'bulanan'
                        ],
                        'amenities' => [
                            [
                                'roomId' => 2,
                                'featureId' => 1,
                                'quantity' => 1,
                                'feature' => [
                                    'featureId' => 1,
                                    'name' => 'AC',
                                    'description' => 'Air Conditioning'
                                ]
                            ]
                        ]
                    ]
                ],
                'totalCount' => 2,
                'status' => [
                    'message' => 'Development mode: Sample room data',
                    'status' => 'success'
                ]
            ]);
        }
        
        return response()->json([
            'rooms' => [],
            'totalCount' => 0,
            'error' => 'API connection error',
            'status' => [
                'message' => 'Unable to connect to room service',
                'status' => 'error'
            ]
        ], 500);
    }
});

// Room details API proxy
Route::get('/rooms/{id}', function ($id, Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $response = Http::get("{$apiBaseUrl}/rooms/{$id}", $request->query());
        return $response->json();
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to connect to API server',
            'message' => $e->getMessage(),
            'status' => [
                'message' => 'API connection error',
                'status' => 'error'
            ]
        ], 500);
    }
});

// GET bookings - Fetch user's bookings
Route::get('/bookings', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        // Get token from request
        $token = $request->bearerToken();
        
        // If token not in authorization header, check session
        if (!$token && session()->has('tenant_token')) {
            $token = session('tenant_token');
        }
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required',
                'status' => [
                    'message' => 'Authentication required',
                    'status' => 'error'
                ]
            ], 401);
        }
        
        // Make API request with authorization header
        $response = Http::withToken($token)
            ->withHeaders([
                'Accept' => 'application/json'
            ])
            ->get("{$apiBaseUrl}/bookings", $request->query());
        
        Log::info('Bookings API response', [
            'status' => $response->status(),
            'has_data' => !empty($response->json())
        ]);
        
        return $response->json();
    } catch (\Exception $e) {
        Log::error('Exception in bookings API', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'error' => 'Failed to connect to API server',
            'message' => $e->getMessage(),
            'status' => [
                'message' => 'API connection error',
                'status' => 'error'
            ]
        ], 500);
    }
});

// POST bookings - Create a new booking
Route::post('/bookings', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        // Get token from request
        $token = $request->bearerToken();
        
        // If token not in authorization header, check session
        if (!$token && session()->has('tenant_token')) {
            $token = session('tenant_token');
        }
        
        Log::info('Creating booking', [
            'has_token' => !empty($token),
            'tenant_id' => $request->input('tenantId'),
            'room_id' => $request->input('roomId'),
            'start_date' => $request->input('startDate'),
            'end_date' => $request->input('endDate'),
        ]);
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required',
                'status' => [
                    'message' => 'Authentication required',
                    'status' => 'error'
                ]
            ], 401);
        }
        
        // Format dates properly according to the API expectations
        $requestData = [
            'tenantId' => (int) $request->input('tenantId'),
            'roomId' => (int) $request->input('roomId'),
            'startDate' => $request->input('startDate'),
            'endDate' => $request->input('endDate')
        ];
        
        // Make sure dates are ISO 8601 format if not already
        if (!empty($requestData['startDate']) && !preg_match('/^\d{4}-\d{2}-\d{2}T/', $requestData['startDate'])) {
            $startDate = new \DateTime($requestData['startDate']);
            $requestData['startDate'] = $startDate->format('Y-m-d\TH:i:s.v\Z');
        }
        
        if (!empty($requestData['endDate']) && !preg_match('/^\d{4}-\d{2}-\d{2}T/', $requestData['endDate'])) {
            $endDate = new \DateTime($requestData['endDate']);
            $requestData['endDate'] = $endDate->format('Y-m-d\TH:i:s.v\Z');
        }
        
        Log::info('Formatted booking data', ['data' => $requestData]);
        
        // Make API request with token
        $response = Http::withToken($token)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])
            ->post("{$apiBaseUrl}/bookings", $requestData);
        
        Log::info('Booking API response', [
            'status' => $response->status(),
            'body' => $response->json()
        ]);
        
        if ($response->successful()) {
            return $response->json();
        } else {
            return response()->json([
                'error' => 'Booking API error',
                'message' => $response->json()['status']['message'] ?? 'Unknown error',
                'status' => [
                    'message' => 'Failed to create booking',
                    'status' => 'error'
                ]
            ], $response->status());
        }
    } catch (\Exception $e) {
        Log::error('Exception in booking API', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'error' => 'Failed to connect to API server',
            'message' => $e->getMessage(),
            'status' => [
                'message' => 'API connection error',
                'status' => 'error'
            ]
        ], 500);
    }
});

// GET booking details
Route::get('/bookings/{id}', function ($id, Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        // Get token from request
        $token = $request->bearerToken();
        
        // If token not in authorization header, check session
        if (!$token && session()->has('tenant_token')) {
            $token = session('tenant_token');
        }
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required',
                'status' => [
                    'message' => 'Authentication required',
                    'status' => 'error'
                ]
            ], 401);
        }
        
        // Make API request with authorization header
        $response = Http::withToken($token)
            ->withHeaders([
                'Accept' => 'application/json'
            ])
            ->get("{$apiBaseUrl}/bookings/{$id}");
        
        return $response->json();
    } catch (\Exception $e) {
        Log::error('Exception in booking details API', [
            'booking_id' => $id,
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to connect to API server',
            'message' => $e->getMessage(),
            'status' => [
                'message' => 'API connection error',
                'status' => 'error'
            ]
        ], 500);
    }
});
