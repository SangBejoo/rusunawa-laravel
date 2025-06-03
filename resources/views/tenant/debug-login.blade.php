@extends('layouts.app')

@section('title', 'Debug Login')

@section('styles')
<style>
    .debug-login-container {
        max-width: 500px;
        margin: 2rem auto;
        padding: 2rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .debug-login-container h1 {
        color: #1c85e8;
        margin-bottom: 1.5rem;
        text-align: center;
    }
    .form-group {
        margin-bottom: 1rem;
    }
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }
    .form-group input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
    }
    .btn-primary {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background-color: #1c85e8;
        color: white;
        border: none;
        border-radius: 0.375rem;
        font-weight: 600;
        cursor: pointer;
        text-align: center;
        text-decoration: none;
    }
    .btn-primary:hover {
        background-color: #0e6cc5;
    }
    .error-message {
        color: #e53e3e;
        margin-top: 1rem;
        padding: 0.75rem;
        background-color: #fff5f5;
        border-radius: 0.375rem;
        border-left: 4px solid #e53e3e;
    }
    .debug-info {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 0.375rem;
        font-size: 0.875rem;
    }
    .debug-info h2 {
        font-size: 1.25rem;
        margin-bottom: 0.75rem;
    }
    .debug-info table {
        width: 100%;
        border-collapse: collapse;
    }
    .debug-info table th, .debug-info table td {
        padding: 0.5rem;
        border: 1px solid #e2e8f0;
        text-align: left;
    }
    .debug-info table th {
        background-color: #f1f5f9;
    }
</style>
@endsection

@section('content')
<div class="debug-login-container">
    <h1>Debug Login</h1>
    
    @if($errors->any())
    <div class="error-message">
        {{ $errors->first('login_error') ?: $errors->first() }}
    </div>
    @endif
    
    <form method="POST" action="{{ route('tenant.debug.login.submit') }}">
        @csrf
        
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" value="{{ old('email') }}" required>
        </div>
        
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <button type="submit" class="btn-primary">Sign In</button>
            <a href="{{ route('tenant.login') }}" style="color: #1c85e8; text-decoration: none;">
                Regular Login Page
            </a>
        </div>
    </form>
    
    <div class="debug-info">
        <h2>Debug Information</h2>
        <table>
            <tr>
                <th>Item</th>
                <th>Value</th>
            </tr>
            <tr>
                <td>Session ID</td>
                <td>{{ session()->getId() }}</td>
            </tr>
            <tr>
                <td>API Mock Mode</td>
                <td>{{ env('API_MOCK_ENABLED') ? 'Enabled' : 'Disabled' }}</td>
            </tr>
            <tr>
                <td>API Base URL</td>
                <td>{{ env('API_BASE_URL') }}</td>
            </tr>
            <tr>
                <td>Tenant Token</td>
                <td>{{ session('tenant_token') ? 'Present' : 'Not present' }}</td>
            </tr>
        </table>
        
        @if(session('response_debug'))
        <h3 style="margin-top: 1rem;">Last Response</h3>
        <pre style="background: #f1f5f9; padding: 0.75rem; overflow: auto; max-height: 300px;">{{ json_encode(session('response_debug'), JSON_PRETTY_PRINT) }}</pre>
        @endif
    </div>
</div>
@endsection
