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
} from '@chakra-ui/react';
import { SearchIcon, StarIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { roomApi } from './api.js';

export default function RoomListPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('price_asc');
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    priceRange: 'all',
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await roomApi.getRooms();
        
        if (response.data && response.data.rooms) {
          // Transform API data to match our component's expected format
          const formattedRooms = response.data.rooms.map(room => ({
            id: room.roomId,
            title: room.name,
            type: getTypeFromClassification(room.classification),
            description: room.description || 'Comfortable accommodation for your stay.',
            price: room.rate,
            rating: 4, // Default rating since API doesn't provide one
            reviews: Math.floor(Math.random() * 50) + 5, // Random review count since API doesn't provide one
            available: true, // Assuming all returned rooms are available
            features: room.amenities?.map(a => a.name) || getDefaultFeatures(room.classification),
            image: getRoomImage(room.classification),
            capacity: room.capacity,
            classification: room.classification
          }));
          
          setRooms(formattedRooms);
        } else {
          // Fallback to mock data if API response structure is unexpected
          setRooms(mockRooms);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to fetch rooms. Please try again later.');
        setRooms(mockRooms); // Use mock data on error
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filteredAndSortedRooms = React.useMemo(() => {
    // Step 1: Apply filters
    let filteredRooms = [...rooms];
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredRooms = filteredRooms.filter(room => 
        room.title.toLowerCase().includes(searchTerm) || 
        room.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by room type
    if (filters.type !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.type === filters.type);
    }
    
    // Filter by price range
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filteredRooms = filteredRooms.filter(room => 
        room.price >= min && (max ? room.price <= max : true)
      );
    }
    
    // Step 2: Apply sorting
    switch (sortBy) {
      case 'price_asc':
        return filteredRooms.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return filteredRooms.sort((a, b) => b.price - a.price);
      case 'rating_desc':
        return filteredRooms.sort((a, b) => b.rating - a.rating);
      case 'availability':
        return filteredRooms.sort((a, b) => b.available - a.available);
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

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Box flex="1">
        <Container maxW="container.xl" py={8}>
          <Stack spacing={8}>
            <Stack spacing={2}>
              <Heading as="h1" size="xl">Find Your Perfect Room</Heading>
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
                  <option value="standard">Standard Single</option>
                  <option value="premium">Premium Single</option>
                  <option value="shared">Shared Room</option>
                </Select>
                
                <Select 
                  name="priceRange" 
                  value={filters.priceRange} 
                  onChange={handleFilterChange}
                  w={{ base: '100%', md: '200px' }}
                >
                  <option value="all">All Price Ranges</option>
                  <option value="0-1000000">Under Rp 1,000,000</option>
                  <option value="1000000-1500000">Rp 1,000,000 - Rp 1,500,000</option>
                  <option value="1500000-2000000">Rp 1,500,000 - Rp 2,000,000</option>
                  <option value="2000000-">Over Rp 2,000,000</option>
                </Select>

                <Select 
                  value={sortBy} 
                  onChange={handleSortChange}
                  w={{ base: '100%', md: '200px' }}
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="availability">Availability</option>
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
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                {filteredAndSortedRooms.map((room) => (
                  <Card key={room.id} overflow="hidden" variant="outline">
                    <Box position="relative">
                      <Image
                        src={room.image}
                        alt={room.title}
                        h="200px"
                        w="100%"
                        objectFit="cover"
                      />
                      {!room.available && (
                        <Badge
                          position="absolute"
                          top="10px"
                          right="10px"
                          px="2"
                          py="1"
                          colorScheme="red"
                          borderRadius="md"
                        >
                          Not Available
                        </Badge>
                      )}
                    </Box>
                    
                    <CardBody>
                      <Stack spacing={2}>
                        <HStack justify="space-between" align="center">
                          <Heading size="md">{room.title}</Heading>
                          <Badge colorScheme={getBadgeColor(room.type)}>{room.type}</Badge>
                        </HStack>
                        
                        <HStack>
                          {Array(5)
                            .fill('')
                            .map((_, i) => (
                              <StarIcon
                                key={i}
                                color={i < room.rating ? 'yellow.500' : 'gray.300'}
                              />
                            ))}
                          <Text ml={1} fontSize="sm">({room.reviews} reviews)</Text>
                        </HStack>
                        
                        <Text color={useColorModeValue('gray.600', 'gray.400')} noOfLines={2}>
                          {room.description}
                        </Text>
                        
                        <HStack spacing={4} wrap="wrap">
                          {room.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} colorScheme="green" variant="subtle">
                              {feature}
                            </Badge>
                          ))}
                          {room.features.length > 3 && (
                            <Badge colorScheme="gray" variant="subtle">+{room.features.length - 3}</Badge>
                          )}
                        </HStack>
                        
                        <Divider my={2} />
                        
                        <Flex justifyContent="space-between" alignItems="center">
                          <Text fontWeight="bold" fontSize="xl" color="brand.500">
                            Rp {room.price.toLocaleString('id-ID')}
                            <Text as="span" fontSize="sm" color="gray.500"> /night</Text>
                          </Text>
                          <Button 
                            as={Link}
                            to={`/rooms/${room.id}`}
                            size="sm" 
                            colorScheme="blue"
                            isDisabled={!room.available}
                          >
                            View Details
                          </Button>
                        </Flex>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}

// Helper function to determine room type from classification
function getTypeFromClassification(classification) {
  if (!classification) return 'standard';
  
  switch(classification.classificationId) {
    case 1:
      return 'premium'; // Female
    case 2:
      return 'standard'; // Male
    default:
      return 'shared';
  }
}

// Helper function to get default features based on room type
function getDefaultFeatures(classification) {
  const baseFeatures = ['WiFi', 'Desk', 'Wardrobe'];
  
  if (!classification) return baseFeatures;
  
  if (classification.classificationId === 1) {
    return [...baseFeatures, 'Private Bathroom', 'Premium Furniture'];
  } else if (classification.classificationId === 2) {
    return baseFeatures;
  } else {
    return [...baseFeatures, 'Shared Bathroom'];
  }
}

// Helper function to get room image based on classification
function getRoomImage(classification) {
  if (!classification) {
    return 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80';
  }
  
  // Different images based on room type
  switch(classification.classificationId) {
    case 1: // Female
      return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80';
    case 2: // Male
      return 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80';
    default:
      return 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
  }
}

// Mock room data
const mockRooms = [
  {
    id: 1,
    title: 'Standard Single Room A-101',
    type: 'standard',
    description: 'Comfortable single room with all essential amenities for students. Located on the first floor with good natural light.',
    price: 1000000,
    rating: 4,
    reviews: 32,
    available: true,
    features: ['WiFi', 'Desk', 'Wardrobe'],
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
  },
  {
    id: 2,
    title: 'Premium Single Room B-205',
    type: 'premium',
    description: 'Spacious premium room with private bathroom, additional storage space and better furnishings. Quiet location with park view.',
    price: 1800000,
    rating: 5,
    reviews: 18,
    available: true,
    features: ['Private Bathroom', 'WiFi', 'Study Area'],
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80',
  },
  {
    id: 3,
    title: 'Shared Room C-301',
    type: 'shared',
    description: 'Economic shared room option with two beds, shared desk area, and storage for each resident. Perfect for those who enjoy company.',
    price: 750000,
    rating: 3.5,
    reviews: 24,
    available: true,
    features: ['Shared', 'WiFi', '2 Beds'],
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: 4,
    title: 'Standard Single Room A-102',
    type: 'standard',
    description: 'Comfortable single room with east-facing window for morning sun. Located on the first floor with easy access.',
    price: 1050000,
    rating: 4.2,
    reviews: 15,
    available: false,
    features: ['WiFi', 'Desk', 'Wardrobe'],
    image: 'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: 5,
    title: 'Premium Single Room B-210',
    type: 'premium',
    description: 'Luxurious corner room with extra space, better furnishings, and a beautiful view of the campus gardens.',
    price: 2000000,
    rating: 4.8,
    reviews: 28,
    available: true,
    features: ['Private Bathroom', 'WiFi', 'Premium Furniture'],
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1457&q=80',
  },
  {
    id: 6,
    title: 'Shared Room C-302',
    type: 'shared',
    description: 'Spacious shared room with large windows, comfortable beds, and individual storage units. Perfect for social students.',
    price: 800000,
    rating: 3.8,
    reviews: 21,
    available: true,
    features: ['Shared', 'WiFi', '2 Beds'],
    image: 'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: 7,
    title: 'Standard Single Room A-203',
    type: 'standard',
    description: 'Well-maintained standard room located on the second floor with good ventilation and quiet environment.',
    price: 1100000,
    rating: 4.1,
    reviews: 19,
    available: true,
    features: ['WiFi', 'Desk', 'Wardrobe'],
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: 8,
    title: 'Premium Single Room B-301',
    type: 'premium',
    description: 'Top floor premium room with excellent ventilation, city view, and additional seating area for guests.',
    price: 1900000,
    rating: 4.7,
    reviews: 26,
    available: false,
    features: ['Private Bathroom', 'WiFi', 'Study Area'],
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: 9,
    title: 'Shared Room C-105',
    type: 'shared',
    description: 'Entry-level shared accommodation with basic amenities, well-suited for students looking for economical options.',
    price: 700000,
    rating: 3.3,
    reviews: 14,
    available: true,
    features: ['Shared', 'WiFi', '2 Beds'],
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
];
