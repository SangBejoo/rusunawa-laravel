import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChakraProvider from './ChakraProvider.jsx';
import LandingPage from './LandingPage.jsx';
import RoomListPage from './RoomListPage.jsx';
import RoomDetailPage from './RoomDetailPage.jsx';
import DashboardPage from './DashboardPage.jsx';
import BookingHistoryPage from './BookingHistoryPage.jsx';
import DocumentUploadPage from './DocumentUploadPage.jsx';
import PaymentPage from './PaymentPage.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import UnderDevelopmentPage from './UnderDevelopmentPage.jsx';
import ApiStatusAlert from './components/ApiStatusAlert.jsx';

// Main App component with routing
const App = () => {
  return (
    <ChakraProvider>
      <ApiStatusAlert />
      <Router>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route path="/rooms" element={<RoomListPage />} />
          <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bookings" element={<BookingHistoryPage />} />
          <Route path="/documents" element={<DocumentUploadPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />
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
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('landing-root');
  if (root) {
    createRoot(root).render(<App />);
  }
});
