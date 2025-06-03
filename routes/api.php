<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;

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

// Proxy routes for the React frontend
Route::get('/rooms', function (Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    try {
        $response = Http::get("{$apiBaseUrl}/rooms", $request->query());
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

Route::get('/rooms/{id}', function (Request $request, $id) {
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
