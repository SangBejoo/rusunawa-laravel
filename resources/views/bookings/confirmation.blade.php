@extends('layouts.app')

@section('title', 'Booking Confirmation')

@section('content')
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="card border-success">
                <div class="card-header bg-success text-white">
                    <h4 class="mb-0">Booking Confirmed!</h4>
                </div>
                <div class="card-body">
                    <div class="text-center mb-4">
                        <i class="fas fa-check-circle text-success" style="font-size: 5rem;"></i>
                        <h2 class="mt-3">Thank You for Your Booking</h2>
                        <p class="text-muted">Your booking has been successfully submitted.</p>
                        <p>Booking ID: <strong>{{ $booking['bookingId'] }}</strong></p>
                    </div>
                    
                    <div class="alert alert-info">
                        <h5>Next Steps:</h5>
                        <ol class="mb-0">
                            <li>Please complete your payment to confirm the booking.</li>
                            <li>You'll receive a confirmation email with booking details.</li>
                            <li>You can view or manage your booking in your account dashboard.</li>
                        </ol>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header bg-light">
                            <h5 class="mb-0">Booking Details</h5>
                        </div>
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <p class="mb-1 text-muted">Room:</p>
                                    <p class="fw-bold">{{ $booking['room']['name'] ?? 'Room #' . $booking['roomId'] }}</p>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-1 text-muted">Status:</p>
                                    <span class="badge bg-{{ $booking['status'] == 'CONFIRMED' ? 'success' : ($booking['status'] == 'PENDING' ? 'warning' : 'primary') }}">
                                        {{ $booking['status'] }}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <p class="mb-1 text-muted">Check-in Date:</p>
                                    <p class="fw-bold">{{ \Carbon\Carbon::parse($booking['startDate'])->format('D, M d, Y') }}</p>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-1 text-muted">Check-out Date:</p>
                                    <p class="fw-bold">{{ \Carbon\Carbon::parse($booking['endDate'])->format('D, M d, Y') }}</p>
                                </div>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <p class="mb-1 text-muted">Number of Guests:</p>
                                    <p class="fw-bold">{{ $booking['guests'] ?? 1 }}</p>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-1 text-muted">Booking Date:</p>
                                    <p class="fw-bold">{{ \Carbon\Carbon::parse($booking['createdAt'])->format('D, M d, Y H:i') }}</p>
                                </div>
                            </div>
                            
                            @if(isset($booking['notes']) && !empty($booking['notes']))
                            <div class="row mb-3">
                                <div class="col-12">
                                    <p class="mb-1 text-muted">Special Requests:</p>
                                    <p>{{ $booking['notes'] }}</p>
                                </div>
                            </div>
                            @endif
                            
                            @if(isset($booking['invoice']))
                            <hr class="my-4">
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <p class="mb-1 text-muted">Total Amount:</p>
                                    <h4 class="text-primary">Rp {{ number_format($booking['invoice']['amount'] ?? 0, 0, ',', '.') }}</h4>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-1 text-muted">Payment Status:</p>
                                    <span class="badge bg-{{ $booking['invoice']['status'] == 'PAID' ? 'success' : 'warning' }}">
                                        {{ $booking['invoice']['status'] }}
                                    </span>
                                </div>
                            </div>
                            
                            @if($booking['invoice']['status'] != 'PAID')
                            <div class="mt-3">
                                <p class="mb-1 text-muted">Payment Due:</p>
                                <p>{{ \Carbon\Carbon::parse($booking['invoice']['dueDate'])->format('D, M d, Y') }}</p>
                            </div>
                            @endif
                            @endif
                        </div>
                    </div>
                    
                    <div class="d-grid gap-2 d-md-flex justify-content-md-between">
                        @if(isset($booking['invoice']) && $booking['invoice']['status'] != 'PAID')
                            <a href="{{ route('payment', ['booking_id' => $booking['bookingId']]) }}" class="btn btn-success">
                                <i class="fas fa-credit-card me-2"></i> Pay Now
                            </a>
                        @endif
                        <a href="{{ route('tenant.bookings') }}" class="btn btn-primary">
                            <i class="fas fa-list me-2"></i> View All Bookings
                        </a>
                        <a href="{{ route('rooms') }}" class="btn btn-outline-primary">
                            <i class="fas fa-search me-2"></i> Browse More Rooms
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
