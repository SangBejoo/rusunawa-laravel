import axios from 'axios';
import { API_URL, getAuthHeader } from '../utils/apiConfig';

const issueService = {  /**
   * Report a new issue (using new /v1/issues with file upload)
   * @param {Object} issueData - The issue data object
   * @param {File} imageFile - The image file to upload (optional)
   * @returns {Promise<Object>} The report response
   */  reportIssue: async (issueData, imageFile = null) => {
    try {
      // Prepare the request body as JSON
      const requestBody = {
        tenantId: issueData.tenantId,
        reportedByUserId: issueData.reportedByUserId,
        description: issueData.description
      };

      // Add image data if provided
      if (imageFile) {
        // Convert image file to base64
        const imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Remove the data:image/jpeg;base64, prefix and get just the base64 string
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);        });

        // For protobuf over REST/JSON, bytes fields should be base64-encoded strings
        requestBody.fileName = imageFile.name;
        requestBody.fileType = imageFile.type;
        requestBody.content = imageBase64; // Send as base64 string for protobuf JSON
      }
      
      const response = await axios.post(
        `${API_URL}/issues`,
        requestBody,
        {
          headers: {
            ...getAuthHeader()
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error reporting issue:', error);
      throw error.response?.data || { message: 'Failed to report issue' };
    }
  },
  /**
   * Get issue details (using the new /v1/issues/{issueId} endpoint)
   * @param {number} issueId - The issue ID
   * @returns {Promise<Object>} The issue details
   */
  getIssue: async (issueId) => {
    try {      const response = await axios.get(
        `${API_URL}/issues/${issueId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching issue:', error);
      throw error.response?.data || { message: 'Failed to fetch issue' };
    }
  },

  /**
   * Get tenant issues
   * @param {number} tenantId - The tenant ID
   * @returns {Promise<Object>} The tenant issues
   */
  getTenantIssues: async (tenantId) => {
    try {
      const response = await axios.get(
        `${API_URL}/tenants/${tenantId}/issues`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching tenant issues:', error);
      throw error.response?.data || { message: 'Failed to fetch tenant issues' };
    }
  },
  /**
   * Get issues list (using the new /v1/issues endpoint)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} The issues list
   */
  getIssues: async (params = {}) => {
    try {      const response = await axios.get(
        `${API_URL}/issues`,
        { 
          headers: getAuthHeader(),
          params
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error.response?.data || { message: 'Failed to fetch issues' };
    }
  },

  /**
   * Update issue status
   * @param {number} issueId - The issue ID
   * @param {string} status - The new status
   * @returns {Promise<Object>} The update response
   */
  updateIssueStatus: async (issueId, status) => {
    try {
      const response = await axios.put(
        `${API_URL}/issues/${issueId}/status`,
        { status },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating issue status:', error);
      throw error.response?.data || { message: 'Failed to update issue status' };
    }
  },
    /**
   * Get issue image URL (using the new /v1/issues/{issueId}/image endpoint)
   * @param {number} issueId - The issue ID
   * @returns {string} The issue image URL
   */  getIssueImageUrl: (issueId) => {
    return `${API_URL}/issues/${issueId}/image`;
  },
  /**
   * Get issue image data (returns JSON with base64 content)
   * @param {number} issueId - The issue ID
   * @returns {Promise<Object>} The issue image data with base64 content
   */
  getIssueImage: async (issueId) => {
    try {
      const response = await axios.get(
        `${API_URL}/issues/${issueId}/image`,
        { 
          headers: getAuthHeader()
          // Don't set responseType to 'blob' since API returns JSON
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching issue image:', error);
      throw error.response?.data || { message: 'Failed to fetch issue image' };
    }
  }
};

export default issueService;
