import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Image,
  Text,
  Heading,
  Badge,
  Stack,
  Button,
  Icon,
  List,
  ListItem,
  ListIcon,
  Divider,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tag,
  TagLabel,
  TagLeftIcon
} from '@chakra-ui/react';
import { CheckIcon, InfoIcon } from '@chakra-ui/icons';
import { FaBed, FaWifi, FaShower, FaUsers, FaAirFreshener, FaDesktop } from 'react-icons/fa';
import axios from 'axios';

// Helper function to get icon for a feature
const getFeatureIcon = (featureName) => {
  switch(featureName) {
    case 'AC': 
      return FaAirFreshener;
    case 'private_bathroom':
    case 'shared_bathroom':
      return FaShower;
    case 'single_bed':
    case 'double_bed':
      return FaBed;
    case 'wifi':
      return FaWifi;
    case 'desk':
      return FaDesktop;
    default:
      return InfoIcon;
  }
};

// Helper function to format classification name
const formatClassification = (classification) => {
  switch(classification) {
    case 'laki_laki':
      return 'Male Only';
    case 'perempuan':
      return 'Female Only';
    case 'VIP':
      return 'VIP';
    case 'ruang_rapat':
      return 'Meeting Room';
    default:
      return classification?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  }
};

// Helper function to format rental type
const formatRentalType = (rentalType) => {
  switch(rentalType) {
    case 'harian':
      return 'Daily';
    case 'bulanan':
      return 'Monthly';
    default:
      return rentalType?.replace(/\b\w/g, l => l.toUpperCase()) || '';
  }
};

// Helper to generate a placeholder image based on room type
const getPlaceholderImage = (classificationName) => {
  switch(classificationName) {
    case 'VIP':
      return 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80';
    case 'perempuan':
      return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80';
    case 'laki_laki':
      return 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80';
    case 'ruang_rapat':
      return 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80';
    default:
      return 'https://via.placeholder.com/1200x600?text=Room+Image';
  }
};

const RoomDetailPage = ({ initialData }) => {
  const [room, setRoom] = useState(initialData?.room || null);
  const [loading, setLoading] = useState(!initialData?.room);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState({
    startDate: '',
    endDate: '',
    roomId: initialData?.room?.roomId || '',
    tenantId: ''
  });
  const [bookingErrors, setBookingErrors] = useState({});
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tenant, setTenant] = useState(null);
  
  const toast = useToast();
  
  useEffect(() => {
    // Check if user is logged in
    const tenantToken = localStorage.getItem('tenant_token');
    const tenantDataStr = localStorage.getItem('tenant_data');
    
    if (tenantToken && tenantDataStr) {
      try {
        const tenantData = JSON.parse(tenantDataStr);
        
        // Validate that we have a tenant ID
        if (tenantData && (tenantData.id || tenantData.tenantId || (tenantData.tenant && tenantData.tenant.id))) {
          const actualTenantId = tenantData.id || tenantData.tenantId || (tenantData.tenant && tenantData.tenant.id);
          
          setIsAuthenticated(true);
          setTenant(tenantData);
          
          // Set the tenant ID for booking
          setBooking(prev => ({
            ...prev,
            tenantId: actualTenantId
          }));
          
          // Log successful authentication state
          console.log('User is authenticated with tenant ID:', actualTenantId);
        } else {
          console.error('Tenant data does not contain an ID:', tenantData);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error parsing tenant data:', error);
        setIsAuthenticated(false);
      }
    }
    
    // Set up event listener for auth changes
    window.addEventListener('auth-event', handleAuthEvent);
    
    // If no initial data, fetch room details
    if (!initialData?.room) {
      fetchRoomDetails();
    }
    
    // Set minimum dates for the booking
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    setBooking(prev => ({
      ...prev,
      startDate: formatDate(today),
      endDate: formatDate(tomorrow)
    }));
    
    return () => {
      window.removeEventListener('auth-event', handleAuthEvent);
    };
  }, []);
  
  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      
      // Extract room ID from URL
      const pathParts = window.location.pathname.split('/');
      const roomId = pathParts[pathParts.length - 1];
      
      const response = await axios.get(`/api/rooms/${roomId}`);
      
      if (response.data && response.data.room) {
        setRoom(response.data.room);
        setBooking(prev => ({
          ...prev,
          roomId: response.data.room.roomId
        }));
      } else {
        setError('Room details not available');
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
      setError('Failed to load room details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAuthEvent = (event) => {
    const { action, data } = event.detail;
    
    if (action === 'login' && data && data.tenant) {
      setIsAuthenticated(true);
      setTenant(data.tenant);
      
      // Update tenant ID in booking
      const tenantId = data.tenant.id || data.tenant.tenantId || (data.tenant.tenant && data.tenant.tenant.id);
      setBooking(prev => ({
        ...prev,
        tenantId: tenantId
      }));
      
      console.log('Auth event: User logged in with tenant ID:', tenantId);
    } else if (action === 'logout') {
      setIsAuthenticated(false);
      setTenant(null);
      console.log('Auth event: User logged out');
    }
  };
  
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBooking(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user changes input
    if (bookingErrors[name]) {
      setBookingErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateBooking = () => {
    const errors = {};
    
    if (!booking.startDate) {
      errors.startDate = 'Check-in date is required';
    }
    
    if (!booking.endDate) {
      errors.endDate = 'Check-out date is required';
    }
    
    if (booking.startDate && booking.endDate) {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      
      if (start >= end) {
        errors.endDate = 'Check-out date must be after check-in date';
      }
    }
    
    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Function to format dates for the API
  const formatDateForApi = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString();
  };

  const handleBookNow = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in - double check before submitting
    const tenantToken = localStorage.getItem('tenant_token');
    if (!tenantToken || !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book this room",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to login with return URL
      window.location.href = `/tenant/login?redirect=/rooms/${room.roomId}`;
      return;
    }
    
    if (!validateBooking()) {
      return;
    }
    
    try {
      setIsBookingSubmitting(true);
      
      const token = localStorage.getItem('tenant_token');
      
      // Prepare the booking data with proper date formatting
      const bookingData = {
        tenantId: parseInt(booking.tenantId),
        roomId: parseInt(booking.roomId),
        startDate: formatDateForApi(booking.startDate),
        endDate: formatDateForApi(booking.endDate)
      };
      
      console.log('Submitting booking with data:', bookingData);
      
      // Send the booking request to the API
      const response = await axios.post('/api/bookings', bookingData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Booking response:', response.data);
      
      if (response.data && response.data.booking) {
        toast({
          title: "Booking Successful",
          description: "Your room has been booked successfully!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        // Redirect to booking confirmation or bookings list
        setTimeout(() => {
          window.location.href = `/tenant/bookings`;
        }, 2000);
      } else {
        toast({
          title: "Booking Error",
          description: response.data?.status?.message || "There was an error with your booking. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
      
      let errorMessage = 'Failed to process your booking. Please try again later.';
      
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      
      // Check if the error is due to authentication
      if (err.response && err.response.status === 401) {
        // Token might be invalid or expired
        localStorage.removeItem('tenant_token');
        localStorage.removeItem('tenant_data');
        
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        
        setTimeout(() => {
          window.location.href = `/tenant/login?redirect=/rooms/${room.roomId}`;
        }, 1000);
        return;
      }
      
      toast({
        title: "Booking Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsBookingSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Container maxW="6xl" py={10}>
        <Box textAlign="center">
          <Heading>Loading room details...</Heading>
        </Box>
      </Container>
    );
  }
  
  if (error || !room) {
    return (
      <Container maxW="6xl" py={10}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error || 'Room not found'}</AlertDescription>
        </Alert>
        <Box textAlign="center" mt={6}>
          <Button colorScheme="blue" as="a" href="/rooms">
            Back to Room Listings
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxW="6xl" py={10}>
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
        <GridItem>
          {/* Room Images */}
          <Box mb={6} borderRadius="lg" overflow="hidden" boxShadow="md">
            <Image
              src={room.imageUrl || getPlaceholderImage(room.classification?.name)}
              alt={room.name}
              width="100%"
              height="400px"
              objectFit="cover"
            />
          </Box>
          
          {/* Room Details */}
          <Stack spacing={6}>
            <Box>
              <Flex justify="space-between" align="center" flexWrap="wrap">
                <Heading as="h1" size="xl" mb={2}>
                  {room.name}
                </Heading>
                
                <Stack direction="row" spacing={2}>
                  <Badge colorScheme={
                    room.classification?.name === 'VIP' ? 'purple' : 
                    room.classification?.name === 'perempuan' ? 'pink' : 
                    room.classification?.name === 'laki_laki' ? 'blue' : 'green'
                  } py={1} px={3} borderRadius="full" fontSize="sm">
                    {formatClassification(room.classification?.name)}
                  </Badge>
                  
                  <Badge colorScheme="teal" py={1} px={3} borderRadius="full" fontSize="sm">
                    {formatRentalType(room.rentalType?.name)}
                  </Badge>
                </Stack>
              </Flex>
              
              <Flex align="center" mt={2}>
                <Icon as={FaUsers} mr={2} color="gray.500" />
                <Text>{room.capacity} {room.capacity > 1 ? 'Persons' : 'Person'} Capacity</Text>
              </Flex>
              
              <Text mt={4} fontSize="lg" color="gray.700">
                {room.description}
              </Text>
            </Box>
            
            <Divider />
            
            {/* Amenities */}
            <Box>
              <Heading as="h3" size="md" mb={4}>
                Room Amenities
              </Heading>
              
              {room.amenities && room.amenities.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {room.amenities.map((amenity, index) => {
                    const FeatureIcon = getFeatureIcon(amenity.feature?.name);
                    return (
                      <Tag
                        key={index}
                        size="lg"
                        borderRadius="full"
                        variant="subtle"
                        colorScheme="blue"
                        py={2}
                      >
                        <TagLeftIcon as={FeatureIcon} boxSize="1.2em" />
                        <TagLabel>
                          {amenity.quantity > 1 && `${amenity.quantity}x `}
                          {amenity.feature?.description}
                        </TagLabel>
                      </Tag>
                    );
                  })}
                </SimpleGrid>
              ) : (
                <Text color="gray.500">No specific amenities listed for this room.</Text>
              )}
            </Box>
            
            <Divider />
            
            {/* Rules and Policies */}
            <Box>
              <Heading as="h3" size="md" mb={4}>
                Rules and Policies
              </Heading>
              
              <List spacing={2}>
                <ListItem>
                  <ListIcon as={CheckIcon} color="green.500" />
                  Check-in time: 2:00 PM
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckIcon} color="green.500" />
                  Check-out time: 12:00 PM
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckIcon} color="green.500" />
                  {room.classification?.name === 'perempuan' ? 'Female students only' : 
                   room.classification?.name === 'laki_laki' ? 'Male students only' : 'No gender restriction'}
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckIcon} color="green.500" />
                  No smoking allowed
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckIcon} color="green.500" />
                  {room.rentalType?.name === 'bulanan' ? 'Monthly payment required' : 'Daily payment required'}
                </ListItem>
              </List>
            </Box>
          </Stack>
        </GridItem>
        
        {/* Booking Panel */}
        <GridItem>
          <Box 
            position="sticky" 
            top="100px" 
            p={6} 
            bg="white" 
            borderRadius="lg"
            boxShadow="md"
          >
            <Heading as="h3" size="md" mb={6}>
              Book this Room
            </Heading>
            
            <Stack spacing={6}>
              <Stat>
                <StatLabel>Price per {room.rentalType?.name === 'bulanan' ? 'month' : 'day'}</StatLabel>
                <StatNumber>Rp {new Intl.NumberFormat('id-ID').format(room.rate || 0)}</StatNumber>
                <StatHelpText>Includes all basic amenities</StatHelpText>
              </Stat>
              
              <form onSubmit={handleBookNow}>
                <Stack spacing={4}>
                  <FormControl isInvalid={!!bookingErrors.startDate}>
                    <FormLabel>Check-in Date</FormLabel>
                    <Input
                      type="date"
                      name="startDate"
                      value={booking.startDate}
                      onChange={handleBookingChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {bookingErrors.startDate && (
                      <FormErrorMessage>{bookingErrors.startDate}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <FormControl isInvalid={!!bookingErrors.endDate}>
                    <FormLabel>Check-out Date</FormLabel>
                    <Input
                      type="date"
                      name="endDate"
                      value={booking.endDate}
                      onChange={handleBookingChange}
                      min={booking.startDate}
                    />
                    {bookingErrors.endDate && (
                      <FormErrorMessage>{bookingErrors.endDate}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    bg="brand.500"
                    size="lg"
                    w="100%"
                    _hover={{ bg: "brand.400" }}
                    isLoading={isBookingSubmitting}
                    loadingText="Processing"
                  >
                    Book Now
                  </Button>
                </Stack>
              </form>
              
              {!isAuthenticated && (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>
                    Please log in to book this room.
                  </AlertDescription>
                </Alert>
              )}
              
              <Box fontSize="sm" color="gray.600">
                <Text mb={2}>
                  <strong>Booking Note:</strong> Your booking will be confirmed after review.
                </Text>
                <Text>
                  <strong>Cancellation Policy:</strong> Free cancellation up to 24 hours before check-in.
                </Text>
              </Box>
            </Stack>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default RoomDetailPage;
