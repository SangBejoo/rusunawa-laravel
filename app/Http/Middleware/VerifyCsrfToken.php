<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // If needed for testing, you could exclude login temporarily
        // '/tenant/login', 
        
        // API routes are typically excluded
        'api/*',
        
        // Exclude external API proxy routes if needed
        '/v1/*'
    ];
}
