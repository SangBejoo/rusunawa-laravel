import axios from 'axios';

// Configure axios default settings
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

// Get CSRF token from meta tag
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
  axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

// Get API base URL from window config or use default
// Get API base URL from window config, meta tag, or use default
const API_BASE_URL = window.config?.apiBaseUrl || 
                    document.head.querySelector('meta[name="api-base-url"]')?.content ||
                    'http://localhost:8001/v1';
console.log('Using API URL:', API_BASE_URL);

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Enable sending cookies with cross-origin requests
});

export const roomApi = {
  /**
   * Get all available rooms
   */
  getRooms: async (filters = {}) => {
    console.log('Fetching rooms with filters:', filters);
    try {
      // Try direct API endpoint first
      const response = await api.get('/rooms', { params: filters });
      
      console.log('Room API response:', response.data);
      
      // Check if response has expected structure
      if (response.data && (response.data.rooms || response.data.status)) {
        return {
          success: true,
          data: response.data
        };
      } else {
        console.warn('API returned unexpected data structure:', response.data);
        return {
          success: false,
          error: 'Unexpected API response format'
        };
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      
      // Try fallback to Laravel proxy endpoint
      try {
        console.log('Trying fallback API endpoint...');
        const fallbackResponse = await axios.get('/api/rooms', { params: filters });
        
        if (fallbackResponse.data && (fallbackResponse.data.rooms || fallbackResponse.data.status)) {
          console.log('Fallback room API response:', fallbackResponse.data);
          return {
            success: true,
            data: fallbackResponse.data
          };
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
      }
      
      // Both attempts failed
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch rooms'
      };
    }
  },
  
  /**
   * Get single room details by ID
   */  getRoomById: async (roomId) => {
    try {
      // Try direct API endpoint first
      const response = await api.get(`/rooms/${roomId}`);
      console.log('Room detail response:', response.data);
      
      if (response.data && (response.data.room || response.data.status)) {
        return {
          success: true,
          data: response.data
        };
      } else {
        console.warn('API returned unexpected data structure:', response.data);
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error(`Error fetching room #${roomId} from direct API:`, error);
      
      // Try fallback to Laravel proxy endpoint
      try {
        console.log('Trying fallback API endpoint...');
        const fallbackResponse = await axios.get(`/api/rooms/${roomId}`);
        
        if (fallbackResponse.data && (fallbackResponse.data.room || fallbackResponse.data.status)) {
          console.log('Fallback room detail response:', fallbackResponse.data);
          return {
            success: true,
            data: fallbackResponse.data
          };
        } else {
          throw new Error('Unexpected fallback API response format');
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
        return {
          success: false,
          error: fallbackError.response?.data?.message || error.response?.data?.message || 'Failed to fetch room details'
        };
      }
    }
  }
};

// Booking APIs
export const bookingApi = {
  /**
   * Create new booking
   */
  createBooking: async (bookingData) => {
    try {
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        console.error('No authentication token found');
        return {
          success: false,
          error: 'Authentication required'
        };
      }
      
      console.log('Creating booking with token:', token.substring(0, 10) + '...');
      
      // First attempt: Direct to Go backend
      try {
        console.log('Attempting direct booking to Go backend API');
        const directResponse = await fetch(`${API_BASE_URL}/bookings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            tenantId: parseInt(bookingData.tenantId),
            roomId: parseInt(bookingData.roomId),
            startDate: bookingData.startDate,
            endDate: bookingData.endDate
          })
        });
        
        const directData = await directResponse.json();
        console.log('Direct booking API response:', directData);
        
        if (directResponse.ok && directData.booking) {
          return {
            success: true,
            data: directData
          };
        } else {
          console.error('Direct booking API call failed with:', directData);
          
          // Check for specific error types and provide user-friendly messages
          if (directData.status && directData.status.message) {
            // Handle gender mismatch error
            if (directData.status.message.includes('gender classification') || 
                directData.status.message.includes('match tenant gender')) {
              return {
                success: false,
                error: 'This room cannot be booked because it is reserved for a different gender.',
                errorType: 'gender_mismatch',
                details: directData.status.message
              };
            }
            
            // Handle room availability error
            if (directData.status.message.includes('not available') || 
                directData.status.message.includes('requested dates')) {
              return {
                success: false,
                error: 'This room is not available for the selected dates. Please choose different dates or another room.',
                errorType: 'date_unavailable',
                details: directData.status.message
              };
            }
            
            // Return the actual error message from the backend
            return {
              success: false,
              error: directData.status.message,
              errorType: 'api_error',
              details: directData.status
            };
          }
        }
      } catch (directError) {
        console.error('Error calling direct booking API:', directError);
      }
      
      // Second attempt: Through Laravel proxy
      console.log('Falling back to Laravel proxy for booking');
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(bookingData),
          credentials: 'include'
        });
        
        const data = await response.json();
        console.log('Laravel proxy booking response:', data);
        
        if (!response.ok) {
          if (response.status === 401) {
            return {
              success: false,
              error: 'Your session has expired. Please log in again.',
              errorType: 'authentication'
            };
          }
          
          return {
            success: false,
            error: data.message || data.status?.message || 'Failed to create booking',
            errorType: 'api_error'
          };
        }
        
        return {
          success: true,
          data: data
        };
      } catch (proxyError) {
        console.error('Error with Laravel proxy booking:', proxyError);
        return {
          success: false,
          error: 'Connection error. Please try again later.',
          errorType: 'connection'
        };
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create booking'
      };
    }
  },
  
  getBookings: () => api.get('/v1/bookings'),
  getBooking: (id) => api.get(`/v1/bookings/${id}`),
  cancelBooking: (id, reason) => api.put(`/v1/bookings/${id}/cancel`, reason),
  
  // Invoice APIs
  getInvoices: () => api.get('/v1/invoices'),
  getInvoice: (id) => api.get(`/v1/invoices/${id}`),
};

// Payment APIs
export const paymentApi = {
  createMidtransPayment: (data) => api.post('/v1/payments/midtrans', data),
  submitManualPayment: (data) => api.post('/v1/payments/manual', data),
  getPaymentStatus: (id) => api.get(`/v1/payments/${id}/status`),
};

export const tenantApi = {
  /**
   * Get tenant profile information
   */
  getProfile: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tenant/profile`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching tenant profile:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch tenant profile'
      };
    }
  },
  
  /**
   * Get tenant dashboard statistics and information
   */
  getDashboardData: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tenant/dashboard`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard data'
      };
    }
  },
  
  /**
   * Update tenant profile information
   */
  updateProfile: async (profileData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tenant/profile`, profileData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating tenant profile:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile'
      };
    }
  }
};

/**
 * API utilities for making requests to backend services
 */

/**
 * Get authentication token from storage
 */
export const getAuthToken = () => {
  return localStorage.getItem('tenant_token');
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Request options
 * @returns {Promise} - Fetch promise
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Add authentication header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const fetchOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  };
  
  // Use direct API endpoint if it starts with http, otherwise prepend API_BASE_URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  console.log(`Making API request to: ${url}`, fetchOptions);
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Parse JSON response
    const data = await response.json();
    console.log(`API response from ${url}:`, data);
    
    if (!response.ok) {
      throw {
        status: response.status,
        data,
        message: data.status?.message || 'API request failed'
      };
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

/**
 * Login with credentials
 * @param {Object} credentials - User credentials
 * @returns {Promise} - Login response
 */
export const login = async (credentials) => {
  try {
    // First attempt: Try direct API call
    try {
      console.log("Attempting direct login to Go backend");
      return await apiRequest('/tenant/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    } catch (directError) {
      console.log("Direct login failed, trying proxy");
      // Second attempt: Try Laravel proxy
      const response = await fetch('/api/direct-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          data,
          message: data.status?.message || 'Login failed'
        };
      }
      
      return data;
    }
  } catch (error) {
    console.error("All login attempts failed:", error);
    throw error;
  }
};

export default {
  apiRequest,
  login,
  getAuthToken
};
