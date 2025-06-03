@extends('layouts.app')

@section('title', 'Login Success')

@section('styles')
<style>
    .success-container {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .success-container h1 {
        color: #2c974b;
        margin-bottom: 1.5rem;
        text-align: center;
    }
    .success-message {
        padding: 1rem;
        background-color: #f0fff4;
        border-radius: 0.375rem;
        border-left: 4px solid #2c974b;
        margin-bottom: 1.5rem;
    }
    .token-display {
        background-color: #f8f9fa;
        padding: 0.75rem;
        border-radius: 0.375rem;
        overflow-x: auto;
        margin-bottom: 1rem;
        font-family: monospace;
        font-size: 0.875rem;
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
        margin-right: 1rem;
    }
    .btn-primary:hover {
        background-color: #0e6cc5;
    }
    .debug-section {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 0.375rem;
    }
    .debug-section h2 {
        font-size: 1.25rem;
        margin-bottom: 0.75rem;
        color: #4a5568;
    }
    .debug-section pre {
        background-color: #edf2f7;
        padding: 0.75rem;
        border-radius: 0.375rem;
        overflow: auto;
        max-height: 300px;
    }
</style>
@endsection

@section('content')
<div class="success-container">
    <h1>Login Successful</h1>
    
    <div class="success-message">
        <p>You have been successfully authenticated. Your session now contains the authentication token.</p>
    </div>
    
    @if(isset($token))
    <h2>Authentication Token</h2>
    <div class="token-display">{{ $token }}</div>
    @endif
    
    <div style="display: flex; margin-top: 1.5rem;">
        <a href="{{ route('landing') }}" class="btn-primary">Go to Home</a>
        <a href="{{ route('tenant.dashboard') }}" class="btn-primary">Go to Dashboard</a>
    </div>
    
    @if(isset($tenant))
    <div class="debug-section">
        <h2>Tenant Information</h2>
        <pre>{{ json_encode($tenant, JSON_PRETTY_PRINT) }}</pre>
    </div>
    @endif
    
    @if(isset($response))
    <div class="debug-section">
        <h2>Full Response</h2>
        <pre>{{ json_encode($response, JSON_PRETTY_PRINT) }}</pre>
    </div>
    @endif
</div>
@endsection
