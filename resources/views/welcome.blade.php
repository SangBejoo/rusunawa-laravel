@extends('layouts.app')

@section('title', 'Welcome')

@section('content')
<div class="px-4 py-5 my-5 text-center">
    <h1 class="display-4 fw-bold text-primary">Welcome to Rusunawa Tenant Portal</h1>
    <div class="col-lg-8 mx-auto">
        <p class="lead mb-4">
            Manage your room bookings, payments, and documents all in one place.
            Our portal makes it easy to stay connected with your housing needs.
        </p>
        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
            @guest
                <a href="{{ route('tenant.login') }}" class="btn btn-primary btn-lg px-4 gap-3">
                    <i class="fas fa-sign-in-alt me-2"></i> Login
                </a>
                <a href="{{ route('tenant.register') }}" class="btn btn-outline-secondary btn-lg px-4">
                    <i class="fas fa-user-plus me-2"></i> Register
                </a>
            @else
                <a href="{{ route('tenant.dashboard') }}" class="btn btn-primary btn-lg px-4 gap-3">
                    <i class="fas fa-tachometer-alt me-2"></i> Go to Dashboard
                </a>
                <a href="{{ route('tenant.rooms') }}" class="btn btn-success btn-lg px-4">
                    <i class="fas fa-search me-2"></i> Browse Available Rooms
                </a>
            @endguest
        </div>
    </div>
</div>

<div class="container px-4 py-5" id="featured-3">
    <h2 class="pb-2 border-bottom">Features</h2>
    <div class="row g-4 py-5 row-cols-1 row-cols-lg-3">
        <div class="feature col">
            <div class="feature-icon bg-primary bg-gradient p-2 rounded-3 mb-3">
                <i class="fas fa-door-open text-white fa-2x p-2"></i>
            </div>
            <h3>Room Booking</h3>
            <p>Browse available rooms, check amenities, and book the perfect accommodation for your needs.</p>
        </div>
        <div class="feature col">
            <div class="feature-icon bg-primary bg-gradient p-2 rounded-3 mb-3">
                <i class="fas fa-file-invoice-dollar text-white fa-2x p-2"></i>
            </div>
            <h3>Easy Payments</h3>
            <p>Manage your invoices and make payments online through our secure payment gateway.</p>
        </div>
        <div class="feature col">
            <div class="feature-icon bg-primary bg-gradient p-2 rounded-3 mb-3">
                <i class="fas fa-file-alt text-white fa-2x p-2"></i>
            </div>
            <h3>Document Management</h3>
            <p>Upload and manage your required documents easily through our document management system.</p>
        </div>
    </div>
</div>

<div class="container px-4 py-5">
    <h2 class="pb-2 border-bottom">How It Works</h2>
    <div class="row g-4 py-5">
        <div class="col-md-12">
            <div class="steps">
                <div class="step-item">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Create an Account</h4>
                        <p>Register with your email and complete your profile information.</p>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Browse Available Rooms</h4>
                        <p>Explore our available rooms and find one that fits your needs.</p>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Book and Pay</h4>
                        <p>Submit your booking request and make payment online.</p>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h4>Move In</h4>
                        <p>Receive your confirmation and get ready to move into your new accommodation.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('styles')
<style>
    .steps {
        position: relative;
        padding-left: 45px;
    }
    
    .steps:before {
        content: "";
        position: absolute;
        left: 15px;
        top: 5px;
        bottom: 5px;
        width: 2px;
        background-color: #dee2e6;
    }
    
    .step-item {
        position: relative;
        padding-bottom: 30px;
    }
    
    .step-number {
        position: absolute;
        left: -45px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #0d6efd;
        color: white;
        text-align: center;
        line-height: 30px;
        font-weight: bold;
    }
    
    .feature-icon {
        width: 4rem;
        height: 4rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
</style>
@endsection
