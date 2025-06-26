/**
 * Centralized API Client
 * Main API client using the centralized configuration
 */

import axios from 'axios';
import { 
  API_CONFIG, 
  API_ENDPOINTS, 
  getAuthHeaders, 
  formatAPIError,
  buildApiUrl 
} from './apiConfig.js';

// Create main API client instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL_V1,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Add auth headers for protected routes
    const authHeaders = getAuthHeaders();
    if (authHeaders.Authorization) {
      config.headers = { ...config.headers, ...authHeaders };
    }
    return config;
  },
  (error) => {
    return Promise.reject(formatAPIError(error));
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const formattedError = formatAPIError(error);
    
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('tenant_token');
      localStorage.removeItem('tenant_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/tenant/login';
      }
    }
    
    return Promise.reject(formattedError);
  }
);

// API Service Classes
export class AuthAPI {
  static async login(credentials) {
    const response = await apiClient.post(API_ENDPOINTS.TENANT_AUTH.LOGIN, credentials);
    return response.data;
  }

  static async register(userData) {
    const response = await apiClient.post(API_ENDPOINTS.TENANT_AUTH.REGISTER, userData);
    return response.data;
  }

  static async logout() {
    const response = await apiClient.post(API_ENDPOINTS.TENANT_AUTH.LOGOUT);
    return response.data;
  }

  static async refreshToken() {
    const response = await apiClient.post(API_ENDPOINTS.TENANT_AUTH.REFRESH);
    return response.data;
  }

  static async forgotPassword(email) {
    const response = await apiClient.post(API_ENDPOINTS.TENANT_AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  }

  static async resetPassword(data) {
    const response = await apiClient.post(API_ENDPOINTS.TENANT_AUTH.RESET_PASSWORD, data);
    return response.data;
  }
}

export class TenantAPI {
  static async getProfile() {
    const response = await apiClient.get(API_ENDPOINTS.TENANTS.PROFILE);
    return response.data;
  }

  static async updateProfile(data) {
    const response = await apiClient.put(API_ENDPOINTS.TENANTS.UPDATE, data);
    return response.data;
  }

  static async uploadPicture(formData) {
    const response = await apiClient.post(API_ENDPOINTS.TENANTS.PICTURE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: API_CONFIG.UPLOAD_TIMEOUT
    });
    return response.data;
  }

  static async changePassword(data) {
    const response = await apiClient.post(API_ENDPOINTS.TENANTS.CHANGE_PASSWORD, data);
    return response.data;
  }

  static async getTenant(id) {
    const response = await apiClient.get(API_ENDPOINTS.TENANTS.BY_ID(id));
    return response.data;
  }
}

export class RoomAPI {
  static async getRooms(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.ROOMS.BASE, { params });
    return response.data;
  }

  static async getRoom(id) {
    const response = await apiClient.get(API_ENDPOINTS.ROOMS.BY_ID(id));
    return response.data;
  }

  static async getRoomCapacity(id, params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.ROOMS.CAPACITY(id), { params });
    return response.data;
  }

  static async getRoomAvailability(id, params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.ROOMS.AVAILABILITY(id), { params });
    return response.data;
  }
}

export class BookingAPI {
  static async getBookings(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.BASE, { params });
    return response.data;
  }

  static async getBooking(id) {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.BY_ID(id));
    return response.data;
  }

  static async createBooking(data) {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.BASE, data);
    return response.data;
  }

  static async updateBooking(id, data) {
    const response = await apiClient.put(API_ENDPOINTS.BOOKINGS.BY_ID(id), data);
    return response.data;
  }

  static async cancelBooking(id) {
    const response = await apiClient.delete(API_ENDPOINTS.BOOKINGS.CANCEL(id));
    return response.data;
  }

  static async checkinBooking(id, data) {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.CHECKIN(id), data);
    return response.data;
  }

  static async checkoutBooking(id, data) {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.CHECKOUT(id), data);
    return response.data;
  }

  static async getTenantBookings(tenantId, params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.TENANT(tenantId), { params });
    return response.data;
  }
}

export class PaymentAPI {
  static async getPayments(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.BASE, { params });
    return response.data;
  }

  static async getPayment(id) {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.BY_ID(id));
    return response.data;
  }

  static async getBookingPayments(bookingId) {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.BY_BOOKING(bookingId));
    return response.data;
  }

  static async processPayment(data) {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.PROCESS, data);
    return response.data;
  }

  static async getPaymentHistory(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.HISTORY, { params });
    return response.data;
  }

  static async getPaymentAnalytics(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.ANALYTICS, { params });
    return response.data;
  }
}

export class IssueAPI {
  static async getIssues(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.ISSUES.BASE, { params });
    return response.data;
  }

  static async getIssue(id) {
    const response = await apiClient.get(API_ENDPOINTS.ISSUES.BY_ID(id));
    return response.data;
  }

  static async createIssue(data) {
    const response = await apiClient.post(API_ENDPOINTS.ISSUES.BASE, data);
    return response.data;
  }

  static async updateIssue(id, data) {
    const response = await apiClient.put(API_ENDPOINTS.ISSUES.BY_ID(id), data);
    return response.data;
  }

  static async updateIssueStatus(id, status) {
    const response = await apiClient.put(API_ENDPOINTS.ISSUES.UPDATE_STATUS(id), { status });
    return response.data;
  }

  static async getTenantIssues(tenantId, params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.ISSUES.BY_TENANT(tenantId), { params });
    return response.data;
  }
}

export class DocumentAPI {
  static async getDocuments(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.BASE, { params });
    return response.data;
  }

  static async getDocument(id) {
    const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.BY_ID(id));
    return response.data;
  }

  static async uploadDocument(formData) {
    const response = await apiClient.post(API_ENDPOINTS.DOCUMENTS.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: API_CONFIG.UPLOAD_TIMEOUT
    });
    return response.data;
  }

  static async downloadDocument(id) {
    const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.DOWNLOAD(id), {
      responseType: 'blob'
    });
    return response.data;
  }

  static async getTenantDocuments(tenantId, params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.BY_TENANT(tenantId), { params });
    return response.data;
  }
}

export class NotificationAPI {
  static async getNotifications(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BASE, { params });
    return response.data;
  }

  static async getNotification(id) {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
    return response.data;
  }

  static async markAsRead(id) {
    const response = await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    return response.data;
  }

  static async markAllAsRead() {
    const response = await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return response.data;
  }

  static async getTenantNotifications(tenantId, params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BY_TENANT(tenantId), { params });
    return response.data;
  }
}

// Export main client as default
export default apiClient;
