import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChakraProvider from './ChakraProvider.jsx';
import LandingPage from './LandingPage.jsx';
import RoomListPage from './RoomListPage.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import UnderDevelopmentPage from './UnderDevelopmentPage.jsx';

// Main App component with routing
const App = () => {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route path="/rooms" element={<RoomListPage />} />
          <Route path="/facilities" element={<UnderDevelopmentPage />} />
          <Route path="/about" element={<UnderDevelopmentPage />} />
          <Route path="/contact" element={<UnderDevelopmentPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
};

// Mount the React application when DOM is loaded
const root = document.getElementById('landing-root');
if (root) {
  createRoot(root).render(<App />);
}
