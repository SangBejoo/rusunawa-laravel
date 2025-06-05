<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class RoomsController extends Controller
{
    protected $apiBaseUrl;
    protected $cacheEnabled;
    protected $cacheTTL;

    public function __construct()
    {
        $this->apiBaseUrl = env('API_BASE_URL', 'http://localhost:8003/v1');
        $this->cacheEnabled = env('ENABLE_API_CACHE', true);
        $this->cacheTTL = env('API_CACHE_TTL', 60); // Cache for 60 minutes by default
    }

    /**
     * Display a listing of the rooms.
     */
    public function index(Request $request)
    {
        try {
            // Forward any query parameters to the API
            $queryParams = $request->query();
            
            // Create a cache key based on the query parameters
            $cacheKey = 'rooms_list_' . md5(json_encode($queryParams));
            
            // Try to get from cache first if caching is enabled
            if ($this->cacheEnabled && Cache::has($cacheKey)) {
                Log::info('Serving rooms list from cache', ['cache_key' => $cacheKey]);
                $responseData = Cache::get($cacheKey);
                
                return view('rooms.index', [
                    'initialData' => [
                        'rooms' => $responseData['rooms'] ?? [],
                        'totalCount' => $responseData['totalCount'] ?? count($responseData['rooms'] ?? []),
                        'filters' => $queryParams,
                        'fromCache' => true
                    ]
                ]);
            }
            
            // Make the API request with timeout
            Log::info('Fetching rooms from API', [
                'endpoint' => "{$this->apiBaseUrl}/rooms",
                'params' => $queryParams
            ]);
            
            $response = Http::timeout(5)->get("{$this->apiBaseUrl}/rooms", $queryParams);
            
            // Check if the request was successful
            if ($response->successful()) {
                $responseData = $response->json();
                $rooms = $responseData['rooms'] ?? [];
                
                // Cache the response
                if ($this->cacheEnabled) {
                    Cache::put($cacheKey, $responseData, $this->cacheTTL);
                }
                
                return view('rooms.index', [
                    'initialData' => [
                        'rooms' => $rooms,
                        'totalCount' => $responseData['totalCount'] ?? count($rooms),
                        'filters' => $queryParams
                    ]
                ]);
            } else {
                // Log the error
                Log::error('API error fetching rooms', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                
                // Use mock data in development
                if (app()->environment('local', 'development')) {
                    Log::info('Using mock room data in development environment');
                    $mockData = $this->getMockRoomListData();
                    
                    return view('rooms.index', [
                        'initialData' => [
                            'rooms' => $mockData['rooms'],
                            'totalCount' => count($mockData['rooms']),
                            'filters' => $queryParams,
                            'isMockData' => true
                        ]
                    ]);
                }
                
                return view('rooms.index', [
                    'error' => 'Unable to fetch rooms. Please try again later.'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception in RoomsController@index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Use mock data in development
            if (app()->environment('local', 'development')) {
                Log::info('Using mock room data in development environment after exception');
                $mockData = $this->getMockRoomListData();
                
                return view('rooms.index', [
                    'initialData' => [
                        'rooms' => $mockData['rooms'],
                        'totalCount' => count($mockData['rooms']),
                        'filters' => $queryParams,
                        'isMockData' => true
                    ],
                    'warning' => 'Using sample data. API connection failed: ' . $e->getMessage()
                ]);
            }
            
            return view('rooms.index', [
                'error' => 'An error occurred. Please try again later.'
            ]);
        }
    }

    /**
     * Display the specified room.
     */
    public function show($id)
    {
        try {
            // Create cache key for this specific room
            $cacheKey = "room_details_{$id}";
            
            // Try to get from cache first if caching is enabled
            if ($this->cacheEnabled && Cache::has($cacheKey)) {
                Log::info('Serving room details from cache', ['room_id' => $id, 'cache_key' => $cacheKey]);
                $roomData = Cache::get($cacheKey);
                
                return view('rooms.show', [
                    'initialData' => [
                        'room' => $roomData,
                        'fromCache' => true
                    ]
                ]);
            }
            
            // Make API request with timeout to get room details
            Log::info('Fetching room details from API', ['room_id' => $id]);
            $response = Http::timeout(5)->get("{$this->apiBaseUrl}/rooms/{$id}");
            
            if ($response->successful()) {
                $responseData = $response->json();
                $roomData = $responseData['room'] ?? null;
                
                if ($roomData) {
                    // Cache the response
                    if ($this->cacheEnabled) {
                        Cache::put($cacheKey, $roomData, $this->cacheTTL);
                    }
                    
                    return view('rooms.show', [
                        'initialData' => [
                            'room' => $roomData
                        ]
                    ]);
                }
            }
            
            // Log the error
            Log::error('API error fetching room details', [
                'room_id' => $id,
                'status' => $response->status(),
                'response' => $response->body()
            ]);
            
            // Use mock data in development
            if (app()->environment('local', 'development')) {
                Log::info('Using mock room detail in development environment', ['room_id' => $id]);
                $mockRoom = $this->getMockRoomDetail($id);
                
                if ($mockRoom) {
                    return view('rooms.show', [
                        'initialData' => [
                            'room' => $mockRoom,
                            'isMockData' => true
                        ],
                        'warning' => 'Showing sample data. API request failed.'
                    ]);
                }
            }
            
            return redirect()->route('rooms.index')
                ->with('error', 'Room not found or unavailable');
        } catch (\Exception $e) {
            Log::error('Exception in RoomsController@show', [
                'room_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Use mock data in development
            if (app()->environment('local', 'development')) {
                Log::info('Using mock room detail in development after exception', ['room_id' => $id]);
                $mockRoom = $this->getMockRoomDetail($id);
                
                if ($mockRoom) {
                    return view('rooms.show', [
                        'initialData' => [
                            'room' => $mockRoom,
                            'isMockData' => true
                        ],
                        'warning' => 'Showing sample data. API connection failed: ' . $e->getMessage()
                    ]);
                }
            }
            
            return redirect()->route('rooms.index')
                ->with('error', 'An error occurred. Please try again later.');
        }
    }
    
    /**
     * Get mock room list data for development environment
     */
    private function getMockRoomListData()
    {
        return [
            'rooms' => [
                [
                    'roomId' => 1,
                    'name' => 'Marina',
                    'classificationId' => 2,
                    'rentalTypeId' => 1,
                    'rate' => 100000,
                    'capacity' => 4,
                    'description' => 'Spacious room with modern amenities',
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
                ],
                [
                    'roomId' => 6,
                    'name' => 'C101',
                    'classificationId' => 3,
                    'rentalTypeId' => 2,
                    'rate' => 500000,
                    'capacity' => 1,
                    'description' => 'Single VIP room with private bathroom and AC',
                    'classification' => [
                        'classificationId' => 3,
                        'name' => 'VIP'
                    ],
                    'rentalType' => [
                        'rentalTypeId' => 2,
                        'name' => 'bulanan'
                    ],
                    'amenities' => [
                        [
                            'roomId' => 6,
                            'featureId' => 1,
                            'quantity' => 1,
                            'feature' => [
                                'featureId' => 1,
                                'name' => 'AC',
                                'description' => 'Air Conditioning'
                            ]
                        ],
                        [
                            'roomId' => 6,
                            'featureId' => 2,
                            'quantity' => 1,
                            'feature' => [
                                'featureId' => 2,
                                'name' => 'private_bathroom',
                                'description' => 'Private attached bathroom'
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }
    
    /**
     * Get mock room detail data for development environment
     */
    private function getMockRoomDetail($id)
    {
        $mockRooms = [
            1 => [
                'roomId' => 1,
                'name' => 'Marina',
                'classificationId' => 2,
                'rentalTypeId' => 1,
                'rate' => 100000,
                'capacity' => 4,
                'description' => 'Spacious room with modern amenities',
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
            2 => [
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
        ];
        
        // Return requested room or fallback to first room
        return $mockRooms[$id] ?? ($mockRooms[array_key_first($mockRooms)] ?? null);
    }
}
