/**
 * Authentication Synchronization Script
 * 
 * This script ensures authentication state is properly synchronized between:
 * 1. Server-side session (PHP session)
 * 2. Client-side localStorage
 * 3. Client-side sessionStorage
 * 4. Window appConfig object
 */

// Auth event types
export const AUTH_EVENTS = {
    LOGIN: 'login',
    LOGOUT: 'logout',
    TOKEN_EXPIRED: 'token-expired',
    TOKEN_INVALID: 'token-invalid'
};

// Function to get a valid token
export const getToken = () => {
  const token = localStorage.getItem('tenant_token');
  
  // Basic validation
  if (!token || typeof token !== 'string' || token.length < 10) {
    console.error('Invalid or missing token in localStorage');
    return null;
  }
  
  return token;
};

// Function to check token validity
export const validateToken = (token) => {
  if (!token || typeof token !== 'string' || token.length < 10) {
    return false;
  }
  
  // Simple JWT structure validation (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  return true;
};

// Dispatch auth events to components
export const dispatchAuthEvent = (action, data = {}) => {
  console.log(`Dispatching auth event: ${action}`, data);
  
  const event = new CustomEvent('auth-event', {
    detail: { action, data }
  });
  
  window.dispatchEvent(event);
};

// Store authentication data consistently
export const storeAuthData = (token, tenantData) => {
  if (!token) {
    console.error('Cannot store auth data: Token is missing');
    return false;
  }
  
  try {
    // Store token
    localStorage.setItem('tenant_token', token);
    
    // Store tenant data
    if (tenantData) {
      if (typeof tenantData === 'string') {
        localStorage.setItem('tenant_data', tenantData);
      } else {
        localStorage.setItem('tenant_data', JSON.stringify(tenantData));
      }
    }
    
    // Also set a cookie for API requests
    document.cookie = `tenant_token=${token}; path=/; max-age=86400`;
    
    return true;
  } catch (error) {
    console.error('Error storing auth data:', error);
    return false;
  }
};

// Clear authentication data
export const clearAuthData = () => {
  localStorage.removeItem('tenant_token');
  localStorage.removeItem('tenant_data');
  
  // Clear any potential cookies
  document.cookie = "tenant_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  return true;
};

// Get tenant ID from stored data
export const getTenantId = () => {
  try {
    const tenantDataStr = localStorage.getItem('tenant_data');
    if (!tenantDataStr) return null;
    
    const tenantData = JSON.parse(tenantDataStr);
    
    // Handle different structures
    if (tenantData.tenantId) return tenantData.tenantId;
    if (tenantData.id) return tenantData.id;
    if (tenantData.tenant && tenantData.tenant.tenantId) return tenantData.tenant.tenantId;
    if (tenantData.tenant && tenantData.tenant.id) return tenantData.tenant.id;
    
    return null;
  } catch (error) {
    console.error('Error getting tenant ID:', error);
    return null;
  }
};

// Check if user is authenticated with validation
export const isAuthenticated = () => {
  const token = localStorage.getItem('tenant_token');
  if (!token) return false;
  
  return validateToken(token);
};

// Export a default object with all functions
export default {
  getToken,
  validateToken,
  dispatchAuthEvent,
  storeAuthData,
  clearAuthData,
  getTenantId,
  isAuthenticated
};
