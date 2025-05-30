<?php

namespace App\Http\Controllers;

use App\Services\TenantAuthService;
use App\Services\BookingService;
use App\Services\PaymentService;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class TenantDashboardController extends Controller
{
    protected $authService;
    protected $bookingService;
    protected $paymentService;
    protected $notificationService;

    public function __construct(
        TenantAuthService $authService,
        BookingService $bookingService = null,
        PaymentService $paymentService = null,
        NotificationService $notificationService = null
    ) {
        $this->authService = $authService;
        $this->bookingService = $bookingService ?? new \App\Services\ApiClient();
        $this->paymentService = $paymentService ?? new \App\Services\ApiClient();
        $this->notificationService = $notificationService ?? new \App\Services\ApiClient();
        
        $this->middleware('tenant.auth');
    }

    /**
     * Display tenant dashboard
     */
    public function index()
    {
        $tenantData = $this->authService->getTenantData();
        $tenantId = $tenantData['tenant_id'] ?? null;
        
        // Default values in case of API failures
        $bookings = [];
        $invoices = [];
        $notifications = [];
        
        // Get active bookings (limit to 5 recent)
        if ($tenantId) {
            $bookingsResponse = $this->bookingService->get("/v1/tenants/{$tenantId}/bookings", [
                'limit' => 5
            ]);
            if ($bookingsResponse['success']) {
                $bookings = $bookingsResponse['body']['bookings'] ?? [];
            }
            
            // Get pending invoices
            $invoicesResponse = $this->paymentService->get("/v1/tenants/{$tenantId}/invoices", [
                'status' => 'pending',
                'limit' => 5
            ]);
            if ($invoicesResponse['success']) {
                $invoices = $invoicesResponse['body']['invoices'] ?? [];
            }
            
            // Get unread notifications
            $notificationsResponse = $this->notificationService->get("/v1/users/{$tenantData['user_id']}/notifications", [
                'include_read' => false,
                'limit' => 10
            ]);
            if ($notificationsResponse['success']) {
                $notifications = $notificationsResponse['body']['notifications'] ?? [];
            }
        }
        
        return view('tenant.dashboard', [
            'tenant' => $tenantData,
            'bookings' => $bookings,
            'invoices' => $invoices,
            'notifications' => $notifications,
        ]);
    }
}
