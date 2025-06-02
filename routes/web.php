<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\TenantLoginController;
use App\Http\Controllers\Auth\TenantRegisterController;
use App\Http\Controllers\Auth\TenantPasswordController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\TenantDashboardController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Frontend Landing Pages (SPA)
Route::get('/', [LandingController::class, 'index'])->name('landing');
Route::get('/rooms', [LandingController::class, 'index']);
Route::get('/facilities', [LandingController::class, 'index']);
Route::get('/about', [LandingController::class, 'index']);
Route::get('/contact', [LandingController::class, 'index']);

// Authentication Routes for Tenants at top level
Route::get('/login', [TenantLoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [TenantLoginController::class, 'login']);
Route::post('/logout', [TenantLoginController::class, 'logout'])->name('logout');

// Registration Routes
Route::get('/register', [TenantRegisterController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [TenantRegisterController::class, 'register']);

// Other tenant routes with prefix
Route::prefix('tenant')->group(function () {
    // Password Reset Routes
    Route::get('/forgot-password', [TenantPasswordController::class, 'showLinkRequestForm'])->name('tenant.password.request');
    Route::post('/forgot-password', [TenantPasswordController::class, 'sendResetLinkEmail'])->name('tenant.password.email');
    Route::get('/reset-password/{token}', [TenantPasswordController::class, 'showResetForm'])->name('tenant.password.reset');
    Route::post('/reset-password', [TenantPasswordController::class, 'reset'])->name('tenant.password.update');
    
    // Dashboard (protected by middleware)
    Route::get('/dashboard', [TenantDashboardController::class, 'index'])->name('tenant.dashboard')->middleware('tenant.auth');
});

// Registration Routes
Route::get('/register', [TenantRegisterController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [TenantRegisterController::class, 'register']);

// API Health check route
Route::get('/api/health-check', function () {
    try {
        $apiClient = app(\App\Services\ApiClient::class);
        $isHealthy = $apiClient->checkHealth();
        
        if ($isHealthy) {
            return response()->json(['status' => 'ok', 'message' => 'API is running']);
        } else {
            return response()->json(['status' => 'error', 'message' => 'API returned an error'], 500);
        }
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('API Health Check Failed', [
            'error' => $e->getMessage()
        ]);
        return response()->json(['status' => 'error', 'message' => 'Failed to connect to API'], 503);
    }
});

// 404 Fallback - should be last
Route::fallback([LandingController::class, 'notFound']);
