import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ChakraProvider, 
  extendTheme, 
  Container, 
  Box, 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription,
  Text,
  useToast,
  Button
} from '@chakra-ui/react';
import RoomList from './components/RoomList.jsx';
import SearchPanel from './components/SearchPanel.jsx';
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

const RoomsPage = () => {
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
  
  // Get error message if any
  const getErrorMessage = () => {
    const metaTag = document.querySelector('meta[name="api-error"]');
    return metaTag ? metaTag.content : null;
  };

  const initialData = getInitialData();
  const errorMessage = getErrorMessage();
  const [searchFilters, setSearchFilters] = useState(initialData?.filters || {});
  const toast = useToast();
  
  useEffect(() => {
    // Show toast if there was an error from the server
    if (errorMessage) {
      toast({
        title: "Server Error",
        description: errorMessage,
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    }
    
    // Check API connectivity
    checkApiStatus();
  }, []);
  
  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/rooms?limit=1');
      if (!response.ok) {
        toast({
          title: "API Connection Issue",
          description: "There may be problems with the room service. Some features might be limited.",
          status: "warning",
          duration: 10000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("API check failed:", error);
    }
  };

  const handleSearch = (filters) => {
    setSearchFilters(filters);
    // Redirect to rooms page with filters as query params
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    
    window.location.href = `/rooms?${searchParams.toString()}`;
  };

  return (
    <Box>
      <Navbar />
      
      <Container maxW="6xl" mt="6" mb="20">
        <Box mb={8}>
          <SearchPanel onSearch={handleSearch} initialFilters={searchFilters} />
        </Box>
        
        {errorMessage && (
          <Alert status="error" mb={6}>
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription display="block">{errorMessage}</AlertDescription>
            </Box>
            <Button onClick={() => window.location.reload()} ml={3}>
              Refresh
            </Button>
          </Alert>
        )}
        
        <RoomList initialData={initialData} />
      </Container>
      
      <Footer />
    </Box>
  );
};

// Initialize the app when the DOM is loaded
const initializeRoomsListApp = () => {
  const roomsListRoot = document.getElementById('rooms-list-root');
  
  if (!roomsListRoot) {
    console.error('Rooms list root element not found!');
    return;
  }
  
  try {
    createRoot(roomsListRoot).render(
      <ChakraProvider theme={theme}>
        <RoomsPage />
      </ChakraProvider>
    );
    console.log('React rooms list component mounted successfully');
  } catch (error) {
    console.error('Error mounting React component:', error);
  }
};

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeRoomsListApp);
} else {
  initializeRoomsListApp();
}
