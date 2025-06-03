import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import RegisterPage from './RegisterPage.jsx';

// Define theme with brand colors
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

// Mount the React registration application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const rootElement = document.getElementById('register-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <ChakraProvider theme={theme}>
        <RegisterPage />
      </ChakraProvider>
    );
  }
});
