import React from 'react';
import { createRoot } from 'react-dom/client';
import ChakraProvider from './ChakraProvider.jsx';
import LoginPage from './LoginPage.jsx';
import ApiStatusAlert from './components/ApiStatusAlert.jsx';

// Mount the React login application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('login-root');
  if (root) {
    createRoot(root).render(
      <ChakraProvider>
        <ApiStatusAlert />
        <LoginPage />
      </ChakraProvider>
    );
  }
});
