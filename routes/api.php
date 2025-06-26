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

// Direct proxy to Go backend authentication API
Route::post('/direct-login', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        Log::info('Direct login attempt', [
            'email' => $request->input('email'),
            'api_url' => "{$apiBaseUrl}/tenant/auth/login"
        ]);
        
        // Forward the exact credentials without modification
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ])->post("{$apiBaseUrl}/tenant/auth/login", [
            'email' => $request->input('email'),
            'password' => $request->input('password')
        ]);
        
        $responseData = $response->json();
        Log::info('Direct login response', [
            'status' => $response->status(),
            'success' => isset($responseData['token']),
            'has_tenant' => isset($responseData['tenant'])
        ]);
        
        // Return the exact response from the backend
        return response()->json($responseData, $response->status());
    } catch (\Exception $e) {
        Log::error('Exception in direct login API', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'error' => 'API connection error',
            'message' => $e->getMessage(),
            'status' => [
                'message' => 'Failed to connect to authentication service',
                'status' => 'error'
            ]
        ], 500);
    }
});

// POST bookings - Create a new booking with error handling for gender mismatch
Route::post('/bookings', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        // Get token from request - check multiple places
        $token = $request->bearerToken();
        
        // Check header directly if bearer token not found
        if (!$token && $request->header('Authorization')) {
            $authHeader = $request->header('Authorization');
            if (strpos($authHeader, 'Bearer ') === 0) {
                $token = substr($authHeader, 7);
            } else {
                $token = $authHeader;
            }
        }
        
        // If not in headers, try from request body
        if (!$token && $request->has('token')) {
            $token = $request->input('token');
            Log::info('Found token in request body');
        }
        
        // Try from session as last resort
        if (!$token && session()->has('tenant_token')) {
            $token = session('tenant_token');
            Log::info('Found token in session');
        }
        
        Log::info('Booking request received', [
            'has_token' => !empty($token),
            'token_length' => $token ? strlen($token) : 0,
            'auth_header' => $request->header('Authorization'),
            'tenant_id' => $request->input('tenantId'),
            'room_id' => $request->input('roomId')
        ]);
        
        if (!$token) {
            return response()->json([
                'success' => false,
                'error' => 'Authentication required',
                'message' => 'Please login to book a room',
                'status' => [
                    'message' => 'Authentication required',
                    'status' => 'error'
                ]
            ], 401);
        }
        
        // Format the request properly for the Go backend
        $bookingData = [
            'tenantId' => (int) $request->input('tenantId'),
            'roomId' => (int) $request->input('roomId'),
            'startDate' => $request->input('startDate'),
            'endDate' => $request->input('endDate')
        ];
        
        // Forward the request directly to Go backend
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Authorization' => "Bearer {$token}"
        ])->post("{$apiBaseUrl}/bookings", $bookingData);
        
        $responseData = $response->json();
        Log::info('Booking API response', [
            'status' => $response->status(),
            'success' => $response->successful(),
            'has_error' => isset($responseData['status']['message'])
        ]);
        
        // Return the response directly
        return response()->json($responseData, $response->status());
    } catch (\Exception $e) {
        Log::error('Exception in booking API', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'error' => 'Error processing booking',
            'message' => $e->getMessage(),
            'status' => [
                'message' => 'Failed to process booking request',
                'status' => 'error'
            ]
        ], 500);
    }
})->withoutMiddleware(['web', 'csrf'])->middleware('api');

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

// Payment history and details endpoints
Route::get('/payments/history', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $token = $request->bearerToken() ?? session('tenant_token');
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required'
            ], 401);
        }
        
        $response = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/json'])
            ->get("{$apiBaseUrl}/payments", $request->query());
        
        return $response->json();
    } catch (\Exception $e) {
        Log::error('Exception in payment history API', [
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to connect to API server',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::get('/payments/{id}', function ($id, Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $token = $request->bearerToken() ?? session('tenant_token');
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required'
            ], 401);
        }
        
        $response = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/json'])
            ->get("{$apiBaseUrl}/payments/{$id}");
        
        return $response->json();
    } catch (\Exception $e) {
        Log::error('Exception in payment details API', [
            'payment_id' => $id,
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to connect to API server',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Invoice endpoints
Route::get('/invoices', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $token = $request->bearerToken() ?? session('tenant_token');
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required'
            ], 401);
        }
        
        $response = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/json'])
            ->get("{$apiBaseUrl}/invoices", $request->query());
        
        return $response->json();
    } catch (\Exception $e) {
        Log::error('Exception in invoices API', [
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to connect to API server',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::get('/invoices/{id}', function ($id, Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $token = $request->bearerToken() ?? session('tenant_token');
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required'
            ], 401);
        }
        
        $response = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/json'])
            ->get("{$apiBaseUrl}/invoices/{$id}");
        
        return $response->json();
    } catch (\Exception $e) {
        Log::error('Exception in invoice details API', [
            'invoice_id' => $id,
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to connect to API server',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Payment processing endpoints
Route::post('/payments/manual', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $token = $request->bearerToken() ?? session('tenant_token');
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required'
            ], 401);
        }
        
        $response = Http::withToken($token)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])
            ->post("{$apiBaseUrl}/payments/manual", $request->all());
        
        return response()->json($response->json(), $response->status());
    } catch (\Exception $e) {
        Log::error('Exception in manual payment API', [
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to process payment',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::post('/payments/midtrans', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $token = $request->bearerToken() ?? session('tenant_token');
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required'
            ], 401);
        }
        
        $response = Http::withToken($token)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])
            ->post("{$apiBaseUrl}/payments/midtrans", $request->all());
        
        return response()->json($response->json(), $response->status());
    } catch (\Exception $e) {
        Log::error('Exception in midtrans payment API', [
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to process payment',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Documents endpoints
Route::get('/documents', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $token = $request->bearerToken() ?? session('tenant_token');
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required'
            ], 401);
        }
        
        $response = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/json'])
            ->get("{$apiBaseUrl}/tenant/documents");
        
        return $response->json();
    } catch (\Exception $e) {
        Log::error('Exception in documents API', [
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to connect to API server',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::post('/documents/upload', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $token = $request->bearerToken() ?? session('tenant_token');
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required'
            ], 401);
        }
        
        // Handle file upload
        $response = Http::withToken($token)
            ->attach(
                'document', 
                $request->file('document')->get(),
                $request->file('document')->getClientOriginalName()
            )
            ->post("{$apiBaseUrl}/tenant/documents", [
                'type' => $request->input('type'),
                'description' => $request->input('description')
            ]);
        
        return response()->json($response->json(), $response->status());
    } catch (\Exception $e) {
        Log::error('Exception in document upload API', [
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to upload document',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Issues endpoints
Route::get('/issues', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $token = $request->bearerToken() ?? session('tenant_token');
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required'
            ], 401);
        }
        
        $response = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/json'])
            ->get("{$apiBaseUrl}/issues", $request->query());
        
        return $response->json();
    } catch (\Exception $e) {
        Log::error('Exception in issues API', [
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to connect to API server',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::post('/issues', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $token = $request->bearerToken() ?? session('tenant_token');
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required'
            ], 401);
        }
        
        $response = Http::withToken($token)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])
            ->post("{$apiBaseUrl}/issues", $request->all());
        
        return response()->json($response->json(), $response->status());
    } catch (\Exception $e) {
        Log::error('Exception in create issue API', [
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to create issue',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::get('/issues/{id}', function ($id, Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $token = $request->bearerToken() ?? session('tenant_token');
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required'
            ], 401);
        }
        
        $response = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/json'])
            ->get("{$apiBaseUrl}/issues/{$id}");
        
        return $response->json();
    } catch (\Exception $e) {
        Log::error('Exception in issue details API', [
            'issue_id' => $id,
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to connect to API server',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Check-in endpoint
Route::post('/bookings/{id}/checkin', function ($id, Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $token = $request->bearerToken() ?? session('tenant_token');
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required'
            ], 401);
        }
        
        $response = Http::withToken($token)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])
            ->post("{$apiBaseUrl}/bookings/{$id}/checkin", $request->all());
        
        return response()->json($response->json(), $response->status());
    } catch (\Exception $e) {
        Log::error('Exception in check-in API', [
            'booking_id' => $id,
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to process check-in',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Tenant profile endpoints (moving from web.php to api.php for consistency)
Route::get('/tenant/profile', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $token = $request->bearerToken() ?? session('tenant_token');
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required'
            ], 401);
        }
        
        $response = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/json'])
            ->get("{$apiBaseUrl}/tenant/profile");
        
        return $response->json();
    } catch (\Exception $e) {
        Log::error('Exception in tenant profile API', [
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to connect to API server',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::put('/tenant/profile', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $token = $request->bearerToken() ?? session('tenant_token');
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication token is required'
            ], 401);
        }
        
        $response = Http::withToken($token)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])
            ->put("{$apiBaseUrl}/tenant/profile", $request->all());
        
        return response()->json($response->json(), $response->status());
    } catch (\Exception $e) {
        Log::error('Exception in update tenant profile API', [
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to update profile',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Authentication endpoints
Route::post('/tenant/register', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ])->post("{$apiBaseUrl}/tenant/auth/register", $request->all());
        
        return response()->json($response->json(), $response->status());
    } catch (\Exception $e) {
        Log::error('Exception in tenant register API', [
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to register',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::post('/tenant/forgot-password', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ])->post("{$apiBaseUrl}/tenant/auth/forgot-password", $request->all());
        
        return response()->json($response->json(), $response->status());
    } catch (\Exception $e) {
        Log::error('Exception in forgot password API', [
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to process forgot password',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::post('/tenant/reset-password', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ])->post("{$apiBaseUrl}/tenant/auth/reset-password", $request->all());
        
        return response()->json($response->json(), $response->status());
    } catch (\Exception $e) {
        Log::error('Exception in reset password API', [
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to reset password',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::post('/tenant/verify-email', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ])->post("{$apiBaseUrl}/tenant/auth/verify-email", $request->all());
        
        return response()->json($response->json(), $response->status());
    } catch (\Exception $e) {
        Log::error('Exception in email verification API', [
            'message' => $e->getMessage()
        ]);
        
        return response()->json([
            'error' => 'Failed to verify email',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Pastikan semua endpoint API mengarah ke backend service, tidak perlu fallback SPA di sini
