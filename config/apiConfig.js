// API Configuration for Frontend - Direct Go API
export const API_BASE_URL = 'http://localhost:8001/v1';

export const API_ENDPOINTS = {
  // Auth endpoints - Direct Go API
  TENANT_LOGIN: '/tenant/auth/login',
  TENANT_REGISTER: '/tenant/auth/register',
  TENANT_LOGOUT: '/tenant/auth/logout',
  TENANT_VERIFY: '/tenant/auth/verify',
  TENANT_REFRESH: '/tenant/auth/refresh',
  TENANT_FORGOT_PASSWORD: '/tenant/auth/forgot-password',
  TENANT_RESET_PASSWORD: '/tenant/auth/reset-password',
  TENANT_VERIFY_EMAIL: '/tenant/auth/verify-email',
  
  // Tenant endpoints
  TENANT_PROFILE: '/tenant/profile',
  TENANT_UPDATE: '/tenant/profile',
  
  // Room endpoints
  ROOMS: '/rooms',
  ROOM_DETAIL: '/rooms',
  
  // Booking endpoints
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: '/bookings',
  BOOKING_CHECKIN: '/bookings', // /{id}/checkin
  
  // Payment endpoints
  PAYMENTS: '/payments',
  PAYMENT_DETAIL: '/payments',
  PAYMENT_MANUAL: '/payments/manual',
  PAYMENT_MIDTRANS: '/payments/midtrans',
  
  // Invoice endpoints
  INVOICES: '/invoices',
  INVOICE_DETAIL: '/invoices',
  
  // Issues endpoints
  ISSUES: '/issues',
  ISSUE_DETAIL: '/issues',
  
  // Document endpoints
  DOCUMENTS: '/tenant/documents',
  DOCUMENT_UPLOAD: '/tenant/documents/upload',
};

// Default request configuration
export const DEFAULT_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Direct Go API Configuration
export const GO_API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
