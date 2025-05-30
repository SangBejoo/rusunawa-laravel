<?php

use App\Http\Controllers\Auth\TenantLoginController;
use App\Http\Controllers\Auth\TenantRegisterController;
use App\Http\Controllers\TenantDashboardController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\IssueController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Welcome page
Route::get('/', function () {
    return view('welcome');
})->name('home');

// Authentication routes
Route::get('/login', [TenantLoginController::class, 'showLoginForm'])->name('tenant.login');
Route::post('/login', [TenantLoginController::class, 'login']);
Route::post('/logout', [TenantLoginController::class, 'logout'])->name('tenant.logout');
Route::get('/register', [TenantRegisterController::class, 'showRegistrationForm'])->name('tenant.register');
Route::post('/register', [TenantRegisterController::class, 'register']);

// Password reset routes
Route::get('/forgot-password', [TenantPasswordController::class, 'showLinkRequestForm'])->name('password.request');
Route::post('/forgot-password', [TenantPasswordController::class, 'sendResetLinkEmail'])->name('password.email');
Route::get('/reset-password/{token}', [TenantPasswordController::class, 'showResetForm'])->name('password.reset');
Route::post('/reset-password', [TenantPasswordController::class, 'reset'])->name('password.update');

// Protected routes (requires tenant authentication)
Route::middleware(['tenant.auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [TenantDashboardController::class, 'index'])->name('tenant.dashboard');
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'show'])->name('tenant.profile');
    Route::put('/profile', [ProfileController::class, 'update'])->name('tenant.profile.update');
    Route::put('/profile/location', [ProfileController::class, 'updateLocation'])->name('tenant.profile.location');
    Route::put('/profile/nim', [ProfileController::class, 'updateNIM'])->name('tenant.profile.nim');
    
    // Room browsing and booking
    Route::get('/rooms', [BookingController::class, 'index'])->name('tenant.rooms');
    Route::get('/rooms/{roomId}', [BookingController::class, 'showRoom'])->name('tenant.room.detail');
    Route::get('/rooms/by-type/{tenantType}', [BookingController::class, 'getRoomsByType'])->name('tenant.rooms.by-type');
    Route::get('/rooms/by-gender/{gender}', [BookingController::class, 'getRoomsByGender'])->name('tenant.rooms.by-gender');
    Route::post('/bookings', [BookingController::class, 'store'])->name('tenant.booking.create');
    Route::get('/bookings', [BookingController::class, 'myBookings'])->name('tenant.bookings');
    Route::get('/bookings/{bookingId}', [BookingController::class, 'show'])->name('tenant.booking.detail');
    Route::put('/bookings/{bookingId}/cancel', [BookingController::class, 'cancel'])->name('tenant.booking.cancel');
    
    // Documents
    Route::get('/documents', [DocumentController::class, 'index'])->name('tenant.documents');
    Route::post('/documents', [DocumentController::class, 'store'])->name('tenant.document.upload');
    Route::get('/documents/{documentId}', [DocumentController::class, 'show'])->name('tenant.document.show');
    Route::put('/documents/{documentId}', [DocumentController::class, 'update'])->name('tenant.document.update');
    Route::delete('/documents/{documentId}', [DocumentController::class, 'destroy'])->name('tenant.document.delete');
    Route::post('/policies/sign', [DocumentController::class, 'signPolicy'])->name('tenant.policy.sign');
    
    // Payments & Invoices
    Route::get('/invoices', [PaymentController::class, 'invoices'])->name('tenant.invoices');
    Route::get('/invoices/{invoiceId}', [PaymentController::class, 'showInvoice'])->name('tenant.invoice.show');
    Route::get('/payments', [PaymentController::class, 'payments'])->name('tenant.payments');
    Route::get('/payments/{paymentId}', [PaymentController::class, 'showPayment'])->name('tenant.payment.show');
    Route::post('/payments/create', [PaymentController::class, 'createPayment'])->name('tenant.payment.create');
    Route::post('/payments/{paymentId}/receipt', [PaymentController::class, 'uploadReceipt'])->name('tenant.payment.receipt');
    Route::get('/payments/{paymentId}/status', [PaymentController::class, 'checkStatus'])->name('tenant.payment.status');
    
    // Issue reporting
    Route::get('/issues', [IssueController::class, 'index'])->name('tenant.issues');
    Route::post('/issues', [IssueController::class, 'store'])->name('tenant.issue.create');
    Route::get('/issues/{issueId}', [IssueController::class, 'show'])->name('tenant.issue.show');
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('tenant.notifications');
    Route::put('/notifications/{notificationId}/read', [NotificationController::class, 'markAsRead'])->name('tenant.notification.read');
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('tenant.notifications.read-all');
    
    // Waiting list
    Route::post('/waiting-list', [BookingController::class, 'joinWaitingList'])->name('tenant.waitinglist.join');
    Route::get('/waiting-list/status', [BookingController::class, 'waitingListStatus'])->name('tenant.waitinglist.status');
    Route::delete('/waiting-list', [BookingController::class, 'leaveWaitingList'])->name('tenant.waitinglist.leave');
});
