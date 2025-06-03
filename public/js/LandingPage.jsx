import React, { useState } from 'react';
import { Box, Container } from '@chakra-ui/react';

import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import SearchPanel from './components/SearchPanel.jsx';
import RoomList from './components/RoomList.jsx';
import FeaturesSection from './components/FeaturesSection.jsx';
import Footer from './components/Footer.jsx';

export default function LandingPage() {
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    type: '',
    price_min: '',
    price_max: '',
    sort: 'recommended'
  });
  
  const handleSearch = (filters) => {
    setSearchFilters(filters);
    // Could also scroll to the room listings
    const roomsSection = document.getElementById('rooms-section');
    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <Box>
      <Navbar />
      <HeroSection />
      
      <Container maxW="6xl" mt={-20} position="relative" zIndex={10}>
        <SearchPanel onSearch={handleSearch} />
      </Container>
      
      <Container maxW="6xl" py={10} id="rooms-section">
        <RoomList filters={searchFilters} />
      </Container>
      
      <FeaturesSection />
      <Footer />
    </Box>
  );
}
