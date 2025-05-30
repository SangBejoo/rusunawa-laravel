# Rusunawa Tenant Portal

A Laravel web application providing a user-friendly interface for tenants to manage their bookings, payments, and documents in the Rusunawa dormitory system.

## Features

- User authentication (login, register, password reset)
- Profile management
- Room browsing and booking
- Document management
- Payment processing
- Issue reporting and maintenance requests
- Notifications system
- Waiting list management

## Requirements

- PHP 8.1 or higher
- Composer
- MySQL database
- Node.js and NPM (for asset compilation)

## Installation

1. Clone the repository:
   ```
   git clone https://your-repository-url/rusunawaaaaaaaaaaaaa/tenant-portal.git
   cd tenant-portal
   ```

2. Install PHP dependencies:
   ```
   composer install
   ```

3. Create and set up the environment file:
   ```
   cp .env.example .env
   php artisan key:generate
   ```

4. Configure the `.env` file with your database credentials and API connection details:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=rusunawa_tenant
   DB_USERNAME=root
   DB_PASSWORD=

   SERVICES_API_URL=http://localhost:8001
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

5. Run database migrations (if local authentication is needed):
   ```
   php artisan migrate
   ```

6. Start the development server:
   ```
   php artisan serve
   ```

7. Access the application at `http://localhost:8000`

## API Connection

This application connects to a Golang backend API that manages the core business logic. The API client is set up to communicate with the backend services defined in the proto contract.

To modify API endpoints or add new functionality, refer to the service classes in the `app/Services` directory.

## Directory Structure

- `app/Http/Controllers`: Contains all controllers for handling HTTP requests
- `app/Http/Middleware`: Custom middleware including tenant authentication
- `app/Services`: API client services for connecting to the backend
- `resources/views`: Blade template files
- `public/css` and `public/js`: Custom assets for styling and interactivity
- `routes/web.php`: Web routes definition

## Contributing

1. Create a feature branch
2. Implement your changes
3. Submit a pull request

## License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.
