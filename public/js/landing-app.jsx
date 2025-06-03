import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import LandingPage from './LandingPage.jsx';

// Define brand colors for theme consistency
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#badcfb',
      200: '#8fc5f5',
      300: '#62adf0',
      400: '#3f99eb',
      500: '#1c85e8',
      600: '#0e6cc5',
      700: '#0052a2',
      800: '#003a7d',
      900: '#00235b',
    },
  },
});

// Mount the landing page content without Router or Navbar
document.addEventListener('DOMContentLoaded', function() {
  const landingRoot = document.getElementById('landing-root');
  if (landingRoot) {
    console.log('Mounting landing page content');
    createRoot(landingRoot).render(
      <ChakraProvider theme={theme}>
        <LandingPage skipNavbar={true} />
      </ChakraProvider>
    );
  } else {
    console.error('Landing root element not found!');
  }
});
