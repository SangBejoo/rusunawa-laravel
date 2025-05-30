<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\ApiClient;
use App\Services\TenantAuthService;
use App\Services\BookingService;
use App\Services\DocumentService;
use App\Services\PaymentService;
use App\Services\NotificationService;
use App\Services\IssueService;
use App\Services\TenantService;

class ApiServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register the base API client
        $this->app->singleton(ApiClient::class, function ($app) {
            return new ApiClient();
        });
        
        // Register all service classes
        $this->app->singleton(TenantAuthService::class, function ($app) {
            return new TenantAuthService();
        });
        
        $this->app->singleton(BookingService::class, function ($app) {
            return new BookingService();
        });
        
        $this->app->singleton(DocumentService::class, function ($app) {
            return new DocumentService();
        });
        
        $this->app->singleton(PaymentService::class, function ($app) {
            return new PaymentService();
        });
        
        $this->app->singleton(NotificationService::class, function ($app) {
            return new NotificationService();
        });
        
        $this->app->singleton(IssueService::class, function ($app) {
            return new IssueService();
        });
        
        $this->app->singleton(TenantService::class, function ($app) {
            return new TenantService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
