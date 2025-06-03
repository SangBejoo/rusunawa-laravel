<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

// Debug routes
Route::get('/tenant/login-direct', function() {
    Log::info('Direct login route accessed');
    return view('tenant.login');
});

// Debug route for login information
Route::get('/tenant/login-debug', function () {
    Log::info('Login debug route accessed', [
        'url' => request()->fullUrl(),
        'method' => request()->method(),
        'path' => request()->path(),
        'session_id' => session()->getId(),
        'has_tenant_token' => session()->has('tenant_token'),
        'session_data' => session()->all()
    ]);
    
    return redirect('/tenant/login');
});
