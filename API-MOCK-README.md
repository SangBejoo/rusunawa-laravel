# Rusunawa Application

This is a Laravel application that serves as a frontend for a Golang API backend for rusunawa management.

## API Integration

The application integrates with a Golang API backend. For development purposes, you can run the application with or without the API server.

### API Mock Mode

API Mock Mode allows you to develop and test the application without having to run the Golang API backend server. When enabled, the application will generate mock responses for API calls.

#### Enabling/Disabling API Mock Mode

You can toggle API mock mode using the provided command:

```bash
# Enable API mock mode (for development without the Golang API)
php artisan api:mock on

# Disable API mock mode (normal operation with Golang API)
php artisan api:mock off

# Check current API mock mode status
php artisan api:mock status
```

Or use the convenience script `toggle-mock-mode.bat` (Windows) for a simple menu interface.

#### How API Mock Mode Works

When API mock mode is enabled:

1. All API requests are intercepted by the `ApiClient` class
2. Instead of making real HTTP requests, the application generates appropriate mock responses
3. The frontend displays a warning banner indicating that API mock mode is active
4. Registration and login will appear to work, but no real data is being stored in the backend

This is useful for:
- Frontend development when the API team is not available
- Testing the application's resilience to API failures
- Developing without running all backend services

### Running with the Real API

To use the real Golang API:

1. Make sure the Golang API server is running (typically on port 8001)
2. Disable API mock mode: `php artisan api:mock off`
3. Set the correct API URL in your `.env` file:
   ```
   API_BASE_URL=http://localhost:8003
   API_TIMEOUT=30
   API_MOCK_ENABLED=false
   ```

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   composer install
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your environment
4. Build frontend assets:
   ```
   npm run dev
   ```
5. Run the Laravel development server:
   ```
   php artisan serve
   ```

## Testing

The application provides helpful tools for testing different scenarios:

- Toggle API mock mode to test with/without the API
- Use the health check endpoint (`/api/health-check`) to verify API connectivity
- Frontend components will show connection status warnings when the API is unreachable

## Troubleshooting

### API Connection Issues

If you encounter API connection problems:

1. Check if the Golang API server is running
2. Verify your `.env` settings for `API_BASE_URL`
3. Use API mock mode for development if needed: `php artisan api:mock on`
4. Check the Laravel logs in `storage/logs/laravel.log` for API communication errors
