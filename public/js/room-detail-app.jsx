import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import RoomDetailPage from './RoomDetailPage.jsx';
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

const RoomDetailApp = () => {
  // Get initial data from the meta tag
  const getInitialData = () => {
    const metaTag = document.querySelector('meta[name="api-data"]');
    if (metaTag) {
      try {
        return JSON.parse(metaTag.content);
      } catch (e) {
        console.error("Error parsing initial data:", e);
        return null;
      }
    }
    return null;
  };

  const initialData = getInitialData();

  return (
    <>
      <Navbar />
      <RoomDetailPage initialData={initialData} />
      <Footer />
    </>
  );
};

// Initialize the app when the DOM is loaded
const initializeRoomDetailApp = () => {
  const roomDetailRoot = document.getElementById('room-detail-root');
  
  if (!roomDetailRoot) {
    console.error('Room detail root element not found!');
    return;
  }
  
  try {
    createRoot(roomDetailRoot).render(
      <ChakraProvider theme={theme}>
        <RoomDetailApp />
      </ChakraProvider>
    );
    console.log('React room detail component mounted successfully');
  } catch (error) {
    console.error('Error mounting React component:', error);
  }
};

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeRoomDetailApp);
} else {
  initializeRoomDetailApp();
}
