@extends('layouts.app')

@section('title', 'Notifications')

@section('content')
<div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>
            <i class="fas fa-bell me-2"></i> Notifications
        </h1>
        
        <div>
            <button class="btn btn-outline-secondary me-2" id="refresh-notifications">
                <i class="fas fa-sync-alt me-1"></i> Refresh
            </button>
            <form action="{{ route('tenant.notifications.read-all') }}" method="POST" class="d-inline">
                @csrf
                @method('PUT')
                <button type="submit" class="btn btn-outline-primary">
                    <i class="fas fa-check-double me-1"></i> Mark All as Read
                </button>
            </form>
        </div>
    </div>
    
    <div class="card shadow">
        <div class="card-body p-0">
            @if(count($notifications) > 0)
                <div class="list-group list-group-flush">
                    @foreach($notifications as $notification)
                        <div class="list-group-item list-group-item-action @if(!$notification['is_read']) bg-light @endif">
                            <div class="d-flex w-100 justify-content-between align-items-center">
                                <div>
                                    <div class="d-flex align-items-center mb-1">
                                        @if($notification['notification_type']['name'] == 'booking_confirmation')
                                            <span class="notification-icon bg-success"><i class="fas fa-calendar-check"></i></span>
                                        @elseif($notification['notification_type']['name'] == 'payment_reminder')
                                            <span class="notification-icon bg-warning"><i class="fas fa-file-invoice-dollar"></i></span>
                                        @elseif($notification['notification_type']['name'] == 'payment_confirmation')
                                            <span class="notification-icon bg-primary"><i class="fas fa-money-bill-wave"></i></span>
                                        @elseif($notification['notification_type']['name'] == 'issue_update')
                                            <span class="notification-icon bg-info"><i class="fas fa-tools"></i></span>
                                        @elseif($notification['notification_type']['name'] == 'document_status')
                                            <span class="notification-icon bg-secondary"><i class="fas fa-file-alt"></i></span>
                                        @else
                                            <span class="notification-icon bg-dark"><i class="fas fa-bell"></i></span>
                                        @endif
                                        
                                        <h6 class="ms-2 mb-0 fw-bold">
                                            @if($notification['notification_type']['name'] == 'booking_confirmation')
                                                Booking Confirmation
                                            @elseif($notification['notification_type']['name'] == 'payment_reminder')
                                                Payment Reminder
                                            @elseif($notification['notification_type']['name'] == 'payment_confirmation')
                                                Payment Confirmation
                                            @elseif($notification['notification_type']['name'] == 'issue_update')
                                                Maintenance Update
                                            @elseif($notification['notification_type']['name'] == 'document_status')
                                                Document Status Update
                                            @else
                                                {{ ucwords(str_replace('_', ' ', $notification['notification_type']['name'])) }}
                                            @endif
                                        </h6>
                                        
                                        @if(!$notification['is_read'])
                                            <span class="badge bg-danger ms-2">New</span>
                                        @endif
                                    </div>
                                    <p class="mb-1">{{ $notification['content'] }}</p>
                                </div>
                                <small class="text-muted ms-3">{{ \Carbon\Carbon::parse($notification['created_at'])->diffForHumans() }}</small>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-2">
                                <div class="notification-action-buttons">
                                    @if(preg_match('/booking(?:_id)?[=\/:](\d+)/', $notification['content'], $matches))
                                        <a href="{{ route('tenant.booking.detail', $matches[1]) }}" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-calendar me-1"></i> View Booking
                                        </a>
                                    @endif
                                    
                                    @if(preg_match('/invoice(?:_id)?[=\/:](\d+)/', $notification['content'], $matches))
                                        <a href="{{ route('tenant.invoice.show', $matches[1]) }}" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-file-invoice-dollar me-1"></i> View Invoice
                                        </a>
                                    @endif
                                    
                                    @if(preg_match('/issue(?:_id)?[=\/:](\d+)/', $notification['content'], $matches))
                                        <a href="{{ route('tenant.issue.show', $matches[1]) }}" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-tools me-1"></i> View Issue
                                        </a>
                                    @endif
                                    
                                    @if(preg_match('/document(?:_id)?[=\/:](\d+)/', $notification['content'], $matches))
                                        <a href="{{ route('tenant.document.show', $matches[1]) }}" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-file-alt me-1"></i> View Document
                                        </a>
                                    @endif
                                </div>
                                
                                <div>
                                    @if(!$notification['is_read'])
                                    <form action="{{ route('tenant.notification.read', $notification['notification_id']) }}" 
                                          method="POST" class="d-inline">
                                        @csrf
                                        @method('PUT')
                                        <button type="submit" class="btn btn-sm btn-outline-secondary">
                                            <i class="fas fa-check"></i> Mark as Read
                                        </button>
                                    </form>
                                    @endif
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
                
                <!-- Pagination -->
                @if($totalCount > $perPage)
                    <div class="d-flex justify-content-center my-3">
                        <nav aria-label="Page navigation">
                            <ul class="pagination">
                                @php
                                    $totalPages = ceil($totalCount / $perPage);
                                @endphp
                
                                <!-- Previous Page Link -->
                                @if($currentPage > 1)
                                    <li class="page-item">
                                        <a class="page-link" href="{{ route('tenant.notifications', ['page' => $currentPage - 1]) }}" aria-label="Previous">
                                            <span aria-hidden="true">&laquo;</span>
                                        </a>
                                    </li>
                                @else
                                    <li class="page-item disabled">
                                        <a class="page-link" href="#" aria-label="Previous">
                                            <span aria-hidden="true">&laquo;</span>
                                        </a>
                                    </li>
                                @endif
                
                                <!-- Page Links -->
                                @for($i = 1; $i <= $totalPages; $i++)
                                    <li class="page-item {{ $i == $currentPage ? 'active' : '' }}">
                                        <a class="page-link" href="{{ route('tenant.notifications', ['page' => $i]) }}">
                                            {{ $i }}
                                        </a>
                                    </li>
                                @endfor
                
                                <!-- Next Page Link -->
                                @if($currentPage < $totalPages)
                                    <li class="page-item">
                                        <a class="page-link" href="{{ route('tenant.notifications', ['page' => $currentPage + 1]) }}" aria-label="Next">
                                            <span aria-hidden="true">&raquo;</span>
                                        </a>
                                    </li>
                                @else
                                    <li class="page-item disabled">
                                        <a class="page-link" href="#" aria-label="Next">
                                            <span aria-hidden="true">&raquo;</span>
                                        </a>
                                    </li>
                                @endif
                            </ul>
                        </nav>
                    </div>
                @endif
            @else
                <div class="text-center py-5">
                    <i class="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                    <h4>No notifications</h4>
                    <p class="text-muted">You don't have any notifications at this time.</p>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection

@section('styles')
<style>
    .notification-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }
    
    .notification-action-buttons .btn {
        margin-right: 5px;
    }
</style>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Handle refresh button
        document.getElementById('refresh-notifications').addEventListener('click', function() {
            window.location.reload();
        });
    });
</script>
@endsection
