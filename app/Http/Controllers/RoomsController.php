<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RoomsController extends Controller
{
    protected $apiBaseUrl;
    protected $backupApiBaseUrl;
    
    public function __construct()
    {
        $this->apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
        
    }
    
    /**
     * Display a listing of the rooms.
     */
    public function index(Request $request)
    {
        try {
            // Build query parameters from request
            $params = [];
            $filters = ['type', 'price', 'capacity'];
            
            foreach ($filters as $filter) {
                if ($request->has($filter) && $request->input($filter)) {
                    $params[$filter] = $request->input($filter);
                }
            }
            
            // Log the request parameters
            Log::info('Room search request', ['params' => $params]);
            
            // Try primary API endpoint first
            try {
                $response = Http::timeout(5)->get("{$this->apiBaseUrl}/rooms", $params);
                $data = $response->json();
                
                // Log the successful API response
                if ($response->successful() && isset($data['rooms'])) {
                    Log::info('Room API response successful', [
                        'endpoint' => $this->apiBaseUrl,
                        'status_code' => $response->status(),
                        'room_count' => count($data['rooms'])
                    ]);
                }
            } catch (\Exception $primaryException) {
                Log::warning('Primary API endpoint failed', [
                    'endpoint' => $this->apiBaseUrl,
                    'error' => $primaryException->getMessage()
                ]);
                
                // If primary endpoint fails, try backup endpoint
                try {
                    $response = Http::timeout(5)->get("{$this->backupApiBaseUrl}/rooms", $params);
                    $data = $response->json();
                    
                    // Log the backup API response
                    if ($response->successful() && isset($data['rooms'])) {
                        Log::info('Backup API response successful', [
                            'endpoint' => $this->backupApiBaseUrl,
                            'status_code' => $response->status(),
                            'room_count' => count($data['rooms'])
                        ]);
                    }
                } catch (\Exception $backupException) {
                    Log::error('Both API endpoints failed', [
                        'primary_error' => $primaryException->getMessage(),
                        'backup_error' => $backupException->getMessage()
                    ]);
                    
                    throw $backupException;
                }
            }
            
            // Check if the response has the expected structure
            if (isset($response) && $response->successful() && isset($data['rooms'])) {
                // Return the view with room data
                return view('rooms', [
                    'rooms' => $data['rooms'],
                    'totalCount' => $data['totalCount'] ?? count($data['rooms']),
                    'apiBaseUrl' => $this->apiBaseUrl
                ]);
            } else {
                // Log error details
                Log::error('Invalid room API response structure', [
                    'response' => $data ?? null,
                    'status_code' => $response->status() ?? 'unknown'
                ]);
                
                // Try to load mocked data as a last resort
                $mockedRooms = $this->getMockedRoomData();
                
                // Return view with error and mocked data
                return view('rooms', [
                    'error' => isset($data['status']['message']) 
                            ? $data['status']['message'] 
                            : 'Failed to load rooms. Showing sample data instead.',
                    'rooms' => $mockedRooms,
                    'totalCount' => count($mockedRooms),
                    'isMocked' => true
                ]);
            }
        } catch (\Exception $e) {
            // Log any exceptions
            Log::error('Exception fetching rooms', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Try to load mocked data as a last resort
            $mockedRooms = $this->getMockedRoomData();
            
            // Return view with error message and mocked data
            return view('rooms', [
                'error' => 'Failed to connect to room service. Showing sample data instead.',
                'rooms' => $mockedRooms,
                'totalCount' => count($mockedRooms),
                'isMocked' => true
            ]);
        }
    }

    /**
     * Display the specified room.
     */
    public function show($id)
    {
        try {
            // Try primary API endpoint first
            try {
                $response = Http::timeout(5)->get("{$this->apiBaseUrl}/rooms/{$id}");
                $data = $response->json();
                
                // Log the successful API response
                if ($response->successful() && isset($data['room'])) {
                    Log::info('Room detail API response successful', [
                        'endpoint' => $this->apiBaseUrl,
                        'room_id' => $id,
                        'status_code' => $response->status()
                    ]);
                }
            } catch (\Exception $primaryException) {
                Log::warning('Primary API endpoint failed for room detail', [
                    'endpoint' => $this->apiBaseUrl,
                    'room_id' => $id,
                    'error' => $primaryException->getMessage()
                ]);
                
                // If primary endpoint fails, try backup endpoint
                try {
                    $response = Http::timeout(5)->get("{$this->backupApiBaseUrl}/rooms/{$id}");
                    $data = $response->json();
                    
                    // Log the backup API response
                    if ($response->successful() && isset($data['room'])) {
                        Log::info('Backup API response successful for room detail', [
                            'endpoint' => $this->backupApiBaseUrl,
                            'room_id' => $id,
                            'status_code' => $response->status()
                        ]);
                    }
                } catch (\Exception $backupException) {
                    Log::error('Both API endpoints failed for room detail', [
                        'room_id' => $id,
                        'primary_error' => $primaryException->getMessage(),
                        'backup_error' => $backupException->getMessage()
                    ]);
                    
                    throw $backupException;
                }
            }
            
            // Check if response is successful and has room data
            if (isset($response) && $response->successful() && isset($data['room'])) {
                // Extract the room data from the nested structure
                $room = $data['room'];
                
                // Pass the room object and API URL to the view
                return view('room-detail', [
                    'room' => $room,
                    'apiBaseUrl' => $this->apiBaseUrl
                ]);
            } else {
                // Log error details
                Log::error('Invalid room detail API response', [
                    'room_id' => $id,
                    'status_code' => $response->status() ?? 'unknown',
                    'response' => $data ?? null
                ]);
                
                // Try to get mocked data for this room
                $mockedRoom = $this->getMockedRoomById($id);
                
                if ($mockedRoom) {
                    // Return view with mocked data
                    return view('room-detail', [
                        'room' => $mockedRoom,
                        'isMocked' => true,
                        'warning' => 'Using sample data. Live data unavailable.'
                    ]);
                }
                
                // Return error view if no mocked data available
                return view('error', [
                    'message' => 'Failed to load room details',
                    'details' => isset($data['status']['message']) ? $data['status']['message'] : 'Room not found or unavailable'
                ]);
            }
        } catch (\Exception $e) {
            // Log exception details
            Log::error('Exception fetching room details', [
                'room_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Try to get mocked data for this room
            $mockedRoom = $this->getMockedRoomById($id);
            
            if ($mockedRoom) {
                // Return view with mocked data
                return view('room-detail', [
                    'room' => $mockedRoom,
                    'isMocked' => true,
                    'warning' => 'Using sample data. Live data unavailable.'
                ]);
            }
            
            // Return error view
            return view('error', [
                'message' => 'An error occurred while fetching room details',
                'details' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Get mocked room data for fallback
     */
    private function getMockedRoomData()
    {
        $rooms = [
            [
                'roomId' => 1,
                'name' => 'A101',
                'classificationId' => 1,
                'rentalTypeId' => 2,
                'rate' => 350000,
                'capacity' => 2,
                'description' => 'Sample female student room with AC',
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
                        'roomId' => 1,
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
                'roomId' => 2,
                'name' => 'B101',
                'classificationId' => 2,
                'rentalTypeId' => 2,
                'rate' => 300000,
                'capacity' => 2,
                'description' => 'Sample male student room with fan',
                'classification' => [
                    'classificationId' => 2,
                    'name' => 'laki_laki'
                ],
                'rentalType' => [
                    'rentalTypeId' => 2,
                    'name' => 'bulanan'
                ],
                'amenities' => []
            ],
            [
                'roomId' => 3,
                'name' => 'C101',
                'classificationId' => 3,
                'rentalTypeId' => 2,
                'rate' => 500000,
                'capacity' => 1,
                'description' => 'Sample VIP room with private bathroom',
                'classification' => [
                    'classificationId' => 3,
                    'name' => 'VIP'
                ],
                'rentalType' => [
                    'rentalTypeId' => 2,
                    'name' => 'bulanan'
                ],
                'amenities' => []
            ],
            [
                'roomId' => 4,
                'name' => 'D101',
                'classificationId' => 4,
                'rentalTypeId' => 1,
                'rate' => 500000,
                'capacity' => 20,
                'description' => 'Sample meeting room with projector',
                'classification' => [
                    'classificationId' => 4,
                    'name' => 'ruang_rapat'
                ],
                'rentalType' => [
                    'rentalTypeId' => 1,
                    'name' => 'harian'
                ],
                'amenities' => []
            ]
        ];
        
        return $rooms;
    }
    
    /**
     * Get mocked room by ID for fallback
     */
    private function getMockedRoomById($id)
    {
        $rooms = $this->getMockedRoomData();
        
        foreach ($rooms as $room) {
            if ($room['roomId'] == $id) {
                return $room;
            }
        }
        
        return null;
    }
}
