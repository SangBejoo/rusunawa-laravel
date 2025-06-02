import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, AlertIcon, Box, CloseButton } from '@chakra-ui/react';

export default function ApiStatusAlert() {
  const [apiDown, setApiDown] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    // Check API status on component mount
    checkApiStatus();
    
    // Set up interval to check API status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    
    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const checkApiStatus = async () => {
    try {
      // Try to ping the API
      await axios.get('/api/health-check', { timeout: 3000 });
      setApiDown(false);
    } catch (error) {
      console.warn('API health check failed:', error);
      setApiDown(true);
    }
  };

  if (apiDown && showAlert) {
    return (
      <Box position="fixed" top="0" left="0" right="0" zIndex="1000">
        <Alert status="warning">
          <AlertIcon />
          The backend API server appears to be down. Some features may not work correctly.
          <CloseButton 
            position="absolute" 
            right="8px" 
            top="8px" 
            onClick={() => setShowAlert(false)} 
          />
        </Alert>
      </Box>
    );
  }

  return null;
}
