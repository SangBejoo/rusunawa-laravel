import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/apiConfig';
import tenantAuthService from './tenantAuthService';
import { validateId } from '../utils/apiUtils';

/**
 * Service for handling booking-related operations
 */
const bookingService = {
  /**
   * Create a new booking
   * @param {Object} bookingData - The booking data
   * @returns {Promise<Object>} The booking creation response
   */  
  createBooking: async (bookingData) => {
    try {
      // Add authorization header if logged in
      const token = tenantAuthService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      };
      
      // Ensure date format matches API expectations (ISO string)
      const processedBookingData = {
        tenantId: parseInt(bookingData.tenantId),
        roomId: parseInt(bookingData.roomId),
        checkInDate: new Date(bookingData.checkInDate).toISOString(),
        checkOutDate: new Date(bookingData.checkOutDate).toISOString()
      };
      
      // Add optional fields if they exist
      if (bookingData.rentalTypeId) {
        processedBookingData.rentalTypeId = parseInt(bookingData.rentalTypeId);
      }
      if (bookingData.totalAmount) {
        processedBookingData.totalAmount = parseFloat(bookingData.totalAmount);
      }
        console.log("Sending booking request with data:", processedBookingData);
      console.log("Using Go API URL:", `${API_BASE_URL}${API_ENDPOINTS.BOOKINGS}`);
      console.log("Authorization header present:", !!config.headers.Authorization);
      
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.BOOKINGS}`, processedBookingData, config);
      console.log("Booking response received:", response.data);
      console.log("Response status:", response.status);
        // Handle different response formats
      if (response.data) {
        // Check if the response status indicates an error
        if (response.data.status && response.data.status.status === "error") {
          throw new Error(response.data.status.message || 'Booking failed');
        }
        
        // If the response has a booking object directly
        if (response.data.booking) {
          return response.data;
        }
        
        // If the response has status success
        if (response.data.status && response.data.status.status === "success") {
          // Try to extract booking ID if available
          if (response.data.bookingId) {
            return {
              booking: {
                bookingId: response.data.bookingId,
                ...processedBookingData
              },
              status: response.data.status
            };
          }
          
          // If no booking object but status is success, try to fetch the booking
          try {
            console.log("Attempting to fetch booking after creation...");            const bookingsResponse = await axios.get(
              `${API_BASE_URL}/tenants/${bookingData.tenantId}/bookings`, 
              { ...config, params: { page: 1, limit: 1 } }
            );
            
            if (bookingsResponse.data?.bookings?.length > 0) {
              const latestBooking = bookingsResponse.data.bookings[0];
              console.log("Found latest booking:", latestBooking);
              return {
                booking: latestBooking,
                status: response.data.status
              };
            }
          } catch (fetchError) {
            console.error("Error fetching booking after creation:", fetchError);
          }
        }
        
        // Return the response as-is if it doesn't match expected format
        return response.data;
      }
      
      throw new Error("No response data received");
    } catch (error) {
      console.error('Error creating booking:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Throw the actual error response for better debugging
      throw error.response?.data || { 
        message: error.message || 'Failed to create booking',
        details: error.toString()
      };
    }
  },

  /**
   * Get a specific booking by ID
   * @param {number|string} bookingId - The booking ID
   * @returns {Promise<Object>} The booking data
   */
  getBooking: async (bookingId) => {
    // Validate the booking ID first
    const validBookingId = validateId(bookingId);
    if (validBookingId === null) {
      throw new Error(`Invalid booking ID: ${bookingId}`);
    }
    
    try {
      // Add authorization header if logged in
      const token = tenantAuthService.getToken();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      console.log(`Fetching booking with ID: ${validBookingId}`);
      const response = await axios.get(`${API_URL}/${validBookingId}`, config);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking ${validBookingId}:`, error);
      throw error.response?.data || { message: 'Failed to fetch booking details' };
    }
  },

  /**
   * Get bookings for a specific tenant
   * @param {number} tenantId - The tenant ID
   * @param {Object} params - Query parameters (optional)
   * @returns {Promise<Object>} The tenant's bookings
   */
  getTenantBookings: async (tenantId, params = {}) => {
    try {
      const token = tenantAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Add params to config if they exist and are not empty
      if (params && Object.keys(params).length > 0) {
        config.params = params;
      }
      
      console.log(`Fetching bookings for tenant ${tenantId}...`);
      console.log('Request config:', config);
        // Fix the URL construction - use the correct endpoint
      const response = await axios.get(
        `${API_BASE_URL}/tenants/${tenantId}/bookings`, 
        config
      );
      
      console.log('Tenant bookings response:', response.data);
      
      // Map the response to ensure consistent field names
      if (response.data && response.data.bookings) {
        const mappedBookings = response.data.bookings.map(booking => ({
          ...booking,
          // Ensure consistent field mapping
          booking_id: booking.bookingId,
          room_id: booking.roomId,
          tenant_id: booking.tenantId,
          check_in: booking.checkInDate,
          check_out: booking.checkOutDate,
          start_date: booking.checkInDate,
          end_date: booking.checkOutDate,
          total_amount: booking.totalAmount,
          amount: booking.totalAmount,
          payment_status: booking.paymentStatus || 'pending'
        }));
        
        return {
          ...response.data,
          bookings: mappedBookings
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching tenant bookings:', error);
      throw error.response?.data || { message: 'Failed to fetch tenant bookings' };
    }
  },

  /**
   * Update a booking's status
   * @param {number} bookingId - The booking ID
   * @param {string} status - The new status
   * @returns {Promise<Object>} The update response
   */
  updateBookingStatus: async (bookingId, status) => {
    try {
      // Add authorization header
      const token = tenantAuthService.getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.put(
        `${API_URL}/${bookingId}/status`, 
        { status }, 
        config
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error updating status for booking ${bookingId}:`, error);
      throw error.response?.data || { message: 'Failed to update booking status' };
    }
  },

  /**
   * Cancel a booking
   * @param {number} bookingId - The booking ID
   * @returns {Promise<Object>} The cancellation response
   */
  cancelBooking: async (bookingId) => {
    try {
      // Canceling a booking is just updating its status to 'cancelled'
      return await bookingService.updateBookingStatus(bookingId, 'cancelled');
    } catch (error) {
      console.error(`Error cancelling booking ${bookingId}:`, error);
      throw error.response?.data || { message: 'Failed to cancel booking' };
    }
  },

  /**
   * Check in for a booking
   * @param {number} bookingId - The booking ID
   * @param {FormData} checkInData - The check-in data including room image
   * @returns {Promise<Object>} The check-in response
   */
  checkIn: async (bookingId, checkInData) => {
    try {
      // Add authorization header
      const token = tenantAuthService.getToken();
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'  // Important for file upload
        } 
      };
      
      const response = await axios.post(
        `${API_URL}/${bookingId}/check-in`, 
        checkInData, 
        config
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error checking in for booking ${bookingId}:`, error);
      throw error.response?.data || { message: 'Failed to check in' };
    }
  },

  /**
   * Check out for a booking
   * @param {number} bookingId - The booking ID
   * @param {FormData} checkOutData - The check-out data including room image and feedback
   * @returns {Promise<Object>} The check-out response
   */
  checkOut: async (bookingId, checkOutData) => {
    try {
      // Add authorization header
      const token = tenantAuthService.getToken();
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'  // Important for file upload
        } 
      };
      
      const response = await axios.post(
        `${API_URL}/${bookingId}/check-out`, 
        checkOutData, 
        config
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error checking out for booking ${bookingId}:`, error);
      throw error.response?.data || { message: 'Failed to check out' };
    }
  },

  /**
   * Submit feedback for a booking
   * @param {number} bookingId - The booking ID
   * @param {Object} feedbackData - The feedback data
   * @param {number} feedbackData.rating - Rating (1-5)
   * @param {string} feedbackData.comments - Comments
   * @returns {Promise<Object>} The feedback submission response
   */
  submitFeedback: async (bookingId, feedbackData) => {
    try {
      // Add authorization header
      const token = tenantAuthService.getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(
        `${API_URL}/${bookingId}/feedback`, 
        feedbackData, 
        config
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error submitting feedback for booking ${bookingId}:`, error);
      throw error.response?.data || { message: 'Failed to submit feedback' };
    }
  }
};

export default bookingService;
