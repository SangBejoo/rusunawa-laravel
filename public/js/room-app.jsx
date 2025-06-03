import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import RoomListPage from './RoomListPage.jsx';
import RoomDetailPage from './RoomDetailPage.jsx';

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

// Store API configuration globally
window.config = {
  apiBaseUrl: window.roomsData?.apiBaseUrl || 'http://localhost:8001/v1'
};

// Mount the appropriate component based on which root element exists
document.addEventListener('DOMContentLoaded', function() {
  console.log('Room app initializing...');
  
  // For Room List
  const roomListRoot = document.getElementById('room-list-root');
  if (roomListRoot) {
    console.log('Mounting Room List component with data:', window.roomsData);
    createRoot(roomListRoot).render(
      <ChakraProvider theme={theme}>
        <RoomListPage initialData={window.roomsData} skipNavbar={true} />
      </ChakraProvider>
    );
  }
  
  // For Room Detail
  const roomDetailRoot = document.getElementById('room-detail-root');
  if (roomDetailRoot) {
    console.log('Mounting Room Detail component with data:', window.roomData);
    createRoot(roomDetailRoot).render(
      <ChakraProvider theme={theme}>
        <RoomDetailPage initialData={window.roomData} skipNavbar={true} />
      </ChakraProvider>
    );
  }
});
