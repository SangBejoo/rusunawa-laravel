// API Configuration for Frontend - Using centralized config
import { 
  API_BASE_URL, 
  API_ENDPOINTS as CENTRALIZED_ENDPOINTS 
} from '../src/config/apiConfig.js';

// Re-export centralized configuration
export { API_BASE_URL };

// Backwards compatibility - map old endpoints to new centralized ones
export const API_ENDPOINTS = {
  // Auth endpoints - Direct Go API
  TENANT_LOGIN: CENTRALIZED_ENDPOINTS.TENANT_AUTH.LOGIN,
  TENANT_REGISTER: CENTRALIZED_ENDPOINTS.TENANT_AUTH.REGISTER,
  TENANT_LOGOUT: CENTRALIZED_ENDPOINTS.TENANT_AUTH.LOGOUT,
  TENANT_VERIFY: CENTRALIZED_ENDPOINTS.TENANT_AUTH.VERIFY,
  TENANT_REFRESH: CENTRALIZED_ENDPOINTS.TENANT_AUTH.REFRESH,
  TENANT_FORGOT_PASSWORD: CENTRALIZED_ENDPOINTS.TENANT_AUTH.FORGOT_PASSWORD,
  TENANT_RESET_PASSWORD: CENTRALIZED_ENDPOINTS.TENANT_AUTH.RESET_PASSWORD,
  TENANT_VERIFY_EMAIL: CENTRALIZED_ENDPOINTS.TENANT_AUTH.VERIFY_EMAIL,
  
  // Tenant endpoints
  TENANT_PROFILE: CENTRALIZED_ENDPOINTS.TENANTS.PROFILE,
  TENANT_UPDATE: CENTRALIZED_ENDPOINTS.TENANTS.UPDATE,
  
  // Room endpoints
  ROOMS: CENTRALIZED_ENDPOINTS.ROOMS.BASE,
  ROOM_DETAIL: CENTRALIZED_ENDPOINTS.ROOMS.BASE,
  
  // Booking endpoints
  BOOKINGS: CENTRALIZED_ENDPOINTS.BOOKINGS.BASE,
  BOOKING_DETAIL: CENTRALIZED_ENDPOINTS.BOOKINGS.BASE,
  BOOKING_CHECKIN: CENTRALIZED_ENDPOINTS.BOOKINGS.BASE, // /{id}/checkin
  
  // Payment endpoints
  PAYMENTS: CENTRALIZED_ENDPOINTS.PAYMENTS.BASE,
  PAYMENT_DETAIL: CENTRALIZED_ENDPOINTS.PAYMENTS.BASE,
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
