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
      const response = await axios.post('/v1/bookings', bookingData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create booking'
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
