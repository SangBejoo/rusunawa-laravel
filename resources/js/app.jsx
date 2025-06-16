import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import '../css/app.css';

import { TenantAuthProvider } from '../context/tenantAuthContext';
import TenantRoutes from '../tenantRoutes';
import Landing from '../pages/Landing';
import theme from '../theme/index';

const App = () => (
  <ChakraProvider theme={theme}>
    <Router>
      <TenantAuthProvider>
        <Routes>
          <Route path="/tenant/*" element={<TenantRoutes />} />
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TenantAuthProvider>
    </Router>
  </ChakraProvider>
);

const root = createRoot(document.getElementById('root'));
root.render(<App />);
