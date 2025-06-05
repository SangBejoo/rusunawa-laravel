/**
 * Tenant Authentication Service
 * Handles all authentication related operations
 */
import axios from 'axios';

class TenantAuthService {  constructor() {
    this.token = localStorage.getItem('tenant_token') || sessionStorage.getItem('tenant_token');
    this.apiBaseUrl = window.appConfig?.apiBaseUrl || 'http://localhost:8003'; // Go backend URL
    
    // Set up Authorization header if token exists
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
    
    // Set up global axios interceptor for auth errors
    axios.interceptors.response.use(
      response => response,
      error => {
        // Check if the error is due to unauthorized access (401)
        if (error.response && error.response.status === 401) {
          console.log('Unauthorized access detected, logging out');
          
          // Only log out if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            this.logout();
            
            // Store the current page URL to redirect back after login
            const currentUrl = window.location.pathname + window.location.search;
            sessionStorage.setItem('login_redirect', currentUrl);
            
            // Redirect to login
            window.location.href = '/tenant/login?redirect=' + encodeURIComponent(currentUrl);
          }
        }
        return Promise.reject(error);
      }
    );
  }
    /**
   * Login to the Go API backend
   * @param {string} email User email
   * @param {string} password User password
   * @returns {Promise} Login response with token and tenant data
   */  async login(email, password) {
    try {
      console.log('Attempting login with Go backend API...');
      
      // Clear any existing tokens first
      this.logout();
      
      // Make API call to Go backend
      const response = await axios({
        method: 'post',
        url: `${this.apiBaseUrl}/v1/tenant/auth/login`,
        data: { email, password },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Login response received');
      
      // Validate response format
      if (!response.data || !response.data.status || 
          !response.data.tenant || !response.data.token) {
        throw new Error('Invalid response format: missing required data');
      }
      
      // Validate response status
      if (response.data.status.status !== 'success') {
        throw new Error(response.data.status.message || 'Login failed');
      }
        // Store authentication data
      this.setToken(response.data.token);
      localStorage.setItem('tenant_data', JSON.stringify(response.data.tenant));
      sessionStorage.setItem('tenant_data', JSON.stringify(response.data.tenant));
      
      // Store token for API requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Get redirect URL from query params if available
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect') || sessionStorage.getItem('login_redirect') || '/tenant/dashboard';
      
      // Clear the stored redirect URL
      sessionStorage.removeItem('login_redirect');
      
      // Notify all components about auth state change
      this.notifyAuthChange();
      
      return {
        success: true,
        tenant: response.data.tenant,
        token: response.data.token,
        redirect: redirectUrl
      };
    } catch (error) {
      console.error('Login error:', error.response || error);
      
      // Format the error for consistent handling
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.response && error.response.data && error.response.data.status) {
        errorMessage = error.response.data.status.message || errorMessage;
      }
      
      throw {
        success: false,
        message: errorMessage,
        originalError: error
      };
    }
  }
    /**
   * Set the JWT token and update axios defaults
   * @param {string} token JWT token
   */  setToken(token) {
    if (!token) {
      console.warn('Attempted to set empty token');
      return;
    }
    
    console.log('Setting authentication token');
    
    // Store in instance
    this.token = token;
    
    // Store in both localStorage (for persistence) and sessionStorage (for backup)
    localStorage.setItem('tenant_token', token);
    sessionStorage.setItem('tenant_token', token);
    
    // Set for API requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  /**
   * Log the user out and clean up auth state
   */
  logout() {
    console.log('Logging out...');
    // Clear stored data
    localStorage.removeItem('tenant_token');
    localStorage.removeItem('tenant_data');
    sessionStorage.removeItem('tenant_token');
    sessionStorage.removeItem('tenant_data');
    
    // Clear runtime state
    this.token = null;
    delete axios.defaults.headers.common['Authorization'];
    
    // Notify components
    this.notifyAuthChange();
  }
  
  /**
   * Notify all components about authentication state change
   */
  notifyAuthChange() {
    try {
      // For same-page updates
      window.dispatchEvent(new Event('tenantAuthChanged'));
      // For cross-tab synchronization
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'tenant_token',
        newValue: localStorage.getItem('tenant_token')
      }));
      console.log('Auth change events dispatched');
    } catch (e) {
      console.error('Error dispatching auth events:', e);
    }
  }
  
  /**
   * Check if the user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!this.token;
  }
  
  /**
   * Get the current tenant data from local storage
   * @returns {object|null} Tenant data
   */
  getTenant() {
    try {
      const tenant = localStorage.getItem('tenant_data');
      if (!tenant) {
        return null;
      }
      
      const parsedTenant = JSON.parse(tenant);
      // Verify tenant data structure
      if (!parsedTenant || !parsedTenant.id) {
        console.warn('Invalid tenant data found, clearing...');
        this.logout();
        return null;
      }
      
      return parsedTenant;
    } catch (error) {
      console.error('Error parsing tenant data:', error);
      this.logout(); // Clear invalid data
      return null;
    }
  }

  /**
   * Check if user is currently logged in with valid data
   */
  isLoggedIn() {
    const token = this.token;
    const tenant = this.getTenant();
    return !!(token && tenant);
  }
    /**
   * Register a new tenant
   * @param {object} userData User registration data
   * @returns {Promise} Registration response
   */
  async register(userData) {
    try {
      const response = await axios({
        method: 'post',
        url: `${this.apiBaseUrl}/v1/tenant/auth/register`,
        data: userData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Registration error:', error.response || error);
      
      let errorMessage = 'Registration failed.';
      if (error.response && error.response.data && error.response.data.status) {
        errorMessage = error.response.data.status.message || errorMessage;
      }
      
      throw {
        success: false,
        message: errorMessage,
        originalError: error
      };
    }
  }
}

// Create and export singleton instance
const tenantAuthService = new TenantAuthService();
export default tenantAuthService;
