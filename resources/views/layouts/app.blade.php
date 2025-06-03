<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title') - Rusunawa</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Custom CSS for navbar positioning -->
    <style>
        body {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            padding-top: 0 !important; /* Remove any padding */
            margin-top: 0 !important;  /* Remove any margin */
        }
        
        #navbar-root {
            position: sticky;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
        }
        
        /* Fix main content positioning */
        main {
            flex: 1;
            padding-top: 0; /* Remove padding to ensure navbar is flush with top */
        }
        
        /* Make sure there's no space between navbar and content */
        .container-fluid, .container {
            padding-top: 0;
        }
    </style>
    
    @yield('styles')
    
    <!-- Vite Assets -->
    @vite(['public/css/app.css'])
</head>
<body>
    <!-- React Navbar will be mounted here -->
    <div id="navbar-root"></div>

    <!-- Main content -->
    <main class="flex-grow-1">
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4 mt-5">
        <div class="container">
            <div class="row">
                <div class="col-md-4 mb-3 mb-md-0">
                    <h5>Rusunawa</h5>
                    <p class="text-muted">Affordable, comfortable, and convenient student housing.</p>
                </div>
                <div class="col-md-4 mb-3 mb-md-0">
                    <h5>Quick Links</h5>
                    <ul class="list-unstyled">
                        <li><a href="{{ route('landing') }}" class="text-decoration-none text-muted">Home</a></li>
                        <li><a href="{{ route('rooms') }}" class="text-decoration-none text-muted">Rooms</a></li>
                        <li><a href="{{ route('about') }}" class="text-decoration-none text-muted">About</a></li>
                        <li><a href="{{ route('contact') }}" class="text-decoration-none text-muted">Contact</a></li>
                    </ul>
                </div>
                <div class="col-md-4">
                    <h5>Contact Us</h5>
                    <address class="text-muted">
                        <i class="fas fa-map-marker-alt fa-fw me-1"></i> 123 University Street<br>
                        <i class="fas fa-phone fa-fw me-1"></i> (123) 456-7890<br>
                        <i class="fas fa-envelope fa-fw me-1"></i> info@rusunawa.com
                    </address>
                </div>
            </div>
            <div class="border-top border-secondary pt-3 mt-3 text-center">
                <p class="mb-0">&copy; {{ date('Y') }} Rusunawa. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Bootstrap Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- React dependencies -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
    
    <!-- Load navbar component -->
    @vite(['public/js/navbar-loader.jsx'])
    
    <!-- Make sure navbars are refreshed when the page loads -->
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof window.loadNavbar === 'function') {
            setTimeout(window.loadNavbar, 100);
        }
    });
    </script>
    
    @yield('scripts')
</body>
</html>
