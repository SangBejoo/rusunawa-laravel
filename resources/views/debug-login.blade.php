<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Debug Login</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        Debug Login Form
                    </div>
                    <div class="card-body">
                        @if(session('error'))
                            <div class="alert alert-danger">
                                {{ session('error') }}
                            </div>
                        @endif
                        
                        @if(session('success'))
                            <div class="alert alert-success">
                                {{ session('success') }}
                            </div>
                        @endif
                        
                        <form action="{{ route('tenant.login.submit') }}" method="POST">
                            @csrf
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" name="email" value="test12@example.com">
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" class="form-control" id="password" name="password" value="P@ssw0rd123">
                            </div>
                            <button type="submit" class="btn btn-primary">Login</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        Debug Information
                    </div>
                    <div class="card-body">
                        <h5>Session Data</h5>
                        <pre>{{ var_export(session()->all(), true) }}</pre>
                        
                        <h5>Cookie Data</h5>
                        <pre>{{ var_export($_COOKIE, true) }}</pre>
                        
                        <h5>Authentication Status</h5>
                        <pre>Session has tenant_token: {{ session()->has('tenant_token') ? 'Yes' : 'No' }}</pre>
                        <pre>Session has tenant_data: {{ session()->has('tenant_data') ? 'Yes' : 'No' }}</pre>
                        
                        <h5>CSRF Token</h5>
                        <pre>{{ csrf_token() }}</pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Display localStorage data
        document.addEventListener('DOMContentLoaded', function() {
            const cardBody = document.querySelector('.card-body:last-child');
            
            const h5 = document.createElement('h5');
            h5.textContent = 'Local Storage Data';
            cardBody.appendChild(h5);
            
            const pre = document.createElement('pre');
            try {
                const data = {
                    tenant_token: localStorage.getItem('tenant_token') ? 'Present (length: ' + localStorage.getItem('tenant_token').length + ')' : 'Not found',
                    tenant_data: localStorage.getItem('tenant_data') ? 'Present (parsed: ' + (JSON.parse(localStorage.getItem('tenant_data')) ? 'Valid JSON' : 'Invalid JSON') + ')' : 'Not found'
                };
                pre.textContent = JSON.stringify(data, null, 2);
            } catch (e) {
                pre.textContent = 'Error accessing localStorage: ' + e.message;
            }
            cardBody.appendChild(pre);
        });
    </script>
</body>
</html>
