import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import LoginPage from './LoginPage.jsx';
import axios from 'axios';

// Define brand colors for theme consistency
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#badcfb',
      200: '#8fc5f5',
      300: '#62adf0',
      400: '#3f99eb',
      500: '#1c85e8',  // Primary brand color
      600: '#0e6cc5',
      700: '#0052a2',
      800: '#003a7d',
      900: '#00235b',
    },
  },
});

// Setup axios defaults for API communication
const setupAxios = () => {
  // We'll handle API URLs in the service directly
  // No global baseURL to avoid conflicts
  
  // Set default headers
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.headers.common['Accept'] = 'application/json';
  
  // Get JWT token if available
  const token = localStorage.getItem('tenant_token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // For Laravel routes, include CSRF token
  const csrfToken = document.head.querySelector('meta[name="csrf-token"]');
  if (csrfToken) {
    // Only set these headers for same-origin requests, not for the Go backend
    // We'll manually add these in service implementations when needed
  }
    // Set up response interceptor for handling token expiration
  axios.interceptors.response.use(
    response => response,
    error => {
      // Ignore CORS errors during login attempt, let the service handle them
      if (error.message === 'Network Error' && window.location.pathname.includes('/login')) {
        console.log('Network error during login, letting service handle it');
        return Promise.reject(error);
      }
      
      // Handle 401 Unauthorized errors (expired token)
      if (error.response && error.response.status === 401) {
        console.log('JWT token expired or invalid, redirecting to login');
        // Clear stored tokens
        localStorage.removeItem('tenant_token');
        localStorage.removeItem('tenant_data');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/tenant/login';
        }
      }
      return Promise.reject(error);
    }
  );
  
  return true;
};

// Wait for both DOM and React to be ready
const initializeLoginApp = () => {
  console.log('Initializing login app with JWT support...');
  const loginRoot = document.getElementById('login-root');
  
  if (!loginRoot) {
    console.error('Login root element not found! App cannot be mounted.');
    return;
  }

  // Set up axios
  setupAxios();

  try {
    console.log('Mounting React login component...');
    createRoot(loginRoot).render(
      <ChakraProvider theme={theme}>
        <LoginPage />
      </ChakraProvider>
    );
    console.log('React login component mounted successfully');
  } catch (error) {
    console.error('Error mounting React component:', error);
  }
};

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLoginApp);
} else {
  initializeLoginApp();
}
