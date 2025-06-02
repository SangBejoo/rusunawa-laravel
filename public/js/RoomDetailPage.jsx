import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Image,
  Heading,
  Text,
  Badge,
  Stack,
  HStack,
  VStack,
  SimpleGrid,
  Button,
  Divider,
  List,
  ListItem,
  ListIcon,
  Flex,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Spinner,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  FiCalendar, 
  FiUsers, 
  FiWifi, 
  FiCheckCircle, 
  FiXCircle,
  FiAlertCircle,
  FiCreditCard,
} from 'react-icons/fi';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { roomApi, bookingApi } from './api.js';

export default function RoomDetailPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    numGuests: 1,
    specialRequests: '',
  });
  const [bookingErrors, setBookingErrors] = useState({});
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure(); // For booking confirmation modal
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        setLoading(true);
        const response = await roomApi.getRoom(roomId);
        
        if (response.data && response.data.room) {
          // Transform API data to match our component's expected format
          const roomData = response.data.room;
          setRoom({
            id: roomData.roomId,
            name: roomData.name,
            type: getTypeFromClassification(roomData.classification),
            description: roomData.description || 'Comfortable accommodation for your stay.',
            price: roomData.rate,
            rating: 4.5, // Default rating since API doesn't provide one
            reviews: Math.floor(Math.random() * 50) + 5,
            classification: roomData.classification,
            rentalType: roomData.rentalType,
            capacity: roomData.capacity || 1,
            amenities: roomData.amenities?.map(a => a.name) || getDefaultAmenities(),
            policies: getDefaultPolicies(),
            images: [
              getRoomImage(roomData.classification),
              'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
              'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            ],
            roomId: roomData.roomId
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching room details:', err);
        setError('Failed to load room details. Please try again later.');
        
        // For demo purposes, use mock data if API fails
        setRoom(mockRoom);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomDetail();
  }, [roomId]);
  
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (bookingErrors[name]) {
      setBookingErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateBookingData = () => {
    const errors = {};
    
    if (!bookingData.startDate) {
      errors.startDate = 'Check-in date is required';
    }
    
    if (!bookingData.endDate) {
      errors.endDate = 'Check-out date is required';
    }
    
    if (bookingData.startDate && bookingData.endDate) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      
      if (start >= end) {
        errors.endDate = 'Check-out must be after check-in';
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        errors.startDate = 'Check-in date cannot be in the past';
      }
    }
    
    if (bookingData.numGuests <= 0) {
      errors.numGuests = 'Number of guests must be at least 1';
    }
    
    if (room && room.capacity && bookingData.numGuests > room.capacity) {
      errors.numGuests = `Maximum capacity is ${room.capacity} guests`;
    }
    
    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateBookingData()) {
      return;
    }
    
    try {
      setIsBookingSubmitting(true);
      
      // Check if user is logged in
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (!isLoggedIn) {
        // Redirect to login page with a return URL
        toast({
          title: 'Authentication required',
          description: 'Please log in to book a room',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        
        // Save booking intent to session storage for after login
        sessionStorage.setItem('bookingIntent', JSON.stringify({
          roomId: room.id,
          ...bookingData
        }));
        
        navigate('/login?redirect=' + encodeURIComponent(`/rooms/${roomId}`));
        return;
      }
      
      // Get user data and tenant ID
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      if (!userData || !userData.tenantId) {
        throw new Error('Unable to retrieve tenant information');
      }
      
      // Create booking request
      const bookingRequest = {
        tenantId: userData.tenantId,
        roomId: room.roomId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        notes: bookingData.specialRequests || ''
      };
      
      // Call booking API
      const response = await bookingApi.createBooking(bookingRequest);
      
      if (response.data && response.data.booking) {
        // Show booking confirmation modal
        onOpen();
        
        // Reset form
        setBookingData({
          startDate: '',
          endDate: '',
          numGuests: 1,
          specialRequests: '',
        });
      } else {
        throw new Error('Invalid response from booking service');
      }
      
    } catch (err) {
      console.error('Error creating booking:', err);
      
      toast({
        title: 'Booking failed',
        description: err.response?.data?.message || 'Failed to create booking. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsBookingSubmitting(false);
    }
  };
  
  const handleViewBookings = () => {
    navigate('/bookings');
    onClose();
  };
  
  if (loading) {
    return (
      <Box minH="100vh" display="flex" flexDirection="column">
        <Navbar />
        <Box flex="1" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={4}>
            <Spinner size="xl" thickness="4px" color="brand.500" />
            <Text>Loading room details...</Text>
          </VStack>
        </Box>
        <Footer />
      </Box>
    );
  }
  
  if (error || !room) {
    return (
      <Box minH="100vh" display="flex" flexDirection="column">
        <Navbar />
        <Container maxW="container.xl" py={8} flex="1">
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error || 'Room not found'}</AlertDescription>
            </Box>
            <Button ml="auto" onClick={() => navigate('/rooms')}>
              Back to Rooms
            </Button>
          </Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      
      <Box as="main" flex="1">
        <Container maxW="container.xl" py={8}>
          {/* Room Header */}
          <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" mb={6}>
            <Box>
              <Heading size="xl">{room.name}</Heading>
              <HStack mt={2} spacing={3}>
                <Badge colorScheme={getBadgeColor(room.type)} fontSize="sm" px={2} py={1}>
                  {room.type}
                </Badge>
                <HStack>
                  {Array(5).fill('').map((_, i) => (
                    <Icon 
                      key={i} 
                      as={FiCheckCircle}
                      color={i < Math.floor(room.rating) ? 'yellow.500' : 'gray.300'} 
                    />
                  ))}
                </HStack>
                <Text color="gray.500">({room.reviews} reviews)</Text>
              </HStack>
            </Box>
            
            <Box>
              <Heading size="lg" color="brand.500">
                Rp {room.price.toLocaleString('id-ID')} 
                <Box as="span" fontSize="md" color="gray.500">
                  {` / ${room.rentalType?.name || 'day'}`}
                </Box>
              </Heading>
            </Box>
          </Stack>
          
          {/* Room Images */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={8}>
            <Image 
              src={room.images[0]} 
              alt={room.name}
              borderRadius="lg"
              objectFit="cover"
              height={{ base: "300px", md: "400px" }}
              width="100%"
            />
            <SimpleGrid columns={2} spacing={4} height={{ base: "300px", md: "400px" }}>
              {room.images.slice(1, 3).map((image, index) => (
                <Image 
                  key={index}
                  src={image}
                  alt={`${room.name} ${index + 2}`}
                  borderRadius="lg"
                  objectFit="cover"
                  height="100%"
                  width="100%"
                />
              ))}
            </SimpleGrid>
          </SimpleGrid>
          
          {/* Room Details and Booking */}
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
            {/* Details Section */}
            <Box gridColumn={{ lg: 'span 2' }}>
              <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                  <Tab>Description</Tab>
                  <Tab>Amenities</Tab>
                  <Tab>Policies</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Description Tab */}
                  <TabPanel>
                    <VStack align="start" spacing={4}>
                      <Box>
                        <Heading size="md" mb={2}>About this room</Heading>
                        <Text>{room.description}</Text>
                      </Box>
                      
                      <Box width="100%">
                        <Heading size="md" mb={3}>Room Details</Heading>
                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                          <HStack 
                            bg={bgColor} 
                            p={3} 
                            borderRadius="md" 
                            borderWidth="1px" 
                            borderColor={borderColor}
                          >
                            <Icon as={FiCalendar} color="brand.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">Type</Text>
                              <Text color="gray.600">
                                {room.classification?.name || room.type}
                              </Text>
                            </VStack>
                          </HStack>
                          
                          <HStack 
                            bg={bgColor} 
                            p={3} 
                            borderRadius="md" 
                            borderWidth="1px" 
                            borderColor={borderColor}
                          >
                            <Icon as={FiUsers} color="brand.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">Capacity</Text>
                              <Text color="gray.600">
                                {room.capacity} {room.capacity > 1 ? 'persons' : 'person'}
                              </Text>
                            </VStack>
                          </HStack>
                          
                          <HStack 
                            bg={bgColor} 
                            p={3} 
                            borderRadius="md" 
                            borderWidth="1px" 
                            borderColor={borderColor}
                          >
                            <Icon as={FiWifi} color="brand.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">Internet</Text>
                              <Text color="gray.600">Free WiFi</Text>
                            </VStack>
                          </HStack>
                          
                          <HStack 
                            bg={bgColor} 
                            p={3} 
                            borderRadius="md" 
                            borderWidth="1px" 
                            borderColor={borderColor}
                          >
                            <Icon as={FiCreditCard} color="brand.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">Rate</Text>
                              <Text color="gray.600">
                                {room.rentalType?.name === 'harian' ? 'Daily rate' : 'Monthly rate'}
                              </Text>
                            </VStack>
                          </HStack>
                        </SimpleGrid>
                      </Box>
                    </VStack>
                  </TabPanel>
                  
                  {/* Amenities Tab */}
                  <TabPanel>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {chunkedAmenities(room.amenities || []).map((chunk, idx) => (
                        <List key={idx} spacing={3}>
                          {chunk.map((amenity, i) => (
                            <ListItem key={i}>
                              <ListIcon as={FiCheckCircle} color="brand.500" />
                              {amenity}
                            </ListItem>
                          ))}
                        </List>
                      ))}
                    </SimpleGrid>
                  </TabPanel>
                  
                  {/* Policies Tab */}
                  <TabPanel>
                    <Stack spacing={4}>
                      {room.policies.map((policy, index) => (
                        <Box key={index}>
                          <Heading size="sm" mb={1}>{policy.title}</Heading>
                          <Text color="gray.600">{policy.description}</Text>
                        </Box>
                      ))}
                    </Stack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
            
            {/* Booking Form */}
            <Box>
              <Box 
                p={6} 
                borderWidth="1px" 
                borderRadius="lg" 
                bg={bgColor}
                boxShadow="md"
              >
                <Heading size="md" mb={4}>Book this room</Heading>
                
                <form onSubmit={handleBookingSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired isInvalid={bookingErrors.startDate}>
                      <FormLabel>Check-in Date</FormLabel>
                      <Input
                        type="date"
                        name="startDate"
                        value={bookingData.startDate}
                        onChange={handleBookingChange}
                      />
                      <FormErrorMessage>{bookingErrors.startDate}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isRequired isInvalid={bookingErrors.endDate}>
                      <FormLabel>Check-out Date</FormLabel>
                      <Input
                        type="date"
                        name="endDate"
                        value={bookingData.endDate}
                        onChange={handleBookingChange}
                      />
                      <FormErrorMessage>{bookingErrors.endDate}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isRequired isInvalid={bookingErrors.numGuests}>
                      <FormLabel>Number of Guests</FormLabel>
                      <Input
                        type="number"
                        name="numGuests"
                        min={1}
                        max={room.capacity}
                        value={bookingData.numGuests}
                        onChange={handleBookingChange}
                      />
                      <FormErrorMessage>{bookingErrors.numGuests}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Special Requests</FormLabel>
                      <Textarea
                        name="specialRequests"
                        value={bookingData.specialRequests}
                        onChange={handleBookingChange}
                        placeholder="Any special requests or notes..."
                        rows={3}
                      />
                    </FormControl>
                    
                    <Divider my={2} />
                    
                    {/* Price calculation */}
                    {bookingData.startDate && bookingData.endDate && (
                      <Box w="100%">
                        <Flex justify="space-between" mb={2}>
                          <Text>Room rate</Text>
                          <Text>Rp {room.price.toLocaleString('id-ID')}</Text>
                        </Flex>
                        
                        <Flex justify="space-between" mb={2}>
                          <Text>Number of {room.rentalType?.name === 'harian' ? 'days' : 'months'}</Text>
                          <Text>{calculateDays(bookingData.startDate, bookingData.endDate)}</Text>
                        </Flex>
                        
                        <Divider my={2} />
                        
                        <Flex justify="space-between" fontWeight="bold">
                          <Text>Total</Text>
                          <Text>
                            Rp {(room.price * calculateDays(bookingData.startDate, bookingData.endDate)).toLocaleString('id-ID')}
                          </Text>
                        </Flex>
                      </Box>
                    )}
                    
                    <Button 
                      type="submit" 
                      colorScheme="blue" 
                      size="lg" 
                      width="100%" 
                      isLoading={isBookingSubmitting}
                    >
                      Book Now
                    </Button>
                  </VStack>
                </form>
              </Box>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>
      
      {/* Booking Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Booking Confirmed!</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="center">
              <Icon as={FiCheckCircle} boxSize={12} color="green.500" />
              
              <Text>
                Your booking for <b>{room.name}</b> has been confirmed. 
                You will receive a confirmation email shortly.
              </Text>
              
              <Alert status="info">
                <AlertIcon />
                <Text fontSize="sm">
                  Please complete the payment process to finalize your booking.
                </Text>
              </Alert>
              
              <HStack spacing={4} width="100%">
                <Button onClick={handleViewBookings} colorScheme="blue" flex={1}>
                  View My Bookings
                </Button>
                <Button onClick={onClose} variant="outline" flex={1}>
                  Close
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      
      <Footer />
    </Box>
  );
}

// Helper functions
function getBadgeColor(type) {
  switch(type) {
    case 'standard':
      return 'blue';
    case 'premium':
      return 'purple';
    case 'shared':
      return 'green';
    default:
      return 'gray';
  }
}

function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
}

// Helper functions for room type and images (copied from RoomListPage)
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

function getDefaultAmenities() {
  return [
    'Free WiFi',
    'Work Desk',
    'Wardrobe',
    'Reading Light',
    'Air Conditioning',
    'Daily Housekeeping',
    'Shared Kitchen Access',
    'Shared Bathroom',
    'Security Lockers',
    'Laundry Service (additional fee)'
  ];
}

function getDefaultPolicies() {
  return [
    {
      title: 'Check-in / Check-out',
      description: 'Check-in from 2:00 PM, check-out until 12:00 PM. Early check-in and late check-out subject to availability.'
    },
    {
      title: 'Cancellation Policy',
      description: 'Free cancellation up to 3 days before check-in. Cancellations made within 3 days before check-in may be subject to a one-night charge.'
    },
    {
      title: 'Rules & Policies',
      description: 'No smoking inside rooms. Quiet hours from 10:00 PM to 7:00 AM. Visitors allowed only in common areas during visiting hours.'
    },
    {
      title: 'Payment',
      description: 'Full payment required at check-in. We accept cash, bank transfer, and credit/debit cards.'
    }
  ];
}

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

// Mock data
const mockRoom = {
  id: 1,
  name: 'Marina',
  type: 'premium',
  description: 'A spacious and comfortable room equipped with all essential amenities for a pleasant stay.',
  price: 100000,
  rating: 4.5,
  reviews: 32,
  classification: {
    classificationId: 1,
    name: 'perempuan'
  },
  rentalType: {
    rentalTypeId: 1,
    name: 'harian'
  },
  capacity: 1,
  amenities: getDefaultAmenities(),
  policies: getDefaultPolicies(),
  images: [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  ],
  roomId: 1
};
