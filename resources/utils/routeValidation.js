// Route Verification Utility - Updated for Direct Go API
// This file documents all the frontend routes and their corresponding Go backend endpoints

export const ROUTE_MAPPINGS = {
  // Public Routes (no authentication required)
  public: {
    '/': { component: 'TenantHome', backend: null },
    '/rooms': { component: 'RoomsList', backend: 'http://localhost:8001/v1/rooms' },
    '/rooms/listing': { component: 'RoomListing', backend: 'http://localhost:8001/v1/rooms' },
    '/rooms/:roomId': { component: 'RoomDetail', backend: 'http://localhost:8001/v1/rooms/:id' },
  },

  // Authentication Routes
  auth: {
    '/login': { component: 'Login', backend: 'http://localhost:8001/v1/tenant/auth/login' },
    '/register': { component: 'Register', backend: 'http://localhost:8001/v1/tenant/auth/register' },
    '/forgot-password': { component: 'ForgotPassword', backend: 'http://localhost:8001/v1/tenant/auth/forgot-password' },
    '/reset-password': { component: 'ResetPassword', backend: 'http://localhost:8001/v1/tenant/auth/reset-password' },
    '/email-verification': { component: 'EmailVerification', backend: 'http://localhost:8001/v1/tenant/auth/verify-email' },
    '/verification-prompt': { component: 'VerificationPrompt', backend: null },
  },

  // Protected Routes (authentication required)
  protected: {
    // Dashboard
    '/dashboard': { component: 'TenantDashboard', backend: 'http://localhost:8001/v1/tenant/profile' },

    // Profile & Documents
    '/profile': { component: 'Profile', backend: 'http://localhost:8001/v1/tenant/profile' },
    '/documents': { component: 'Documents', backend: 'http://localhost:8001/v1/tenant/documents' },
    '/documents/upload': { component: 'UploadDocument', backend: 'http://localhost:8001/v1/tenant/documents/upload' },

    // Bookings
    '/bookings': { component: 'EnhancedBookingsList', backend: 'http://localhost:8001/v1/bookings' },
    '/bookings/:bookingId': { component: 'BookingDetail', backend: 'http://localhost:8001/v1/bookings/:id' },
    '/bookings/:bookingId/check-in': { component: 'CheckInPage', backend: 'http://localhost:8001/v1/bookings/:id/checkin' },
    '/rooms/:roomId/book': { component: 'BookRoom', backend: 'http://localhost:8001/v1/bookings' },

    // Payment Routes - Bookings
    '/bookings/:bookingId/payment': { component: 'PaymentProcess', backend: 'http://localhost:8001/v1/payments' },
    '/bookings/:bookingId/payment-method': { component: 'PaymentMethodSelection', backend: null },
    '/bookings/:bookingId/manual-payment': { component: 'ManualPayment', backend: 'http://localhost:8001/v1/payments/manual' },
    '/bookings/:bookingId/midtrans-payment': { component: 'MidtransPayment', backend: 'http://localhost:8001/v1/payments/midtrans' },
    '/bookings/:bookingId/payments/create/manual': { component: 'CreateManualPayment', backend: 'http://localhost:8001/v1/payments/manual' },

    // Payment Routes - Invoices
    '/invoices/:invoiceId/manual-payment': { component: 'ManualPayment', backend: 'http://localhost:8001/v1/payments/manual' },
    '/invoices/:invoiceId/midtrans-payment': { component: 'MidtransPayment', backend: 'http://localhost:8001/v1/payments/midtrans' },
    '/invoices/:invoiceId/payments/create/manual': { component: 'CreateManualPayment', backend: 'http://localhost:8001/v1/payments/manual' },
    '/invoices/:invoiceId/payment-method': { component: 'PaymentMethodSelection', backend: null },

    // General Payment Routes
    '/payments/history': { component: 'PaymentHistory', backend: 'http://localhost:8001/v1/payments' },
    '/payments/:paymentId': { component: 'PaymentDetails', backend: 'http://localhost:8001/v1/payments/:id' },
    '/payments/create/manual': { component: 'CreateManualPayment', backend: 'http://localhost:8001/v1/payments/manual' },
    '/payments/process/:invoiceId': { component: 'PaymentProcess', backend: 'http://localhost:8001/v1/payments' },
    '/payments/callback': { component: 'MidtransCallback', backend: null },

    // Issues
    '/issues': { component: 'IssuesPage', backend: 'http://localhost:8001/v1/issues' },
    '/issues/report': { component: 'ReportIssuePage', backend: 'http://localhost:8001/v1/issues' },
    '/issues/:issueId': { component: 'IssueDetail', backend: 'http://localhost:8001/v1/issues/:id' },

    // Invoices
    '/invoices': { component: 'InvoicesList', backend: 'http://localhost:8001/v1/invoices' },
    '/invoices/history': { component: 'InvoicesList', backend: 'http://localhost:8001/v1/invoices' },
    '/invoices/:invoiceId': { component: 'InvoiceDetail', backend: 'http://localhost:8001/v1/invoices/:id' },
  }
};

// Go Backend API Endpoints (Direct Connection)
export const GO_API_ENDPOINTS_AVAILABLE = [
  // Authentication (no auth required)
  'POST http://localhost:8001/v1/tenant/auth/login',
  'POST http://localhost:8001/v1/tenant/auth/register', 
  'POST http://localhost:8001/v1/tenant/auth/forgot-password',
  'POST http://localhost:8001/v1/tenant/auth/reset-password',
  'POST http://localhost:8001/v1/tenant/auth/verify-email',
  'POST http://localhost:8001/v1/tenant/auth/verify',

  // Rooms (public access)
  'GET http://localhost:8001/v1/rooms',
  'GET http://localhost:8001/v1/rooms/:id',
  'GET http://localhost:8001/v1/rooms/:id/availability',

  // Bookings (requires authentication)
  'GET http://localhost:8001/v1/bookings',
  'POST http://localhost:8001/v1/bookings',
  'GET http://localhost:8001/v1/bookings/:id',
  'POST http://localhost:8001/v1/bookings/:id/checkin',

  // Payments (requires authentication)
  'GET http://localhost:8001/v1/payments',
  'GET http://localhost:8001/v1/payments/:id',
  'POST http://localhost:8001/v1/payments/manual',
  'POST http://localhost:8001/v1/payments/midtrans',

  // Invoices (requires authentication)
  'GET http://localhost:8001/v1/invoices',
  'GET http://localhost:8001/v1/invoices/:id',

  // Issues (requires authentication)
  'GET http://localhost:8001/v1/issues',
  'POST http://localhost:8001/v1/issues',
  'GET http://localhost:8001/v1/issues/:id',

  // Documents (requires authentication)
  'GET http://localhost:8001/v1/tenant/documents',
  'POST http://localhost:8001/v1/tenant/documents/upload',

  // Profile (requires authentication)
  'GET http://localhost:8001/v1/tenant/profile',
  'PUT http://localhost:8001/v1/tenant/profile',
];

// Laravel Web Routes (serving React app)
export const WEB_ROUTES_AVAILABLE = [
  // Public
  'GET /',
  'GET /rooms',
  'GET /rooms/listing',
  'GET /rooms/:roomId',

  // Auth
  'GET /tenant/login',
  'POST /tenant/login',
  'GET /tenant/register',
  'GET /tenant/forgot-password',
  'GET /tenant/reset-password',
  'GET /tenant/email-verification',
  'GET /tenant/verification-prompt',

  // Protected (all serve React app)
  'GET /tenant/dashboard',
  'GET /tenant/profile',
  'GET /tenant/documents',
  'GET /tenant/documents/upload',
  'GET /tenant/bookings',
  'GET /tenant/bookings/:bookingId',
  'GET /tenant/bookings/:bookingId/check-in',
  'GET /tenant/bookings/:bookingId/payment',
  'GET /tenant/bookings/:bookingId/payment-method',
  'GET /tenant/bookings/:bookingId/manual-payment',
  'GET /tenant/bookings/:bookingId/midtrans-payment',
  'GET /tenant/bookings/:bookingId/payments/create/manual',
  'GET /tenant/rooms/:roomId/book',
  'GET /tenant/payments',
  'GET /tenant/payments/history',
  'GET /tenant/payments/:paymentId',
  'GET /tenant/payments/create/manual',
  'GET /tenant/payments/callback',
  'GET /tenant/payments/process/:invoiceId',
  'GET /tenant/invoices',
  'GET /tenant/invoices/history',
  'GET /tenant/invoices/:invoiceId',
  'GET /tenant/invoices/:invoiceId/payment-method',
  'GET /tenant/invoices/:invoiceId/manual-payment',
  'GET /tenant/invoices/:invoiceId/midtrans-payment',
  'GET /tenant/invoices/:invoiceId/payments/create/manual',
  'GET /tenant/issues',
  'GET /tenant/issues/report',
  'GET /tenant/issues/:issueId',
];

/**
 * Validates that all frontend routes have corresponding backend endpoints
 */
export const validateRoutes = () => {
  const issues = [];

  // Check protected routes that require backend APIs
  Object.entries(ROUTE_MAPPINGS.protected).forEach(([route, config]) => {
    if (config.backend && !API_ENDPOINTS_AVAILABLE.some(endpoint => 
      endpoint.includes(config.backend.replace(':id', ':id').replace(':bookingId', ':id').replace(':invoiceId', ':id').replace(':paymentId', ':id').replace(':issueId', ':id'))
    )) {
      issues.push(`Frontend route ${route} expects backend ${config.backend} but it's not available`);
    }
  });

  // Check auth routes
  Object.entries(ROUTE_MAPPINGS.auth).forEach(([route, config]) => {
    if (config.backend && !API_ENDPOINTS_AVAILABLE.some(endpoint => 
      endpoint.includes(config.backend)
    )) {
      issues.push(`Auth route ${route} expects backend ${config.backend} but it's not available`);
    }
  });

  return issues;
};

// Run validation
const routeIssues = validateRoutes();
if (routeIssues.length > 0) {
  console.warn('Route validation issues found:', routeIssues);
} else {
  console.log('✅ All frontend routes have corresponding backend endpoints');
}
