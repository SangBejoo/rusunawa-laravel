<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\RoomsController;
use App\Http\Controllers\Auth\TenantLoginController;
use App\Http\Controllers\Auth\TenantRegisterController;
use App\Http\Controllers\Auth\TenantPasswordController;
use App\Http\Controllers\TenantDashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\IssueController;
use App\Http\Controllers\BookingController;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

// Include debug routes
// require_once __DIR__.'/debug.php'; // Commented out as file might not exist
// Include test routes
// require_once __DIR__.'/test.php'; // Commented out as file might not exist

// Direct login route with no middleware to test for redirect issues
Route::get('/tenant/login-direct', function() {
    \Illuminate\Support\Facades\Log::info('Direct login route accessed with no middleware');
    return view('tenant.login');
})->withoutMiddleware(\App\Http\Middleware\TrackRedirectsMiddleware::class);

// Debug route to check raw response
Route::get('/tenant/login-debug', function() {
    return response('Login page debug endpoint - Response is being returned directly', 200)
        ->header('Content-Type', 'text/plain');
});

// Tenant profile route - without middleware to avoid redirect loops
Route::get('/tenant/profile', function() {
    return view('tenant.profile');
})->name('tenant.profile'); // Removed tenant.auth middleware

// Debug login page for troubleshooting
Route::get('/debug-login', function() {
    return view('debug-login');
})->name('debug.login');

/*
|--------------------------------------------------------------------------
| Web Routes  
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Test route untuk memastikan Laravel berfungsi
Route::get('/test', function () {
    return '<h1>Laravel Working!</h1><p>If you see this, Laravel is functioning properly.</p>';
});

// Test route untuk memastikan view app.blade.php berfungsi
Route::get('/test-react', function () {
    return view('app');
});

// Test route untuk static HTML tanpa React
Route::get('/test-static', function () {
    return view('test-static');
});

// Authentication Routes for Tenants - Define login routes outside the group to avoid middleware issues
Route::get('/tenant/login', function() {
    return view('app'); // Render React SPA
})->name('tenant.login')->middleware('web');

// Add a cache-busting redirect for login
Route::get('/login', function() {
    return redirect()->route('tenant.login', ['t' => time()]);
});

// Add a named alias for 'login' route for compatibility with Laravel auth
Route::get('/login-alias', function() {
    return redirect()->route('tenant.login', ['t' => time()]);
})->name('login');

// Now handle the tenant login submission with special case for AJAX
Route::post('/tenant/login', [TenantLoginController::class, 'login'])
    ->name('tenant.login.submit')
    ->middleware('web');  // Ensure web middleware is applied

// Authentication Routes for Tenants
Route::group(['prefix' => 'tenant', 'as' => 'tenant.'], function () {
    // Logout route (if you want to keep Laravel logout, otherwise can be removed)
    Route::post('/logout', [TenantLoginController::class, 'logout'])->name('logout');
    
    // Registration Routes
    Route::get('tenant/register', [TenantRegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('tenant/register', [TenantRegisterController::class, 'register'])->name('register.submit');
    
    // Password Reset Routes
    Route::get('/password/reset', [TenantPasswordController::class, 'showLinkRequestForm'])->name('password.request');
    Route::post('/password/email', [TenantPasswordController::class, 'sendResetLinkEmail'])->name('password.email');
    Route::get('/password/reset/{token}', [TenantPasswordController::class, 'showResetForm'])->name('password.reset');
    Route::post('/password/reset', [TenantPasswordController::class, 'reset'])->name('password.update');
    
    // React SPA entry points (NO tenant.auth middleware, so React+JWT works)
    Route::get('/dashboard', function () { return view('app'); })->name('dashboard');
    Route::get('/bookings', function () { return view('app'); })->name('bookings');
    Route::get('/bookings/{bookingId}', function () { return view('app'); })->name('bookings.detail');
    Route::get('/bookings/{bookingId}/check-in', function () { return view('app'); })->name('bookings.checkin');
    Route::get('/bookings/{bookingId}/payment', function () { return view('app'); })->name('bookings.payment');
    Route::get('/bookings/{bookingId}/payment-method', function () { return view('app'); })->name('bookings.payment.method');
    Route::get('/bookings/{bookingId}/manual-payment', function () { return view('app'); })->name('bookings.manual.payment');
    Route::get('/bookings/{bookingId}/midtrans-payment', function () { return view('app'); })->name('bookings.midtrans.payment');
    Route::get('/bookings/{bookingId}/payments/create/manual', function () { return view('app'); })->name('bookings.payments.create.manual');
    
    Route::get('/invoices', function () { return view('app'); })->name('invoices');
    Route::get('/invoices/history', function () { return view('app'); })->name('invoices.history');
    Route::get('/invoices/{invoiceId}', function () { return view('app'); })->name('invoices.detail');
    Route::get('/invoices/{invoiceId}/payment-method', function () { return view('app'); })->name('invoices.payment.method');
    Route::get('/invoices/{invoiceId}/manual-payment', function () { return view('app'); })->name('invoices.manual.payment');
    Route::get('/invoices/{invoiceId}/midtrans-payment', function () { return view('app'); })->name('invoices.midtrans.payment');
    Route::get('/invoices/{invoiceId}/payments/create/manual', function () { return view('app'); })->name('invoices.payments.create.manual');
    
    Route::get('/payments', function () { return view('app'); })->name('payments');
    Route::get('/payments/history', function () { return view('app'); })->name('payments.history');
    Route::get('/payments/{paymentId}', function () { return view('app'); })->name('payments.detail');
    Route::get('/payments/create/manual', function () { return view('app'); })->name('payments.create.manual');
    Route::get('/payments/callback', function () { return view('app'); })->name('payments.callback');
    Route::get('/payments/process/{invoiceId}', function () { return view('app'); })->name('payments.process');
    
    Route::get('/issues', function () { return view('app'); })->name('issues');
    Route::get('/issues/report', function () { return view('app'); })->name('issues.report');
    Route::get('/issues/{issueId}', function () { return view('app'); })->name('issues.detail');
    
    Route::get('/profile', function () { return view('app'); })->name('profile');
    Route::get('/documents', function () { return view('app'); })->name('documents');
    Route::get('/documents/upload', function () { return view('app'); })->name('documents.upload');
    
    Route::get('/rooms', function () { return view('app'); })->name('rooms');
    Route::get('/rooms/listing', function () { return view('app'); })->name('rooms.listing');
    Route::get('/rooms/{roomId}', function () { return view('app'); })->name('rooms.detail');
    Route::get('/rooms/{roomId}/book', function () { return view('app'); })->name('rooms.book');
    
    // Auth routes
    Route::get('/register', function () { return view('app'); })->name('register');
    Route::get('/forgot-password', function () { return view('app'); })->name('forgot.password');
    Route::get('/reset-password', function () { return view('app'); })->name('reset.password');
    Route::get('/email-verification', function () { return view('app'); })->name('email.verification');
    Route::get('/verification-prompt', function () { return view('app'); })->name('verification.prompt');
});

// General page routes - React SPA routes for public pages
Route::get('/', function () {
    return view('app');
})->name('landing');

// Public rooms routes (outside tenant prefix for public access)
Route::get('/rooms', function () { return view('app'); })->name('public.rooms');
Route::get('/rooms/listing', function () { return view('app'); })->name('public.rooms.listing');
Route::get('/rooms/{roomId}', function () { return view('app'); })->name('public.rooms.detail');

// Booking routes
Route::post('/bookings', [BookingController::class, 'store'])
    ->middleware('tenant.auth')
    ->name('bookings.store');
    
Route::get('/bookings/confirmation/{id}', [BookingController::class, 'confirmation'])
    ->middleware('tenant.auth')
    ->name('bookings.confirmation');

// Payment route
Route::get('/payment/{booking_id}', [PaymentController::class, 'show'])
    ->middleware('tenant.auth')
    ->name('payment');

// Add API proxy routes for React components
Route::get('/api/rooms', function() {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    $response = Http::get("{$apiBaseUrl}/rooms");
    return $response->json();
});

Route::get('/api/rooms/{id}', function($id) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    $response = Http::get("{$apiBaseUrl}/rooms/{$id}");
    return $response->json();
});

Route::post('/api/bookings', function(Request $request) {
    $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
    
    // Get token from session or request
    $token = session('tenant_token') ?? $request->header('Authorization');
    
    // Clean token if it has Bearer prefix
    if ($token && strpos($token, 'Bearer ') === 0) {
        $token = substr($token, 7);
    }
    
    // Check if user is authenticated
    if (!$token) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized - Please login first',
            'redirect' => route('tenant.login')
        ], 401);
    }
    
    // Make API request with token
    $response = Http::withToken($token)->post("{$apiBaseUrl}/bookings", $request->all());
    return $response->json();
})->middleware('tenant.auth');

// CSRF token refresh endpoint - moved higher in the file for visibility
Route::get('/csrf-refresh', function () {
    // Regenerate CSRF token
    $token = csrf_token();
    
    // Log for debugging
    \Illuminate\Support\Facades\Log::debug('CSRF token refreshed', [
        'token_length' => strlen($token),
        'session_id' => session()->getId()
    ]);
    
    return response()->json([
        'token' => $token,
        'time' => now()->toIso8601String(),
        'session_id' => session()->getId()
    ]);
})->middleware('web');

// Failsafe login route that doesn't use React
Route::get('/tenant/login-simple', function () {
    return view('tenant.login-failsafe');
})->name('tenant.login.failsafe');

// Make sure the fallback route is the LAST route defined
// This can cause issues if it intercepts other routes
// Route::fallback([LandingController::class, 'notFound']); // Consider removing or ensuring LandingController::notFound returns view('app') or a proper 404 view

// API routes for tenant frontend
Route::prefix('api')->middleware('tenant.auth')->group(function () {
    // Tenant profile API
    Route::get('/tenant/profile', function (Request $request) {
        $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
        $token = session('tenant_token') ?? $request->header('Authorization');
        
        // Clean token if it has Bearer prefix
        if ($token && strpos($token, 'Bearer ') === 0) {
            $token = substr($token, 7);
        }
        
        // Make API request
        $response = Http::withToken($token)->get("{$apiBaseUrl}/tenant/profile");
        return $response->json();
    });
    
    // Update tenant profile
    Route::put('/tenant/profile', function (Request $request) {
        $apiBaseUrl = env('API_BASE_URL', 'http://localhost:8001/v1');
        $token = session('tenant_token') ?? $request->header('Authorization');
        
        // Clean token if it has Bearer prefix
        if ($token && strpos($token, 'Bearer ') === 0) {
            $token = substr($token, 7);
        }
        
        // Make API request
        $response = Http::withToken($token)->put("{$apiBaseUrl}/tenant/profile", $request->all());
        return $response->json();
    });
});

// API routes for frontend
Route::prefix('api')->group(function () {
    Route::post('/tenant/{id}/recalculate-distance', function ($id) {
        $tenantService = new App\Services\TenantService();
        $response = $tenantService->recalculateDistanceToCampus($id);
        
        if ($response['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Distance recalculated successfully',
                'distance' => $response['body']['distance_to_campus'] ?? 'N/A'
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => $response['body']['message'] ?? 'Failed to recalculate distance'
        ], 500);
    });
});

// Catch-all route untuk aplikasi React Anda
// Pastikan ini adalah rute terakhir dalam file ini jika ada rute web Laravel lainnya.
Route::get('/{any?}', function () {
    return view('app'); // 'app' adalah nama file app.blade.php Anda
})->where('any', '.*');
