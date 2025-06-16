<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test HTML</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
        .status {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Laravel + React Status Check</h1>
        
        <div class="status">
            <h2>✅ HTML Loading Successfully</h2>
            <p>This proves the Laravel server and routing are working!</p>
        </div>
        
        <div class="status">
            <h3>Next Steps:</h3>
            <ul style="text-align: left; max-width: 500px; margin: 0 auto;">
                <li>✅ Laravel server running</li>
                <li>✅ Routes working</li>
                <li>❓ React components loading</li>
                <li>❓ JavaScript executing</li>
            </ul>
        </div>
        
        <div id="root">
            <div class="status">
                <h3>🔍 React Mount Point</h3>
                <p>This div should be replaced by React if everything works</p>
            </div>
        </div>
    </div>
    
    <script>
        console.log('✅ Basic JavaScript is working!');
        console.log('📍 Current URL:', window.location.href);
        console.log('🔍 Looking for React mount point...');
        
        // Check if root element exists
        const rootElement = document.getElementById('root');
        if (rootElement) {
            console.log('✅ Root element found:', rootElement);
        } else {
            console.error('❌ Root element not found!');
        }
        
        // Log any JavaScript errors
        window.addEventListener('error', function(e) {
            console.error('❌ JavaScript Error:', e.error);
        });
        
        // Check for React
        setTimeout(() => {
            if (window.React) {
                console.log('✅ React is loaded!');
            } else {
                console.log('❌ React not found in window object');
            }
        }, 2000);
    </script>
</body>
</html>
