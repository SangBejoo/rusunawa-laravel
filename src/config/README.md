# Centralized API Configuration

This project now uses a centralized API configuration system to manage all API URLs and endpoints.

## Configuration Files

### 1. Main Configuration (`src/config/apiConfig.js`)
This is the primary configuration file that contains:
- Base API URLs
- All API endpoints organized by feature
- Helper functions for building URLs
- Authentication headers management
- Error formatting utilities

### 2. API Client (`src/config/apiClient.js`)
A centralized axios client with:
- Pre-configured base URL and headers
- Request/response interceptors
- Authentication handling
- Structured API service classes for different features

### 3. Environment Variables
Set in `.env` file:
```
REACT_APP_API_URL=https://qtd9x9cp-8001.asse.devtunnels.ms
VITE_API_BASE_URL=https://qtd9x9cp-8001.asse.devtunnels.ms/v1
API_BASE_URL=https://qtd9x9cp-8001.asse.devtunnels.ms/v1
```

## Usage

### Using API Service Classes (Recommended)
```javascript
import { BookingAPI, TenantAPI } from '@config/apiClient';

// Get bookings
const bookings = await BookingAPI.getBookings();

// Get tenant profile
const profile = await TenantAPI.getProfile();
```

### Using Raw API Client
```javascript
import { apiClient, API_ENDPOINTS } from '@config/apiClient';

const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.BASE);
```

### Using Configuration Only
```javascript
import { buildApiUrl, API_ENDPOINTS } from '@config/apiConfig';

const url = buildApiUrl(API_ENDPOINTS.BOOKINGS.BASE);
```

## Migration from Old System

Legacy files have been updated to import from the centralized configuration:
- `utils/env.js` - Now imports from centralized config
- `utils/config.js` - Deprecated, uses centralized config
- `utils/api.js` - Updated to use centralized config
- `resources/utils/apiConfig.js` - Updated with backward compatibility
- `config/apiConfig.js` - Updated to use centralized endpoints

## Authentication Persistence Fix

The authentication system has been improved to:
1. Store both token and tenant data in localStorage
2. Prevent automatic logout on page reload during network issues
3. Only clear authentication on actual 401/403 errors
4. Keep users logged in during temporary network problems

## URL Configuration

All API URLs now point to: `https://qtd9x9cp-8001.asse.devtunnels.ms`

To change the API URL, update the environment variables in `.env`:
```
REACT_APP_API_URL=your-new-api-url
VITE_API_BASE_URL=your-new-api-url/v1
API_BASE_URL=your-new-api-url/v1
```

## Benefits

1. **Single Source of Truth**: All API configuration in one place
2. **Type Safety**: Structured endpoints prevent typos
3. **Easy Maintenance**: Change URLs in one place
4. **Better Error Handling**: Centralized error formatting
5. **Authentication**: Automatic token management
6. **Backward Compatibility**: Legacy code still works
