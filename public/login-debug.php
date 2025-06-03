<?php
// Basic login form diagnostic
?>
<!DOCTYPE html>
<html>
<head>
    <title>Login Test</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        .debug-container {
            max-width: 800px;
            margin: 0 auto;
            background: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .debug-section {
            margin-bottom: 20px;
            padding: 15px;
            background: #fff;
            border-radius: 4px;
            border-left: 4px solid #1c85e8;
        }
        h1, h2 {
            color: #333;
        }
        h2 {
            margin-top: 0;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        pre {
            background: #f5f5f5;
            padding: 10px;
            overflow-x: auto;
            border-radius: 4px;
        }
        .btn {
            display: inline-block;
            background-color: #1c85e8;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 4px;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="debug-container">
        <h1>Login Page Diagnostic</h1>
        
        <div class="debug-section">
            <h2>Environment Information</h2>
            <p>Browser: <script>document.write(navigator.userAgent)</script></p>
            <p>URL: <script>document.write(window.location.href)</script></p>
            <p>Current Time: <script>document.write(new Date().toString())</script></p>
        </div>
        
        <div class="debug-section">
            <h2>Login Page Test</h2>
            <p>Test the login page with the following options:</p>
            <p>
                <a href="/tenant/login" class="btn">Normal Login</a>
                <a href="/tenant/login?t=<?php echo time(); ?>" class="btn">Login with Timestamp</a>
                <a href="/tenant/login?debug=1" class="btn">Login with Debug Mode</a>
            </p>
        </div>
        
        <div class="debug-section">
            <h2>Vite Diagnostic</h2>
            <p>Check if Vite assets are loading correctly:</p>
            <div id="vite-status">Checking Vite status...</div>
            
            <script>
                // Check if Vite dev server is running
                fetch('http://localhost:5173/@vite/client', { mode: 'no-cors' })
                    .then(() => {
                        document.getElementById('vite-status').innerHTML = 
                            '<p style="color:green">✓ Vite dev server is running at http://localhost:5173</p>';
                    })
                    .catch(() => {
                        document.getElementById('vite-status').innerHTML = 
                            '<p style="color:red">✗ Vite dev server is not running or not accessible</p>';
                    });
            </script>
        </div>
        
        <div class="debug-section">
            <h2>React Components Test</h2>
            <div id="react-test-root"></div>
            
            <script>
                // Simple React test
                document.getElementById('react-test-root').innerHTML = 
                    'Checking if React is working...';
                
                // This will be executed if React is properly loaded
                window.setTimeout(() => {
                    if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
                        document.getElementById('react-test-root').innerHTML = 
                            '<p style="color:green">✓ React is loaded and available globally</p>';
                    } else {
                        document.getElementById('react-test-root').innerHTML = 
                            '<p style="color:red">✗ React is not loaded or not available globally</p>';
                    }
                }, 1000);
            </script>
        </div>
    </div>
</body>
</html>
