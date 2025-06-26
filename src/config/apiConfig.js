/**
 * Centralized API Configuration
 * This file contains all API URLs, endpoints, and configuration settings
 */

// Get environment variables with fallbacks
const getEnvVar = (key, fallback) => {
  return process.env[key] || 
         (typeof window !== 'undefined' && window[key]) || 
         import.meta?.env?.[key] || 
         fallback;
};

// Base API configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: getEnvVar('REACT_APP_API_URL', 'https://qtd9x9cp-8001.asse.devtunnels.ms'),
  BASE_URL_V1: getEnvVar('REACT_APP_API_URL', 'https://qtd9x9cp-8001.asse.devtunnels.ms') + '/v1',
  
  // Timeouts
  TIMEOUT: 30000,
  UPLOAD_TIMEOUT: 60000,
  
  // API Version
  VERSION: 'v1',
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// API Endpoints - organized by feature
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },

  // Tenant Authentication
  TENANT_AUTH: {
    LOGIN: '/tenant/auth/login',
    LOGOUT: '/tenant/auth/logout',
    REGISTER: '/tenant/auth/register',
    VERIFY: '/tenant/auth/verify',
    REFRESH: '/tenant/auth/refresh',
    FORGOT_PASSWORD: '/tenant/auth/forgot-password',
    RESET_PASSWORD: '/tenant/auth/reset-password',
    VERIFY_EMAIL: '/tenant/auth/verify-email'
  },

  // Tenant Management
  TENANTS: {
    BASE: '/tenants',
    PROFILE: '/tenant/profile',
    UPDATE: '/tenant/profile',
    PICTURE: '/tenant/profile/picture',
    CHANGE_PASSWORD: '/tenant/change-password',
    BY_ID: (id) => `/tenants/${id}`
  },

  // Room Management
  ROOMS: {
    BASE: '/rooms',
    BY_ID: (id) => `/rooms/${id}`,
    CAPACITY: (id) => `/rooms/${id}/capacity`,
    AVAILABILITY: (id) => `/rooms/${id}/availability`,
    IMAGES: (id) => `/rooms/${id}/images`
  },

  // Booking Management
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id) => `/bookings/${id}`,
    CHECKIN: (id) => `/bookings/${id}/checkin`,
    CHECKOUT: (id) => `/bookings/${id}/checkout`,
    CANCEL: (id) => `/bookings/${id}/cancel`,
    TENANT: (tenantId) => `/tenants/${tenantId}/bookings`
  },

  // Payment Management
  PAYMENTS: {
    BASE: '/payments',
    BY_ID: (id) => `/payments/${id}`,
    BY_BOOKING: (bookingId) => `/bookings/${bookingId}/payments`,
    PROCESS: '/payments/process',
    CALLBACK: '/payments/callback',
    HISTORY: '/payments/history',
    ANALYTICS: '/payments/analytics',
    NOTIFICATIONS: '/payments/notifications'
  },

  // Issue Management
  ISSUES: {
    BASE: '/issues',
    BY_ID: (id) => `/issues/${id}`,
    BY_TENANT: (tenantId) => `/tenants/${tenantId}/issues`,
    UPDATE_STATUS: (id) => `/issues/${id}/status`,
    ATTACHMENTS: (id) => `/issues/${id}/attachments`
  },

  // Document Management
  DOCUMENTS: {
    BASE: '/documents',
    BY_ID: (id) => `/documents/${id}`,
    BY_TENANT: (tenantId) => `/tenants/${tenantId}/documents`,
    UPLOAD: '/documents/upload',
    DOWNLOAD: (id) => `/documents/${id}/download`
  },

  // Invoice Management
  INVOICES: {
    BASE: '/invoices',
    BY_ID: (id) => `/invoices/${id}`,
    BY_TENANT: (tenantId) => `/tenants/${tenantId}/invoices`,
    BY_BOOKING: (bookingId) => `/bookings/${bookingId}/invoices`,
    DOWNLOAD: (id) => `/invoices/${id}/download`
  },

  // Notification Management
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id) => `/notifications/${id}`,
    BY_TENANT: (tenantId) => `/tenants/${tenantId}/notifications`,
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all'
  }
};

// Helper functions to build complete URLs
export const buildApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_CONFIG.BASE_URL_V1}/${cleanEndpoint}`;
};

export const buildUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

// Authentication headers helper
export const getAuthHeaders = (tokenKey = 'tenant_token') => {
  const token = localStorage.getItem(tokenKey);
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Error handling helper
export const formatAPIError = (error) => {
  if (error.response) {
    const { data, status } = error.response;
    if (data && data.message) {
      return {
        message: data.message,
        status,
        errors: data.errors || []
      };
    }
    return {
      message: `HTTP Error ${status}`,
      status,
      errors: []
    };
  } else if (error.request) {
    return {
      message: 'Network error - please check your connection',
      status: 0,
      errors: []
    };
  }
  return {
    message: error.message || 'Unknown error occurred',
    status: 0,
    errors: []
  };
};

// Export legacy API_URL for backward compatibility
export const API_URL = API_CONFIG.BASE_URL_V1;
export const API_BASE_URL = API_CONFIG.BASE_URL;

// Export default configuration
export default {
  API_CONFIG,
  API_ENDPOINTS,
  API_URL,
  API_BASE_URL,
  buildApiUrl,
  buildUrl,
  getAuthHeaders,
  formatAPIError
};
