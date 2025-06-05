<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Configure API services
        $this->app->singleton('api.url', function ($app) {
            return config('services.api.url', 'http://localhost:8003');
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in production
        if($this->app->environment('production')) {
            URL::forceScheme('https');
        }
        
        // Set default string length for database migrations
        Schema::defaultStringLength(191);
        
        // Add validation rules
        \Validator::extend('phone', function ($attribute, $value, $parameters, $validator) {
            return preg_match('/^([0-9\s\-\+\(\)]*)$/', $value);
        });
    }
}
