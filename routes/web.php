<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\Auth\TenantLoginController;
use App\Http\Controllers\Auth\TenantRegisterController;
use App\Http\Controllers\Auth\TenantPasswordController;
use App\Http\Controllers\TenantDashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\IssueController;

// Include debug routes
require_once __DIR__.'/debug.php';
// Include test routes
require_once __DIR__.'/test.php';

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

// Authentication Routes for Tenants - Define login routes outside the group to avoid middleware issues
Route::get('/tenant/login', [TenantLoginController::class, 'showLoginForm'])
    ->name('tenant.login')
    ->withoutMiddleware(['web']);

Route::post('/tenant/login', [TenantLoginController::class, 'login'])
    ->name('tenant.login.submit');

// Authentication Routes for Tenants
Route::group(['prefix' => 'tenant', 'as' => 'tenant.'], function () {
    // Logout route
    Route::post('/logout', [TenantLoginController::class, 'logout'])->name('logout');
    
    // Registration Routes
    Route::get('/register', [TenantRegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', [TenantRegisterController::class, 'register'])->name('register.submit');
    
    // Password Reset Routes
    Route::get('/password/reset', [TenantPasswordController::class, 'showLinkRequestForm'])->name('password.request');
    Route::post('/password/email', [TenantPasswordController::class, 'sendResetLinkEmail'])->name('password.email');
    Route::get('/password/reset/{token}', [TenantPasswordController::class, 'showResetForm'])->name('password.reset');
    Route::post('/password/reset', [TenantPasswordController::class, 'reset'])->name('password.update');
    
    // Authenticated tenant routes
    Route::middleware('tenant.auth')->group(function () {
        Route::get('/dashboard', [TenantDashboardController::class, 'index'])->name('tenant.dashboard');
        Route::get('/profile', [ProfileController::class, 'show'])->name('tenant.profile');
        Route::get('/bookings', function () { return view('tenant.bookings'); })->name('tenant.bookings');
        Route::get('/invoices', [PaymentController::class, 'invoices'])->name('tenant.invoices');
        Route::get('/payments', [PaymentController::class, 'payments'])->name('tenant.payments');
    });
});

// General page routes
Route::get('/', [LandingController::class, 'index'])->name('landing');
Route::get('/rooms', function () { return view('rooms'); })->name('rooms');
Route::get('/about', function () { return view('about'); })->name('about');
Route::get('/contact', function () { return view('contact'); })->name('contact');
Route::get('/facilities', function () { return view('facilities'); })->name('facilities');

// Make sure the fallback route is the LAST route defined
// This can cause issues if it intercepts other routes
Route::fallback([LandingController::class, 'notFound']);
