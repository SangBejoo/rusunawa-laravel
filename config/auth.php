<?php

return [
    'defaults' => [
        'guard' => 'web',
        'passwords' => 'users',
    ],

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],

        'api' => [
            'driver' => 'token',
            'provider' => 'users',
            'hash' => false,
        ],

        'tenant' => [
            'driver' => 'session',
            'provider' => 'tenants',
        ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],

        'tenants' => [
            'driver' => 'eloquent',
            'model' => App\Models\Tenant::class,
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_resets',
            'expire' => 60,
            'throttle' => 60,
        ],

        'tenants' => [
            'provider' => 'tenants',
            'table' => 'tenant_password_resets',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_confirm' => [
        'timeout' => 300,
    ],
];