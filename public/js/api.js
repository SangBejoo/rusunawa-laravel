import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: window._config?.apiBaseUrl || 'http://localhost:8001',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Add CSRF token if available (for Laravel routes)
if (window._config?.csrfToken) {
  api.defaults.headers.common['X-CSRF-TOKEN'] = window._config.csrfToken;
}

// Add request interceptor
api.interceptors.request.use(
  config => {
    // Get token from session storage if it exists
    const token = localStorage.getItem('tenant_token') || sessionStorage.getItem('tenant_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      localStorage.removeItem('tenant_token');
      sessionStorage.removeItem('tenant_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const authApi = {
  login: (credentials) => api.post('/v1/tenant/auth/login', credentials),
  register: (userData) => api.post('/v1/tenant/auth/register', userData),
  forgotPassword: (email) => api.post('/v1/tenant/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/v1/tenant/auth/reset-password', data),
  logout: () => api.post('/v1/tenant/auth/logout'),
};

// Tenant APIs
export const tenantApi = {
  getProfile: () => api.get('/v1/tenant/profile'),
  updateProfile: (data) => api.put('/v1/tenant/profile', data),
  updateLocation: (data) => api.put('/v1/tenant/location', data),
  
  // Document APIs
  getDocuments: () => api.get('/v1/tenant/documents'),
  getDocumentTypes: () => api.get('/v1/document-types'),
  uploadDocument: (tenantId, data) => api.post(`/v1/tenants/${tenantId}/documents`, data),
  deleteDocument: (documentId) => api.delete(`/v1/documents/${documentId}`),
};

// Room APIs
export const roomApi = {
  getRooms: () => api.get('/v1/rooms'),
  getRoom: (id) => api.get(`/v1/rooms/${id}`),
  getRoomTypes: () => api.get('/v1/room-types'),
};

// Booking APIs
export const bookingApi = {
  getBookings: () => api.get('/v1/bookings'),
  getBooking: (id) => api.get(`/v1/bookings/${id}`),
  createBooking: (data) => api.post('/v1/bookings', data),
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
