<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title') - Rusunawa Tenant Portal</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        body {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        main {
            flex: 1;
        }
        
        .sidebar {
            min-height: calc(100vh - 56px);
            box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1);
        }
        
        .sidebar .nav-link {
            color: #333;
            padding: .75rem 1rem;
            font-weight: 500;
        }
        
        .sidebar .nav-link.active {
            color: #007bff;
            background-color: rgba(0, 123, 255, .1);
        }
        
        .sidebar .nav-link:hover {
            background-color: rgba(0, 0, 0, .05);
        }
    </style>
    
    @yield('styles')
</head>
<body>
    <!-- Main content -->
    <main class="py-4">
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-white text-center py-3">
        <div class="container">
            <p class="mb-0">&copy; {{ date('Y') }} Rusunawa. All rights reserved.</p>
        </div>
    </footer>

    <!-- Bootstrap Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    
    @yield('scripts')
</body>
</html>
@extends('layouts.app')

@section('content')
<div class="container py-4">
    <div class="row">
        <!-- Sidebar for tenant section -->
        <div class="col-md-3 mb-4">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <strong>Tenant Portal</strong>
                </div>
                <div class="list-group list-group-flush">
                    <a href="{{ route('tenant.dashboard') }}" class="list-group-item list-group-item-action {{ request()->routeIs('tenant.dashboard') ? 'active bg-light' : '' }}">
                        <i class="fas fa-tachometer-alt fa-fw me-2"></i> Dashboard
                    </a>
                    <a href="{{ route('tenant.profile') }}" class="list-group-item list-group-item-action {{ request()->routeIs('tenant.profile') ? 'active bg-light' : '' }}">
                        <i class="fas fa-user-circle fa-fw me-2"></i> My Profile
                    </a>
                    <a href="{{ route('tenant.bookings') }}" class="list-group-item list-group-item-action {{ request()->routeIs('tenant.bookings') ? 'active bg-light' : '' }}">
                        <i class="fas fa-calendar-check fa-fw me-2"></i> My Bookings
                    </a>
                    <a href="{{ route('tenant.invoices') }}" class="list-group-item list-group-item-action {{ request()->routeIs('tenant.invoices') ? 'active bg-light' : '' }}">
                        <i class="fas fa-file-invoice fa-fw me-2"></i> My Invoices
                    </a>
                    <a href="{{ route('tenant.payments') }}" class="list-group-item list-group-item-action {{ request()->routeIs('tenant.payments') ? 'active bg-light' : '' }}">
                        <i class="fas fa-money-bill fa-fw me-2"></i> Payments History
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Main content area -->
        <div class="col-md-9">
            @yield('tenant-content')
        </div>
    </div>
</div>
@endsection
