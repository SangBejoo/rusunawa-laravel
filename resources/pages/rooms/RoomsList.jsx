import React, { useState, useEffect } from 'react';
import {
  Box, Container, Heading, Text, SimpleGrid, VStack, 
  HStack, Select, Input, InputGroup, InputLeftElement, 
  Button, useColorModeValue, Spinner, Alert, AlertIcon,
  Flex, RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, 
  RangeSliderThumb, Stack, useDisclosure, Drawer, DrawerBody, 
  DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton
} from '@chakra-ui/react';
import { FaSearch, FaFilter, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import TenantLayout from '../../components/layout/TenantLayout';
import roomService from '../../services/roomService';
import RoomCard from '../../components/room/RoomCard';
import { calculateRoomOccupancy } from '../../utils/roomUtils';

const RoomsList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    classification: '',
    rentalType: '',
    minRate: 0,
    maxRate: 10000000,
    search: '',
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  
  // Color modes
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Extract min and max rates from rooms for the slider
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  
  useEffect(() => {
    fetchRooms();
  }, []);
  
  const fetchRooms = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await roomService.getRooms(params);
      
      if (response && response.rooms) {
        // Adapt rooms to include occupancy information
        const adaptedRooms = response.rooms.map(room => ({
          ...room,
          // Ensure proper field mapping
          room_id: room.roomId,
          id: room.roomId,
          // Calculate occupancy from occupants array
          occupancy: calculateRoomOccupancy(room)
        }));
        
        setRooms(adaptedRooms);
        
        // Calculate price range for filter
        if (adaptedRooms.length > 0) {
          const rates = adaptedRooms.map(room => room.rate);
          const minRate = Math.min(...rates);
          const maxRate = Math.max(...rates);
          setPriceRange({ min: minRate, max: maxRate });
          
          // Initialize filter with actual min and max
          setFilters(prev => ({
            ...prev, 
            minRate: minRate, 
            maxRate: maxRate
          }));
        }
      } else {
        setRooms([]);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value,
    });
  };
  
  const applyFilters = () => {
    const params = {
      classification: filters.classification,
      rental_type: filters.rentalType,
      min_rate: filters.minRate,
      max_rate: filters.maxRate,
      search: filters.search,
    };
    
    // Remove empty params
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });
    
    fetchRooms(params);
    
    // Close drawer on mobile
    if (isOpen) {
      onClose();
    }
  };
  
  const resetFilters = () => {
    setFilters({
      classification: '',
      rentalType: '',
      minRate: priceRange.min,
      maxRate: priceRange.max,
      search: '',
    });
    
    fetchRooms();
  };
  
  const handleRoomClick = (roomId) => {
    navigate(`/tenant/rooms/${roomId}`);
  };
  
  // Filters UI for desktop
  const FiltersUI = () => (
    <Box 
      p={4} 
      bg={bgColor} 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="md"
    >
      <VStack align="stretch" spacing={4}>
        <Heading size="md">Filters</Heading>
        
        <Box>
          <Text mb={2} fontWeight="medium">Room Type</Text>
          <Select
            placeholder="All Types"
            value={filters.classification}
            onChange={(e) => handleFilterChange('classification', e.target.value)}
          >
            <option value="perempuan">Female Room</option>
            <option value="laki_laki">Male Room</option>
            <option value="VIP">VIP Room</option>
            <option value="ruang_rapat">Meeting Room</option>
          </Select>
        </Box>
        
        <Box>
          <Text mb={2} fontWeight="medium">Rental Type</Text>
          <Select
            placeholder="All Rental Types"
            value={filters.rentalType}
            onChange={(e) => handleFilterChange('rentalType', e.target.value)}
          >
            <option value="harian">Daily</option>
            <option value="bulanan">Monthly</option>
          </Select>
        </Box>
        
        <Box>
          <Text mb={2} fontWeight="medium">Price Range</Text>
          <RangeSlider
            min={priceRange.min}
            max={priceRange.max}
            step={(priceRange.max - priceRange.min) / 100}
            value={[filters.minRate, filters.maxRate]}
            onChange={([min, max]) => {
              handleFilterChange('minRate', min);
              handleFilterChange('maxRate', max);
            }}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
          <Flex justify="space-between" mt={1}>
            <Text fontSize="sm">Rp {filters.minRate.toLocaleString()}</Text>
            <Text fontSize="sm">Rp {filters.maxRate.toLocaleString()}</Text>
          </Flex>
        </Box>
        
        <Button 
          colorScheme="brand" 
          onClick={applyFilters}
        >
          Apply Filters
        </Button>
        
        <Button 
          variant="outline" 
          leftIcon={<FaTimesCircle />} 
          onClick={resetFilters}
        >
          Reset Filters
        </Button>
      </VStack>
    </Box>
  );
  
  return (
    <TenantLayout>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading>Available Rooms</Heading>
          <Text mt={2} color="gray.600">
            Browse our selection of comfortable and affordable rooms
          </Text>
        </Box>
        
        {/* Search and Filter */}
        <Flex 
          direction={{ base: 'column', md: 'row' }}
          mb={6}
          gap={4}
        >
          <InputGroup size="lg" maxW={{ md: '400px' }}>
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search rooms..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </InputGroup>
          
          <Stack direction="row" spacing={4}>
            <Button 
              size="lg" 
              colorScheme="brand" 
              onClick={applyFilters}
            >
              Search
            </Button>
            
            <Button
              display={{ base: 'flex', md: 'none' }}
              size="lg"
              leftIcon={<FaFilter />}
              onClick={onOpen}
            >
              Filters
            </Button>
          </Stack>
        </Flex>
        
        {error && (
          <Alert status="error" mb={6}>
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <Flex gap={6}>
          {/* Filters sidebar (desktop) */}
          <Box 
            display={{ base: 'none', md: 'block' }} 
            w="250px" 
            flexShrink={0}
          >
            <FiltersUI />
          </Box>
          
          {/* Room listing */}
          <Box flex="1">
            {loading ? (
              <Flex justify="center" py={10}>
                <Spinner size="xl" thickness="4px" color="brand.500" />
              </Flex>
            ) : error ? (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            ) : rooms.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No rooms found matching your criteria. Try adjusting your filters.
              </Alert>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {rooms.map((room) => {
                  // Ensure a valid key is used
                  const key = room.room_id || room.roomId || room.id || `room-${Math.random()}`;
                  return <RoomCard key={key} room={room} />;
                })}
              </SimpleGrid>
            )}
          </Box>
        </Flex>
      </Container>
      
      {/* Mobile filters drawer */}
      <Drawer 
        isOpen={isOpen} 
        placement="right" 
        onClose={onClose}
        size="sm"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Filters</DrawerHeader>
          <DrawerBody>
            <FiltersUI />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </TenantLayout>
  );
};

export default RoomsList;
