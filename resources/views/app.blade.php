<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Rusunawa') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        
        <!-- Debug Styles -->
        <style>
            .loading-fallback {
                font-family: 'Figtree', sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 20px;
            }
            .loading-fallback h1 {
                margin-bottom: 20px;
                font-size: 2rem;
            }
            .loading-fallback .spinner {
                border: 4px solid rgba(255,255,255,0.3);
                border-top: 4px solid white;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 20px auto;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .debug-info {
                background: rgba(0,0,0,0.2);
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                font-size: 14px;
                max-width: 600px;
            }
        </style>
          <!-- Scripts and CSS -->
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        <script>
            // Polyfill for process.env to avoid 'process is not defined' error in browser
            window.process = window.process || { env: {} };
        </script>
    </head>
    <body class="font-sans antialiased">
        <div id="root">
            <!-- Fallback content while React loads -->
            <div class="loading-fallback">
                <h1>🚀 Rusunawa - University Housing</h1>
                <div class="spinner"></div>
                <p>Loading React Application...</p>
                
                <div class="debug-info">
                    <strong>Debug Information:</strong><br>
                    App Name: {{ config('app.name') }}<br>
                    Environment: {{ app()->environment() }}<br>
                    Debug Mode: {{ config('app.debug') ? 'ON' : 'OFF' }}<br>
                    Laravel Version: {{ app()->version() }}<br>
                    Current URL: <span id="current-url"></span><br>
                    Timestamp: {{ now()->format('Y-m-d H:i:s') }}
                </div>
                
                <div class="debug-info">
                    <strong>If this message persists:</strong><br>
                    1. Check browser console for JavaScript errors<br>
                    2. Ensure Vite dev server is running (npm run dev)<br>
                    3. Verify React components are loading correctly<br>
                    4. Check network tab for failed asset requests
                </div>
            </div>
        </div>
        
        <script>
            // Debug information
            console.log('🚀 Laravel + React App Starting...');
            console.log('App Environment:', '{{ app()->environment() }}');
            console.log('Debug Mode:', {{ config('app.debug') ? 'true' : 'false' }});
            console.log('CSRF Token:', '{{ csrf_token() }}');
            
            // Update current URL in debug info
            document.getElementById('current-url').textContent = window.location.href;
            
            // Monitor for React mounting
            let checkCount = 0;
            const maxChecks = 50; // Check for 10 seconds
            
            const checkReactMount = setInterval(() => {
                checkCount++;
                const rootElement = document.getElementById('root');
                const fallbackElement = document.querySelector('.loading-fallback');
                
                if (rootElement && !fallbackElement) {
                    console.log('✅ React app has mounted successfully!');
                    clearInterval(checkReactMount);
                } else if (checkCount >= maxChecks) {
                    console.error('❌ React app failed to mount after 10 seconds');
                    console.error('Root element:', rootElement);
                    console.error('Fallback still present:', !!fallbackElement);
                    clearInterval(checkReactMount);
                    
                    // Show error message
                    if (fallbackElement) {
                        const errorDiv = document.createElement('div');
                        errorDiv.style.cssText = 'background: rgba(255,0,0,0.2); padding: 15px; border-radius: 8px; margin-top: 20px;';
                        errorDiv.innerHTML = '<strong>❌ React failed to load</strong><br>Check browser console and network tab for errors.';
                        fallbackElement.appendChild(errorDiv);
                    }
                }
            }, 200); // Check every 200ms
            
            // Log any JavaScript errors
            window.addEventListener('error', function(e) {
                console.error('❌ JavaScript Error:', e.error);
            });
            
            // Log successful resource loads
            window.addEventListener('load', function() {
                console.log('✅ Page fully loaded');
            });
        </script>
    </body>
</html>
