<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Rusunawa - Student Housing Portal')</title>
    
    <!-- Favicon -->
    <link rel="icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">
      <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Styles -->
    @vite(['public/css/app.css'])
    
    <!-- Additional styles -->
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
    
    <!-- Scripts -->
    <script>
        // Global configuration for JavaScript
        window._config = {
            apiBaseUrl: "{{ config('app.golang_api_url', 'http://localhost:8001') }}",
            csrfToken: "{{ csrf_token() }}"
        };
    </script>
</head>
<body>
    <div id="app">
        @yield('content')
    </div>
    
    @yield('scripts')
</body>
</html>
