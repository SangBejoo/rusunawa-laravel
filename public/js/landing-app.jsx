import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import LandingPage from './LandingPage.jsx';

// Define the theme with brand colors
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

// Initialize the app when the DOM is loaded
const initializeLandingApp = () => {
  const landingRoot = document.getElementById('landing-root');
  
  if (!landingRoot) {
    console.error('Landing root element not found! App cannot be mounted.');
    return;
  }
  
  try {
    console.log('Mounting React landing component...');
    createRoot(landingRoot).render(
      <ChakraProvider theme={theme}>
        <LandingPage />
      </ChakraProvider>
    );
    console.log('React landing component mounted successfully');
  } catch (error) {
    console.error('Error mounting React component:', error);
  }
};

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLandingApp);
} else {
  initializeLandingApp();
}
