import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';
import tenantAuthService from './tenantAuthService';

const API_URL = `${API_BASE_URL}/v1/tenants`;

/**
 * Service for handling tenant profile operations
 */
const tenantService = {
  /**
   * Get current tenant profile
   * @returns {Promise<Object>} The tenant profile data
   */
  getProfile: async () => {
    try {
      // Get current tenant ID
      const tenant = tenantAuthService.getCurrentTenant();
      if (!tenant) {
        throw new Error('No authenticated tenant found');
      }
      
      // Add authorization header
      const token = tenantAuthService.getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_URL}/${tenant.tenantId}`, config);
      return response.data;
    } catch (error) {
      console.error('Error fetching tenant profile:', error);
      throw error.response?.data || { message: 'Failed to fetch profile information' };
    }
  },

  /**
   * Update tenant profile
   * @param {Object} profileData - The updated profile data
   * @returns {Promise<Object>} The updated profile
   */
  updateProfile: async (profileData) => {
    try {
      // Get current tenant ID
      const tenant = tenantAuthService.getCurrentTenant();
      if (!tenant) {
        throw new Error('No authenticated tenant found');
      }
      
      // Add authorization header
      const token = tenantAuthService.getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.put(
        `${API_URL}/${tenant.tenantId}`,
        profileData,
        config
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating tenant profile:', error);
      throw error.response?.data || { message: 'Failed to update profile information' };
    }
  },

  /**
   * Upload tenant profile picture
   * @param {FormData} imageData - The profile picture data
   * @returns {Promise<Object>} The upload response
   */
  uploadProfilePicture: async (imageData) => {
    try {
      // Get current tenant ID
      const tenant = tenantAuthService.getCurrentTenant();
      if (!tenant) {
        throw new Error('No authenticated tenant found');
      }
      
      // Add authorization header
      const token = tenantAuthService.getToken();
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };
      
      const response = await axios.post(
        `${API_URL}/${tenant.tenantId}/picture`,
        imageData,
        config
      );
      
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error.response?.data || { message: 'Failed to upload profile picture' };
    }
  },

  /**
   * Change tenant password
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} The response
   */
  changePassword: async (passwordData) => {
    try {
      // Add authorization header
      const token = tenantAuthService.getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(
        `${API_URL}/change-password`,
        passwordData,
        config
      );
      
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error.response?.data || { message: 'Failed to change password' };
    }
  },

  /**
   * Get tenant details by ID
   * @param {number} tenantId - The tenant ID
   * @returns {Promise<Object>} The tenant details
   */
  getTenantById: async (tenantId) => {
    try {
      // Add authorization header
      const token = tenantAuthService.getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      console.log(`Fetching tenant details for ID: ${tenantId}`);
      const response = await axios.get(`${API_URL}/${tenantId}`, config);
      console.log('Tenant details response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching tenant details for ID ${tenantId}:`, error);
      throw error.response?.data || { message: 'Failed to fetch tenant details' };
    }
  },
};

export default tenantService;
