# API Centralization Migration Guide

## Overview

All API URLs and configurations have been centralized into `src/config/apiConfig.js` and `src/config/apiClient.js`. This provides:

- Single source of truth for all API endpoints
- Consistent error handling
- Automatic authentication token injection
- Type-safe API methods

## Key Files

### 1. `src/config/apiConfig.js`
Contains all API configuration, endpoints, and helper functions.

### 2. `src/config/apiClient.js`
Pre-configured axios client with API service classes for each domain.

## Migration Steps

### For Service Files

**Before:**
```javascript
import axios from 'axios';
import { API_BASE_URL } from '../../utils/apiConfig';

const API_URL = `${API_BASE_URL}/bookings`;

const response = await axios.get(`${API_URL}/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

**After:**
```javascript
import { BookingAPI } from '../../src/config/apiClient';

const response = await BookingAPI.getBooking(id);
```

### For React Components

**Before:**
```javascript
import axios from 'axios';

const response = await axios.get(`http://localhost:8001/v1/bookings/${id}`);
```

**After:**
```javascript
import { BookingAPI } from '@config/apiClient';

const response = await BookingAPI.getBooking(id);
```

## Available API Classes

- `AuthAPI` - Authentication methods
- `TenantAPI` - Tenant management
- `RoomAPI` - Room operations
- `BookingAPI` - Booking management
- `PaymentAPI` - Payment processing
- `IssueAPI` - Issue tracking
- `DocumentAPI` - Document management
- `NotificationAPI` - Notification handling

## Environment Variables

Update your `.env` file:
```
REACT_APP_API_URL=http://localhost:8001
VITE_API_BASE_URL=http://localhost:8001/v1
```

## Aliases

Vite config includes `@config` alias:
```javascript
import { API_CONFIG } from '@config/apiConfig';
import { BookingAPI } from '@config/apiClient';
```

## Benefits

1. **Error Handling**: Automatic error formatting and 401 handling
2. **Authentication**: Automatic token injection
3. **Type Safety**: Method signatures provide clear interfaces
4. **Maintainability**: Single place to update endpoints
5. **Consistency**: Standardized API calls across the application

## Backward Compatibility

Old imports still work but are deprecated:
- `utils/env.js` - Redirects to centralized config
- `utils/config.js` - Maps to centralized config
- `resources/utils/apiConfig.js` - Uses centralized config
- `config/apiConfig.js` - Maps endpoints to centralized config
