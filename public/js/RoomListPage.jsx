import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  Image,
  Badge,
  Flex,
  Button,
  useColorModeValue,
  HStack,
  VStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  Divider,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import { FaBed, FaFemale, FaMale, FaCrown, FaUsers, FaWifi, FaToilet, FaAirFreshener } from 'react-icons/fa';
import Footer from './components/Footer.jsx';
import { roomApi } from './api.js';

export default function RoomListPage({ initialData = null, skipNavbar = false }) {
  const [rooms, setRooms] = useState(initialData?.rooms || []);
  const [totalCount, setTotalCount] = useState(initialData?.totalCount || 0);
  const [loading, setLoading] = useState(!initialData?.rooms);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('price_asc');
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    priceRange: 'all',
  });

  useEffect(() => {
    // If we have initial data from the server, use it
    if (initialData && initialData.rooms && initialData.rooms.length > 0) {
      console.log('Using server-provided room data:', initialData.rooms.length, 'rooms');
      setRooms(initialData.rooms);
      setTotalCount(initialData.totalCount || initialData.rooms.length);
      setLoading(false);
      return;
    }

    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await roomApi.getRooms();
        
        if (response.success && response.data && response.data.rooms) {
          console.log(`Loaded ${response.data.rooms.length} rooms from API`);
          setRooms(response.data.rooms);
          setTotalCount(response.data.totalCount || response.data.rooms.length);
        } else {
          setError('Could not load rooms from server. Please try again later.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to fetch rooms. Please try again later.');
        setLoading(false);
      }
    };

    fetchRooms();
  }, [initialData]);

  const filteredAndSortedRooms = React.useMemo(() => {
    // Step 1: Apply filters
    let filteredRooms = [...rooms];
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredRooms = filteredRooms.filter(room => 
        (room.name && room.name.toLowerCase().includes(searchTerm)) || 
        (room.description && room.description.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filter by room type
    if (filters.type !== 'all') {
      filteredRooms = filteredRooms.filter(room => 
        room.classification && room.classification.name === filters.type
      );
    }
    
    // Filter by price range
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filteredRooms = filteredRooms.filter(room => 
        room.rate >= min && (max ? room.rate <= max : true)
      );
    }
    
    // Step 2: Apply sorting
    switch (sortBy) {
      case 'price_asc':
        return filteredRooms.sort((a, b) => a.rate - b.rate);
      case 'price_desc':
        return filteredRooms.sort((a, b) => b.rate - a.rate);
      case 'capacity':
        return filteredRooms.sort((a, b) => b.capacity - a.capacity);
      default:
        return filteredRooms;
    }
  }, [rooms, sortBy, filters]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to get room type icon
  const getRoomTypeIcon = (classification) => {
    if (!classification || !classification.name) return FaBed;
    
    switch(classification.name) {
      case 'perempuan': return FaFemale;
      case 'laki_laki': return FaMale;
      case 'VIP': return FaCrown;
      case 'ruang_rapat': return FaUsers;
      default: return FaBed;
    }
  };

  // Function to get amenity icons
  const getAmenityIcon = (amenityName) => {
    switch(amenityName) {
      case 'AC': return FaAirFreshener;
      case 'wifi': return FaWifi;
      case 'private_bathroom': 
      case 'shared_bathroom': 
        return FaToilet;
      default: return null;
    }
  };

  // Function to get badge color
  const getBadgeColor = (classification) => {
    if (!classification || !classification.name) return 'gray';
    
    switch(classification.name) {
      case 'perempuan': return 'pink';
      case 'laki_laki': return 'blue';
      case 'VIP': return 'yellow';
      case 'ruang_rapat': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {/* Only include Navbar if skipNavbar is false */}
      
      <Box flex="1">
        <Container maxW="container.xl" py={8}>
          <Stack spacing={8}>
            <Stack spacing={2}>
              <Heading as="h1" size="xl">Available Rooms</Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                Browse through our selection of rooms and find the one that suits your needs
              </Text>
            </Stack>

            {/* Search and filters */}
            <Box 
              p={5} 
              shadow="md" 
              borderWidth="1px" 
              borderRadius="lg" 
              bg={useColorModeValue('white', 'gray.700')}
            >
              <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
                <InputGroup flex={1}>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input 
                    placeholder="Search for rooms..." 
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </InputGroup>
                
                <Select 
                  name="type" 
                  value={filters.type} 
                  onChange={handleFilterChange}
                  w={{ base: '100%', md: '200px' }}
                >
                  <option value="all">All Room Types</option>
                  <option value="laki_laki">Male Only</option>
                  <option value="perempuan">Female Only</option>
                  <option value="VIP">VIP</option>
                  <option value="ruang_rapat">Meeting Room</option>
                </Select>
                
                <Select 
                  name="priceRange" 
                  value={filters.priceRange} 
                  onChange={handleFilterChange}
                  w={{ base: '100%', md: '200px' }}
                >
                  <option value="all">All Price Ranges</option>
                  <option value="0-200000">Under Rp 200,000</option>
                  <option value="200000-350000">Rp 200,000 - Rp 350,000</option>
                  <option value="350000-500000">Rp 350,000 - Rp 500,000</option>
                  <option value="500000-">Over Rp 500,000</option>
                </Select>

                <Select 
                  value={sortBy} 
                  onChange={handleSortChange}
                  w={{ base: '100%', md: '200px' }}
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="capacity">Capacity</option>
                </Select>
              </Stack>
            </Box>

            {/* Room listings */}
            {loading ? (
              <Center py={10}>
                <VStack spacing={3}>
                  <Spinner size="xl" thickness="4px" speed="0.65s" color="brand.500" />
                  <Text>Loading rooms...</Text>
                </VStack>
              </Center>
            ) : error ? (
              <Alert status="error" borderRadius="lg">
                <AlertIcon />
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : filteredAndSortedRooms.length === 0 ? (
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <AlertTitle>No rooms found!</AlertTitle>
                <AlertDescription>Try changing your search criteria.</AlertDescription>
              </Alert>
            ) : (
              <>
                <Text>Showing {filteredAndSortedRooms.length} of {totalCount} rooms</Text>
                
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                  {filteredAndSortedRooms.map((room) => (
                    <Card key={room.roomId} overflow="hidden" variant="outline">
                      <Box position="relative" height="200px" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                        <Icon 
                          as={getRoomTypeIcon(room.classification)} 
                          boxSize="80px" 
                          color={`${getBadgeColor(room.classification)}.500`}
                        />
                      </Box>
                      
                      <CardBody>
                        <Stack spacing={2}>
                          <HStack justify="space-between" align="center">
                            <Heading size="md">Room {room.name}</Heading>
                            <Badge colorScheme={getBadgeColor(room.classification)}>
                              {room.classification?.name === 'perempuan' ? 'Female Only' : 
                               room.classification?.name === 'laki_laki' ? 'Male Only' :
                               room.classification?.name === 'ruang_rapat' ? 'Meeting Room' :
                               room.classification?.name === 'VIP' ? 'VIP' :
                               'Standard'}
                            </Badge>
                          </HStack>
                          
                          <Text color={useColorModeValue('gray.600', 'gray.400')} noOfLines={2}>
                            {room.description || 'Comfortable accommodation for your stay.'}
                          </Text>
                          
                          {/* Amenities */}
                          <HStack spacing={3} overflow="hidden" flexWrap="wrap">
                            {room.amenities && room.amenities.slice(0, 3).map((amenity, idx) => {
                              const icon = getAmenityIcon(amenity.feature?.name);
                              if (!icon) return null;
                              return (
                                <Icon 
                                  key={idx}
                                  as={icon} 
                                  color="gray.500" 
                                  title={amenity.feature?.description || amenity.feature?.name}
                                />
                              );
                            })}
                            {room.amenities && room.amenities.length > 3 && (
                              <Text fontSize="sm" color="gray.500">+{room.amenities.length - 3} more</Text>
                            )}
                          </HStack>
                          
                          <HStack spacing={4}>
                            <Badge colorScheme="blue" variant="subtle">
                              {room.capacity} {room.capacity > 1 ? 'persons' : 'person'}
                            </Badge>
                            <Badge colorScheme="green" variant="subtle">
                              {room.rentalType?.name === 'harian' ? 'Daily' : 'Monthly'}
                            </Badge>
                          </HStack>
                          
                          <Divider my={2} />
                          
                          <Flex justifyContent="space-between" alignItems="center">
                            <Text fontWeight="bold" fontSize="xl" color="brand.500">
                              Rp {(room.rate || 0).toLocaleString('id-ID')}
                              <Text as="span" fontSize="sm" color="gray.500"> 
                                /{room.rentalType?.name === 'harian' ? 'day' : 'month'}
                              </Text>
                            </Text>
                            <Button 
                              as="a"
                              href={`/rooms/${room.roomId}`}
                              size="sm" 
                              colorScheme="blue"
                            >
                              View Details
                            </Button>
                          </Flex>
                        </Stack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </>
            )}
          </Stack>
        </Container>
      </Box>
      
      {/* Only include Footer if skipNavbar is false (since we usually pair these) */}
      {!skipNavbar && <Footer />}
    </Box>
  );
}

// Mock room data as fallback
const mockRooms = [
  {
    roomId: 1,
    name: 'Standard Single Room A-101',
    classification: { name: 'standard' },
    description: 'Comfortable single room with all essential amenities for students. Located on the first floor with good natural light.',
    rate: 1000000,
    available: true,
    capacity: 1,
    rentalType: { name: 'harian' },
  },
  {
    roomId: 2,
    name: 'Premium Single Room B-205',
    classification: { name: 'premium' },
    description: 'Spacious premium room with private bathroom, additional storage space and better furnishings. Quiet location with park view.',
    rate: 1800000,
    available: true,
    capacity: 1,
    rentalType: { name: 'harian' },
  },
  {
    roomId: 3,
    name: 'Shared Room C-301',
    classification: { name: 'shared' },
    description: 'Economic shared room option with two beds, shared desk area, and storage for each resident. Perfect for those who enjoy company.',
    rate: 750000,
    available: true,
    capacity: 2,
    rentalType: { name: 'bulanan' },
  },
  {
    roomId: 4,
    name: 'Standard Single Room A-102',
    classification: { name: 'standard' },
    description: 'Comfortable single room with east-facing window for morning sun. Located on the first floor with easy access.',
    rate: 1050000,
    available: false,
    capacity: 1,
    rentalType: { name: 'harian' },
  },
  {
    roomId: 5,
    name: 'Premium Single Room B-210',
    classification: { name: 'premium' },
    description: 'Luxurious corner room with extra space, better furnishings, and a beautiful view of the campus gardens.',
    rate: 2000000,
    available: true,
    capacity: 1,
    rentalType: { name: 'harian' },
  },
  {
    roomId: 6,
    name: 'Shared Room C-302',
    classification: { name: 'shared' },
    description: 'Spacious shared room with large windows, comfortable beds, and individual storage units. Perfect for social students.',
    rate: 800000,
    available: true,
    capacity: 2,
    rentalType: { name: 'bulanan' },
  },
  {
    roomId: 7,
    name: 'Standard Single Room A-203',
    classification: { name: 'standard' },
    description: 'Well-maintained standard room located on the second floor with good ventilation and quiet environment.',
    rate: 1100000,
    available: true,
    capacity: 1,
    rentalType: { name: 'harian' },
  },
  {
    roomId: 8,
    name: 'Premium Single Room B-301',
    classification: { name: 'premium' },
    description: 'Top floor premium room with excellent ventilation, city view, and additional seating area for guests.',
    rate: 1900000,
    available: false,
    capacity: 1,
    rentalType: { name: 'harian' },
  },
  {
    roomId: 9,
    name: 'Shared Room C-105',
    classification: { name: 'shared' },
    description: 'Entry-level shared accommodation with basic amenities, well-suited for students looking for economical options.',
    rate: 700000,
    available: true,
    capacity: 2,
    rentalType: { name: 'bulanan' },
  },
];
