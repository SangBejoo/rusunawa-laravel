<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use App\Services\TenantAuthService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    protected $notificationService;
    protected $authService;

    public function __construct(NotificationService $notificationService, TenantAuthService $authService)
    {
        $this->notificationService = $notificationService;
        $this->authService = $authService;
        $this->middleware('tenant.auth');
    }

    /**
     * Display the tenant's notifications
     */
    public function index(Request $request)
    {
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }
        
        $page = max(1, $request->get('page', 1));
        $limit = 10;
        $includeRead = $request->get('include_read', false);
        
        $response = $this->notificationService->getUserNotifications(
            $tenant['user_id'],
            [
                'include_read' => $includeRead,
                'page' => $page,
                'limit' => $limit
            ]
        );
        
        return view('tenant.notifications', [
            'notifications' => $response['success'] ? $response['body']['notifications'] : [],
            'totalCount' => $response['success'] ? $response['body']['total_count'] : 0,
            'currentPage' => $page,
            'perPage' => $limit,
            'tenant' => $tenant
        ]);
    }
    
    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $notificationId)
    {
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }
        
        $response = $this->notificationService->markAsRead($notificationId);
        
        if (!$response['success']) {
            return back()->with('error', $response['body']['message'] ?? 'Failed to mark notification as read.');
        }
        
        return back()->with('status', 'Notification marked as read.');
    }
    
    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }
        
        $response = $this->notificationService->markAllAsRead($tenant['user_id']);
        
        if (!$response['success']) {
            return back()->with('error', $response['body']['message'] ?? 'Failed to mark all notifications as read.');
        }
        
        return back()->with('status', 'All notifications marked as read.');
    }
    
    /**
     * Get unread notification count (for AJAX requests)
     */
    public function getUnreadCount(Request $request)
    {
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'Not authenticated']);
        }
        
        $response = $this->notificationService->getUserNotifications(
            $tenant['user_id'],
            ['include_read' => false]
        );
        
        if (!$response['success']) {
            return response()->json(['success' => false, 'message' => 'Failed to fetch notifications']);
        }
        
        $unreadCount = $response['body']['total_count'] ?? 0;
        
        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount,
            'notifications' => array_slice($response['body']['notifications'] ?? [], 0, 5)
        ]);
    }
}
