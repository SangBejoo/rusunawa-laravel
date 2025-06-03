import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Navbar from './components/Navbar.jsx';

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

// Function to load the navbar with guaranteed presence
function loadNavbar() {
  console.log('Loading navbar - function called');
  const navbarRoot = document.getElementById('navbar-root');
  
  if (navbarRoot) {
    console.log('Navbar root element found, mounting React Navbar...');
    
    try {
      // First remove any existing content or navbar
      while (navbarRoot.firstChild) {
        navbarRoot.removeChild(navbarRoot.firstChild);
      }
      
      // Set the navbar to be flush with the top
      navbarRoot.style.position = 'sticky';
      navbarRoot.style.top = '0';
      navbarRoot.style.zIndex = '1000';
      navbarRoot.style.width = '100%';
      
      // Create a fresh render every time
      const root = createRoot(navbarRoot);
      root.render(
        <ChakraProvider theme={theme}>
          <Navbar forceDisplay={true} />
        </ChakraProvider>
      );
      console.log('React Navbar mounted successfully');
    } catch (error) {
      console.error('Failed to mount React Navbar:', error);
      // Simple fallback navbar with no additional content
      navbarRoot.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
          <div class="container">
            <a class="navbar-brand" href="/">Rusunawa</a>
          </div>
        </nav>
      `;
    }
  } else {
    console.error('Navbar root element not found in the DOM');
  }
}

// Load immediately if possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadNavbar);
} else {
  loadNavbar();
}

// Try again when window loads to catch any timing issues
window.addEventListener('load', loadNavbar);

// Make loadNavbar available globally for direct calling from any page
window.loadNavbar = loadNavbar;

// Export the loadNavbar function for direct use in modules
export { loadNavbar };
