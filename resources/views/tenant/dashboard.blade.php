@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
<div class="container">
    <h1 class="mb-4">
        <i class="fas fa-tachometer-alt me-2"></i> Dashboard
    </h1>
    
    <div class="row">
        <div class="col-lg-8">
            <!-- Welcome Card -->
            <div class="card shadow mb-4">
                <div class="card-body">
                    <h4>Welcome, {{ $tenant['user']['full_name'] ?? 'Tenant' }}!</h4>
                    <p>
                        @if(!empty($bookings))
                            You currently have {{ count($bookings) }} active bookings.
                        @else
                            You currently have no active bookings.
                            <a href="{{ route('tenant.rooms') }}" class="btn btn-sm btn-primary mt-2">
                                <i class="fas fa-search me-1"></i> Browse Rooms
                            </a>
                        @endif
                    </p>
                </div>
            </div>
            
            <!-- Active Bookings -->
            <div class="card shadow mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-calendar-check me-2"></i> Recent Bookings
                    </h5>
                </div>
                <div class="card-body">
                    @if(!empty($bookings))
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Room</th>
                                        <th>Check In</th>
                                        <th>Check Out</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($bookings as $booking)
                                        <tr>
                                            <td>{{ $booking['room']['name'] }}</td>
                                            <td>{{ date('d M Y', strtotime($booking['start_date'])) }}</td>
                                            <td>{{ date('d M Y', strtotime($booking['end_date'])) }}</td>
                                            <td>
                                                @if($booking['status'] == 'pending')
                                                    <span class="badge bg-warning">Pending</span>
                                                @elseif($booking['status'] == 'approved')
                                                    <span class="badge bg-success">Approved</span>
                                                @elseif($booking['status'] == 'rejected')
                                                    <span class="badge bg-danger">Rejected</span>
                                                @elseif($booking['status'] == 'cancelled')
                                                    <span class="badge bg-secondary">Cancelled</span>
                                                @else
                                                    <span class="badge bg-info">{{ ucfirst($booking['status']) }}</span>
                                                @endif
                                            </td>
                                            <td>
                                                <a href="{{ route('tenant.booking.detail', $booking['booking_id']) }}" 
                                                   class="btn btn-sm btn-info">
                                                    <i class="fas fa-eye"></i> View
                                                </a>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                        <a href="{{ route('tenant.bookings') }}" class="btn btn-outline-primary">
                            <i class="fas fa-list me-1"></i> View All Bookings
                        </a>
                    @else
                        <div class="text-center py-4">
                            <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                            <p class="mb-0">You don't have any recent bookings.</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
        
        <div class="col-lg-4">
            <!-- Pending Payments -->
            <div class="card shadow mb-4">
                <div class="card-header bg-warning text-dark">
                    <h5 class="mb-0">
                        <i class="fas fa-file-invoice-dollar me-2"></i> Pending Payments
                    </h5>
                </div>
                <div class="card-body">
                    @if(!empty($invoices))
                        <ul class="list-group">
                            @foreach($invoices as $invoice)
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <span class="fw-bold">{{ $invoice['invoice_no'] }}</span>
                                        <br>
                                        <small class="text-muted">
                                            Due: {{ date('d M Y', strtotime($invoice['due_date'])) }}
                                        </small>
                                    </div>
                                    <div>
                                        <span class="badge bg-primary rounded-pill">{{ 'Rp ' . number_format($invoice['amount'], 0, ',', '.') }}</span>
                                        <a href="{{ route('tenant.invoice.show', $invoice['invoice_id']) }}" 
                                           class="btn btn-sm btn-success ms-2">Pay</a>
                                    </div>
                                </li>
                            @endforeach
                        </ul>
                        <a href="{{ route('tenant.invoices') }}" class="btn btn-outline-warning w-100 mt-3">
                            <i class="fas fa-list me-1"></i> View All Invoices
                        </a>
                    @else
                        <div class="text-center py-4">
                            <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                            <p class="mb-0">You have no pending payments.</p>
                        </div>
                    @endif
                </div>
            </div>
            
            <!-- Notifications -->
            <div class="card shadow mb-4">
                <div class="card-header bg-info text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-bell me-2"></i> Recent Notifications
                    </h5>
                </div>
                <div class="card-body">
                    @if(!empty($notifications))
                        <div class="list-group">
                            @foreach($notifications as $notification)
                                <a href="#" class="list-group-item list-group-item-action">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">{{ $notification['notification_type']['name'] }}</h6>
                                        <small>{{ \Carbon\Carbon::parse($notification['created_at'])->diffForHumans() }}</small>
                                    </div>
                                    <p class="mb-1">{{ $notification['content'] }}</p>
                                </a>
                            @endforeach
                        </div>
                        <a href="{{ route('tenant.notifications') }}" class="btn btn-outline-info w-100 mt-3">
                            <i class="fas fa-list me-1"></i> View All Notifications
                        </a>
                    @else
                        <div class="text-center py-4">
                            <i class="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                            <p class="mb-0">You have no recent notifications.</p>
                        </div>
                    @endif
                </div>
            </div>
            
            <!-- Quick Links -->
            <div class="card shadow">
                <div class="card-header bg-secondary text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-link me-2"></i> Quick Links
                    </h5>
                </div>
                <div class="card-body">
                    <div class="list-group">
                        <a href="{{ route('tenant.profile') }}" class="list-group-item list-group-item-action">
                            <i class="fas fa-user me-2"></i> Update Profile
                        </a>
                        <a href="{{ route('tenant.documents') }}" class="list-group-item list-group-item-action">
                            <i class="fas fa-file-alt me-2"></i> Manage Documents
                        </a>
                        <a href="{{ route('tenant.issues') }}" class="list-group-item list-group-item-action">
                            <i class="fas fa-exclamation-circle me-2"></i> Report an Issue
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Distance Picker Root -->
    <div id="distance-picker-root"></div>
    @vite(['public/js/DistancePicker.jsx'])
</div>
@endsection

@push('scripts')
<script type="module" src="{{ asset('build/js/app.js') }}"></script>
@endpush
