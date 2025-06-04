import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import TenantProfilePage from './TenantProfilePage.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

// Define the theme
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#badcfb',
      200: '#8fc5f5',
      300: '#62adf0',
      400: '#3f99eb',
      500: '#1c85e8', // Primary brand color
      600: '#0e6cc5',
      700: '#0052a2',
      800: '#003a7d',
      900: '#00235b',
    },
  },
  fonts: {
    heading: '"Nunito", sans-serif',
    body: '"Nunito", sans-serif',
  },
});

// Check if user is authenticated (client-side only)
const isAuthenticated = () => {
  const token = localStorage.getItem('tenant_token');
  const tenantData = localStorage.getItem('tenant_data');
  
  console.log("Authentication check:", token ? "Has token" : "No token", 
              tenantData ? "Has tenant data" : "No tenant data");
  
  return !!(token && tenantData);
};

// App component with authentication redirect
const TenantProfileApp = () => {
  // Store authentication status in state
  const [authChecked, setAuthChecked] = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    // Check authentication on load
    const authStatus = isAuthenticated();
    setAuthenticated(authStatus);
    setAuthChecked(true);

    // If not authenticated, redirect to login
    if (!authStatus) {
      console.log("Not authenticated, redirecting to login...");
      setTimeout(() => {
        window.location.href = '/tenant/login?redirect=/tenant/profile';
      }, 500); // Small delay to allow rendering of message
    }
  }, []);

  // Show loading state until auth check completes
  if (!authChecked) {
    return <div className="text-center p-5">Checking authentication...</div>;
  }

  // Show not authenticated message briefly before redirect
  if (!authenticated) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning">
          <h4>Authentication Required</h4>
          <p>Please log in to view your profile.</p>
          <p>Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  // Show the actual profile if authenticated
  return (
    <>
      <Navbar />
      <TenantProfilePage />
      <Footer />
    </>
  );
};

// Initialize the app when the DOM is loaded
const initializeProfileApp = () => {
  const profileRoot = document.getElementById('profile-root');
  
  if (!profileRoot) {
    console.error('Profile root element not found! App cannot be mounted.');
    return;
  }
  
  try {
    console.log('Mounting React tenant profile component...');
    createRoot(profileRoot).render(
      <ChakraProvider theme={theme}>
        <TenantProfileApp />
      </ChakraProvider>
    );
    console.log('React tenant profile component mounted successfully');
  } catch (error) {
    console.error('Error mounting React component:', error);
  }
};

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProfileApp);
} else {
  initializeProfileApp();
}
