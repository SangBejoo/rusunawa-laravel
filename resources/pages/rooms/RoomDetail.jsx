import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  GridItem,
  Box,
  Heading,
  Text,
  Image,
  HStack,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Icon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,  Alert,
  AlertIcon,
  Spinner,
  Divider,
  Badge,
  Progress,
  useColorModeValue,
  useToast,
  Flex,
  Tooltip,
  SimpleGrid
} from '@chakra-ui/react';
import { 
  MdArrowBack, 
  MdPerson, 
  MdAttachMoney,
  MdHotel,
  MdGroup,
  MdEventAvailable
} from 'react-icons/md';
import TenantLayout from '../../components/layout/TenantLayout';
import roomService from '../../services/roomService';
import bookingService from '../../services/bookingService';
import tenantAuthService from '../../services/tenantAuthService';
import { useTenantAuth } from '../../context/tenantAuthContext';
import { getFormattedRoomPrice, getRoomCapacityText, isRoomAvailable, validateDateSelectionByRentalType, calculateRoomOccupancy } from '../../utils/roomUtils';
import { formatCurrency } from '../../components/helpers/typeConverters';
import { defaultImages } from '../../utils/imageUtils';
import { getRoomImage } from '../../../utils/roomImageUtils';
import TenantRoomImageGallery from '../../components/room/TenantRoomImageGallery';

// Helper to get default room image
const getDefaultRoomImage = (room) => {
  return getRoomImage(room);
};

// Helper to display classification
const getClassificationDisplay = (classification) => {
  if (!classification) return 'Unknown';
  // You can customize this mapping as needed
  return classification.display_name || classification.name || 'Unknown';
};

// Helper to check authentication
// const isAuthenticated = tenantAuthService.isAuthenticated(); // Moved inside component

// Helper to calculate total price
const calculateTotalPrice = (startDate, endDate, rate) => {
  if (!startDate || !endDate || !rate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  // If monthly rental, calculate by months, else by days
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (rate.type === 'monthly' || rate.unit === 'month' || rate.period === 'bulanan') {
    // Calculate months
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return rate.amount * (months > 0 ? months : 1);
  }
  // Default: daily
  return rate.amount * (days > 0 ? days : 1);
};

const RoomDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();  
  const { isAuthenticated, tenant } = useTenantAuth(); // Get auth state and tenant from context
  
  // Debug: Log the authentication state
  console.log('RoomDetail - isAuthenticated:', isAuthenticated);
  
  // State management
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  // New state for occupancy information
  const [occupancyInfo, setOccupancyInfo] = useState(null);
  const [loadingOccupancy, setLoadingOccupancy] = useState(false);
  // Dynamic rates state
  const [dynamicRates, setDynamicRates] = useState({ daily: 0, monthly: 0 });
  const [loadingRates, setLoadingRates] = useState(false);
  
  // State for primary room image
  const [primaryImage, setPrimaryImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Add missing states for booking
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800'); 
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/tenant/login');
      return;
    }    
    // Navigate directly to booking page where date selection will happen
    navigate(`/tenant/rooms/${roomId}/book`);
  };

  const renderRoomFeatures = () => (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" fontWeight="semibold">Room Features & Amenities</Text>
      {room.amenities && room.amenities.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {room.amenities.map((amenity, index) => {
            // Handle different amenity data structures
            const amenityName = typeof amenity === 'object' 
              ? (amenity.custom_feature_name || amenity.customFeatureName || amenity.name || 'Unknown Feature')
              : String(amenity);
            
            const amenityDescription = typeof amenity === 'object' 
              ? (amenity.description || '') 
              : '';
            
            const amenityQuantity = typeof amenity === 'object' && amenity.quantity > 1 
              ? amenity.quantity 
              : null;

            return (
              <Box key={index} p={3} bg="gray.50" borderRadius="md">
                <HStack justify="space-between">
                  <Text fontWeight="medium">
                    {amenityName}
                  </Text>
                  {amenityQuantity && (
                    <Badge colorScheme="blue" fontSize="xs">
                      {amenityQuantity}x
                    </Badge>
                  )}
                </HStack>
                {amenityDescription && (
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {amenityDescription}
                  </Text>
                )}
              </Box>
            );
          })}
        </SimpleGrid>
      ) : (
        <Text color="gray.500">No specific amenities listed for this room.</Text>
      )}
    </VStack>
  );  const renderRoomLocation = () => (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" fontWeight="semibold">Room Location & Details</Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Box p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="medium" mb={2}>Room Information</Text>
          <VStack spacing={2} align="start">
            <Text fontSize="sm">
              <Text as="span" fontWeight="medium">Room Name: </Text>
              {room.name || 'N/A'}
            </Text>
            <Text fontSize="sm">
              <Text as="span" fontWeight="medium">Classification: </Text>
              {getClassificationDisplay(room.classification) || 'N/A'}
            </Text>            <Text fontSize="sm">
              <Icon as={MdGroup} color="blue.500" mr={1} />
              <Text as="span" fontWeight="medium">Capacity: </Text>
              {room.capacity ? `${room.capacity} ${room.capacity === 1 ? 'person' : 'people'}` : 'N/A'}
              {room.capacity && room?.occupants && (
                <Text as="span" color="gray.500" ml={2}>
                  ({room.occupants.filter(occupant => 
                    occupant.status === 'approved' || occupant.status === 'checked_in'
                  ).length} currently occupied)
                </Text>
              )}
            </Text>
            <Text fontSize="sm">
              <Text as="span" fontWeight="medium">Rental Type: </Text>
              {room.rentalType?.name || room.rental_type || 'N/A'}
            </Text>
          </VStack>
        </Box>
        <Box p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="medium" mb={2}>Building Information</Text>
          <VStack spacing={2} align="start">
            <Text fontSize="sm" color="gray.600">
              Located within the Rusunawa (Rumah Susun Sederhana Sewa) complex
            </Text>
            <Text fontSize="sm" color="gray.600">
              Affordable public housing facility managed by local government
            </Text>
            <Text fontSize="sm" color="gray.600">
              Accessible by public transportation and main roads
            </Text>
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  );

  const renderRoomPolicies = () => (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" fontWeight="semibold">Room Policies & Rules</Text>
      <SimpleGrid columns={{ base: 1 }} spacing={4}>
        <Box p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="medium" mb={3}>General Policies</Text>
          <VStack spacing={2} align="start">
            <Text fontSize="sm">• Check-in time: As per booking schedule</Text>
            <Text fontSize="sm">• Check-out time: As per booking schedule</Text>
            <Text fontSize="sm">• Maximum occupancy: {room.capacity || 'As specified'} person(s)</Text>
            {room.capacity && room?.occupants && (
              <Text fontSize="sm" color={
                room.occupants.filter(occupant => 
                  occupant.status === 'approved' || occupant.status === 'checked_in'
                ).length >= room.capacity ? 'red.500' : 'green.500'
              }>
                • Current availability: {Math.max(0, room.capacity - room.occupants.filter(occupant => 
                  occupant.status === 'approved' || occupant.status === 'checked_in'
                ).length)} space(s) remaining
              </Text>
            )}
            <Text fontSize="sm">• Payment must be completed before check-in</Text>
            <Text fontSize="sm">• ID verification required during check-in</Text>
          </VStack>
        </Box>
        
        {room.classification?.name === 'ruang_rapat' ? (
          <Box p={4} bg="blue.50" borderRadius="md">
            <Text fontWeight="medium" mb={3}>Meeting Room Specific Rules</Text>
            <VStack spacing={2} align="start">
              <Text fontSize="sm">• Professional use only</Text>
              <Text fontSize="sm">• Clean up after use</Text>
              <Text fontSize="sm">• No food or drinks without permission</Text>
              <Text fontSize="sm">• Equipment must be returned in original condition</Text>
            </VStack>
          </Box>
        ) : (
          <Box p={4} bg="green.50" borderRadius="md">
            <Text fontWeight="medium" mb={3}>Residential Room Rules</Text>
            <VStack spacing={2} align="start">
              <Text fontSize="sm">• Quiet hours: 10 PM - 6 AM</Text>
              <Text fontSize="sm">• No smoking inside the room</Text>
              <Text fontSize="sm">• Visitors must be registered</Text>
              <Text fontSize="sm">• Keep common areas clean</Text>
              <Text fontSize="sm">• Report any damages immediately</Text>
            </VStack>
          </Box>
        )}
        
        <Box p={4} bg="red.50" borderRadius="md">
          <Text fontWeight="medium" mb={3}>Important Notes</Text>
          <VStack spacing={2} align="start">
            <Text fontSize="sm">• Cancellation policy varies by rental type</Text>
            <Text fontSize="sm">• Security deposit may be required</Text>
            <Text fontSize="sm">• Management reserves the right to inspect rooms</Text>
            <Text fontSize="sm">• Violation of rules may result in booking termination</Text>
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  );
  const isMeetingRoom = () => room?.classification?.name === 'ruang_rapat'; // Example
  // Function to fetch primary image
  const fetchPrimaryImage = async (roomId) => {
    try {
      setImageLoading(true);
      
      if (!roomId || roomId === 'undefined') {
        console.warn('Missing or invalid room ID for image fetch:', roomId);
        return;
      }
      
      const image = await roomService.getPrimaryRoomImage(roomId);
      if (image) {
        console.log(`✅ [RoomDetail] Got primary image for room ${roomId}:`, image.imageName);
        setPrimaryImage(image);
      } else {
        console.log(`ℹ️ [RoomDetail] No primary image found for room ${roomId}`);
      }
    } catch (error) {
      console.error(`❌ [RoomDetail] Error fetching primary image for room ${roomId}:`, error);
    } finally {
      setImageLoading(false);
    }
  };

  const fetchDynamicRates = async () => {
    if (!tenant?.tenantId || !roomId) return;
    
    try {
      setLoadingRates(true);
      
      // Get daily rate
      const dailyRateResponse = await bookingService.getDynamicRate(
        tenant.tenantId,
        roomId,
        1 // Daily rental type
      );
      
      // Get monthly rate (only if not ruang_rapat)
      let monthlyRate = 0;
      if (room?.classification?.name !== 'ruang_rapat') {
        const monthlyRateResponse = await bookingService.getDynamicRate(
          tenant.tenantId,
          roomId,
          2 // Monthly rental type
        );
        monthlyRate = monthlyRateResponse?.rate || 0;
      }

      setDynamicRates({
        daily: dailyRateResponse?.rate || 0,
        monthly: monthlyRate
      });

    } catch (err) {
      console.error('Error loading dynamic rates for room detail:', roomId, err);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    const fetchRoomDetails = async () => {
      // Validate roomId first
      if (!roomId || roomId === 'undefined') {
        setError('Invalid room ID');
        setLoading(false);
        return;
      }      try {
        setLoading(true);        const response = await roomService.getRoom(roomId);
        if (response && response.room) {
          setRoom(response.room);
          // Fetch occupancy information after room details are loaded
          fetchOccupancyInfo();
          // Fetch primary image - use roomId or room_id
          const roomIdToUse = response.room.room_id || response.room.roomId || roomId;
          if (roomIdToUse && roomIdToUse !== 'undefined') {
            fetchPrimaryImage(roomIdToUse);
          } else {
            console.warn('No valid room ID available for image fetch:', response.room);
          }
        } else {
          setError('Room not found');
        }
      } catch (err) {
        console.error('Error fetching room details:', err);
        setError('Failed to load room details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  // Load dynamic rates when room and tenant are available
  useEffect(() => {
    if (room && tenant?.tenantId) {
      fetchDynamicRates();
    }
  }, [room, tenant?.tenantId]);

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    setIsAvailable(true);
    setError(null);
    
    // If monthly rental, automatically set end date to one month after start date
    if (room?.rentalType?.name === 'bulanan' && newStartDate) {
      const startDateObj = new Date(newStartDate);
      const endDateObj = new Date(startDateObj);
      endDateObj.setMonth(endDateObj.getMonth() + 1);
      // Keep the same day of month, adjusting for months with fewer days
      const desiredDay = startDateObj.getDate();
      endDateObj.setDate(Math.min(desiredDay, new Date(endDateObj.getFullYear(), endDateObj.getMonth() + 1, 0).getDate()));
      setEndDate(endDateObj.toISOString().split('T')[0]);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    setIsAvailable(true);
    setError(null);

    // For monthly rentals, ensure end date aligns with full months
    if (room?.rentalType?.name === 'bulanan' && startDate && newEndDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(newEndDate);
      const monthsDiff = (endDateObj.getFullYear() - startDateObj.getFullYear()) * 12 + 
                        endDateObj.getMonth() - startDateObj.getMonth();
      
      if (monthsDiff < 1) {
        // If selected end date is less than a month away, set it to one month from start
        const adjustedEndDate = new Date(startDateObj);
        adjustedEndDate.setMonth(adjustedEndDate.getMonth() + 1);
        setEndDate(adjustedEndDate.toISOString().split('T')[0]);
      }
    }
  };

  // Check room availability including capacity limits
  const checkRoomAvailability = async (startDate, endDate) => {
    if (!roomId || !startDate || !endDate) return false;
    
    // Validate dates using the utility function
    const dateValidation = validateDateSelectionByRentalType(room, startDate, endDate);
    if (!dateValidation.isValid) {
      toast({
        title: 'Invalid dates',
        description: dateValidation.error,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return false;
    }
    
    setIsCheckingAvailability(true);
    try {
      // Check both date availability and capacity using validated dates
      const response = await roomService.checkAvailability(
        roomId, 
        dateValidation.startDate, 
        dateValidation.endDate
      );
      
      // First check date-based availability (room_availability table)
      const isDateAvailable = isRoomAvailable(room, dateValidation.formattedStartDate, dateValidation.formattedEndDate, response.unavailable_dates);
      
      if (!isDateAvailable) {
        toast({
          title: 'Room not available',
          description: 'This room is blocked for the selected dates.',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
        return false;
      }
      
      // For non-meeting rooms, also check capacity limits
      const isMeetingRoom = room?.classification?.name === 'ruang_rapat';
      if (!isMeetingRoom && room?.capacity) {
        try {
          // Check capacity availability through backend
          const capacityResponse = await roomService.checkRoomCapacity(
            roomId,
            dateValidation.startDate,
            dateValidation.endDate
          );
          
          if (!capacityResponse.is_available) {
            toast({
              title: 'Room at full capacity',
              description: `This room is fully booked for the selected dates. Available slots: ${capacityResponse.available_slots || 0}`,
              status: 'error',
              duration: 3000,
              isClosable: true
            });
            return false;
          }
        } catch (capacityError) {
          console.error('Error checking room capacity:', capacityError);
          // If capacity check fails, still allow booking but warn user
          toast({
            title: 'Warning',
            description: 'Could not verify room capacity. Please check with administration.',
            status: 'warning',
            duration: 3000,
            isClosable: true
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking room availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to check room availability.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return false;
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleBookRoom = () => {
    if (!startDate || !endDate) {
      setError('Please select both check-in and check-out dates to book.');
      return;
    }
    if (!isAvailable) {
      setError('This room is not available for the selected dates.');
      return;
    }
    navigate(`/tenant/rooms/${roomId}/book?startDate=${startDate}&endDate=${endDate}`);
  };

  const calculateDurationMonths = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                      (end.getMonth() - start.getMonth());
    
    // Add 1 if end day is greater than or equal to start day
    if (end.getDate() >= start.getDate()) {
      return monthsDiff + 1;
    }
    
    return Math.max(1, monthsDiff); // Ensure minimum of 1 month
  };
  // Check availability automatically when dates change
  useEffect(() => {
    // Removed automatic availability checking as requested
    // Just set availability to true when both dates are selected
    if (startDate && endDate && room) {
      setIsAvailable(true);
      setCheckingAvailability(false);
    }
  }, [startDate, endDate, room]);

  // Fetch room occupancy information
  const fetchOccupancyInfo = async () => {
    if (!roomId || !room) return;
    
    setLoadingOccupancy(true);
    try {
      // Use occupancy data from room response
      const occupancyData = calculateRoomOccupancy(room);
      setOccupancyInfo(occupancyData);
    } catch (error) {
      console.error('Error calculating occupancy info:', error);
      // Set default occupancy info if calculation fails
      setOccupancyInfo({
        capacity: room?.capacity || 4,
        occupied_slots: 0,
        available_slots: room?.capacity || 4,
        occupancy_percentage: 0
      });
    } finally {
      setLoadingOccupancy(false);
    }
  };

  // Render occupancy status
  const renderOccupancyStatus = () => {
    if (!occupancyInfo || room?.classification?.name === 'ruang_rapat') return null;

    const { capacity, occupied_slots, available_slots, occupancy_percentage } = occupancyInfo;
    
    return (
      <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="sm" mb={6}>
        <Heading size="md" mb={4} display="flex" alignItems="center">
          <Icon as={MdHotel} mr={2} color="brand.500" />
          Current Occupancy
        </Heading>
        
        <SimpleGrid columns={2} spacing={4} mb={4}>
          <Box>
            <Text fontSize="sm" color="gray.500">Total Capacity</Text>
            <Text fontSize="lg" fontWeight="bold">{capacity} beds</Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.500">Currently Occupied</Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.500">{occupied_slots} beds</Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.500">Available Slots</Text>
            <Text fontSize="lg" fontWeight="bold" color="green.500">{available_slots} beds</Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.500">Occupancy Rate</Text>
            <Text fontSize="lg" fontWeight="bold">{Math.round(occupancy_percentage)}%</Text>
          </Box>
        </SimpleGrid>
        
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="medium">Occupancy Progress</Text>
            <Text fontSize="sm" color="gray.500">
              {occupied_slots}/{capacity}
            </Text>
          </Flex>
          <Progress 
            value={occupancy_percentage} 
            colorScheme={
              occupancy_percentage >= 100 ? "red" :
              occupancy_percentage >= 75 ? "orange" : 
              occupancy_percentage >= 50 ? "yellow" : "green"
            }
            size="lg" 
            borderRadius="full"
          />
          <HStack justify="space-between" mt={2}>
            <Badge 
              colorScheme={
                occupancy_percentage >= 100 ? "red" :
                occupancy_percentage >= 75 ? "orange" : 
                occupancy_percentage >= 50 ? "yellow" : "green"
              }
              variant="subtle"
            >
              {available_slots > 0 ? `${available_slots} slots available` : 'Fully occupied'}
            </Badge>
            <Text fontSize="xs" color="gray.500">
              Last updated: {new Date().toLocaleTimeString()}
            </Text>
          </HStack>
        </Box>
          {/* Room Capacity Information - Enhanced */}
        <Box>
          <Text fontSize="md" fontWeight="semibold" mb={3} color="blue.600">
            <Icon as={MdGroup} mr={2} />
            Room Capacity Information
          </Text>
          
          {/* Capacity Overview */}
          <Box p={4} bg="blue.50" borderRadius="md" mb={4}>
            <HStack justify="space-between" mb={3}>
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="bold" color="blue.800">
                  {room.capacity || 'N/A'} {room.capacity === 1 ? 'Person' : 'People'}
                </Text>
                <Text fontSize="sm" color="blue.600">Maximum Capacity</Text>
              </VStack>
              <VStack align="end" spacing={1}>
                <Text fontSize="lg" fontWeight="bold" color="green.600">
                  {room?.occupants ? 
                    room.occupants.filter(occupant => 
                      occupant.status === 'approved' || occupant.status === 'checked_in'
                    ).length : 0
                  }
                </Text>
                <Text fontSize="sm" color="gray.600">Current Occupancy</Text>
              </VStack>
            </HStack>
            
            {/* Occupancy Progress Bar */}
            {room.capacity && (
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.600">Occupancy Rate</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {room?.occupants ? 
                      room.occupants.filter(occupant => 
                        occupant.status === 'approved' || occupant.status === 'checked_in'
                      ).length : 0
                    } / {room.capacity}
                  </Text>
                </HStack>
                <Progress 
                  value={room?.occupants ? 
                    (room.occupants.filter(occupant => 
                      occupant.status === 'approved' || occupant.status === 'checked_in'
                    ).length / room.capacity) * 100 : 0
                  }
                  colorScheme={
                    room?.occupants && room.occupants.filter(occupant => 
                      occupant.status === 'approved' || occupant.status === 'checked_in'
                    ).length >= room.capacity ? 'red' : 'blue'
                  }
                  size="md"
                  borderRadius="md"
                />
              </Box>
            )}
          </Box>

          {/* Room Details */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="medium" mb={3}>Room Details</Text>
              <VStack spacing={2} align="start">
                <HStack>
                  <Icon as={MdGroup} color="blue.500" />
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="medium">Maximum Capacity: </Text>
                    {room.capacity ? `${room.capacity} ${room.capacity === 1 ? 'person' : 'people'}` : 'N/A'}
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={MdPerson} color="green.500" />
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="medium">Current Occupancy: </Text>
                    {room?.occupants ? 
                      room.occupants.filter(occupant => 
                        occupant.status === 'approved' || occupant.status === 'checked_in'
                      ).length : 0
                    } {room?.occupants && room.occupants.filter(occupant => 
                      occupant.status === 'approved' || occupant.status === 'checked_in'
                    ).length === 1 ? 'person' : 'people'}
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={MdEventAvailable} color="purple.500" />
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="medium">Available Spaces: </Text>
                    {room.capacity ? 
                      Math.max(0, room.capacity - (room?.occupants ? 
                        room.occupants.filter(occupant => 
                          occupant.status === 'approved' || occupant.status === 'checked_in'
                        ).length : 0
                      )) : 'N/A'
                    } {room.capacity && Math.max(0, room.capacity - (room?.occupants ? 
                      room.occupants.filter(occupant => 
                        occupant.status === 'approved' || occupant.status === 'checked_in'
                      ).length : 0
                    )) === 1 ? 'space' : 'spaces'}
                  </Text>
                </HStack>
              </VStack>
            </Box>
            
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="medium" mb={3}>Room Type Information</Text>
              <VStack spacing={2} align="start">
                <HStack>
                  <Icon as={MdHotel} color="orange.500" />
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="medium">Room Type: </Text>
                    {getClassificationDisplay(room.classification) || 'N/A'}
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={MdAttachMoney} color="teal.500" />
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="medium">Rental Period: </Text>
                    {room.rentalType?.name || room.rental_type || 'N/A'}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  {room.capacity && room?.occupants && 
                   room.occupants.filter(occupant => 
                     occupant.status === 'approved' || occupant.status === 'checked_in'
                   ).length === 0 
                    ? `This room can accommodate up to ${room.capacity} ${room.capacity === 1 ? 'person' : 'people'}. Currently available for booking.`
                    : room.capacity && room?.occupants && 
                      room.occupants.filter(occupant => 
                        occupant.status === 'approved' || occupant.status === 'checked_in'
                      ).length >= room.capacity
                    ? 'This room is currently at full capacity.'
                    : `This room has ${Math.max(0, room.capacity - (room?.occupants ? 
                        room.occupants.filter(occupant => 
                          occupant.status === 'approved' || occupant.status === 'checked_in'
                        ).length : 0
                      ))} available ${Math.max(0, room.capacity - (room?.occupants ? 
                        room.occupants.filter(occupant => 
                          occupant.status === 'approved' || occupant.status === 'checked_in'
                        ).length : 0
                      )) === 1 ? 'space' : 'spaces'} remaining.`
                  }
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>
        </Box>
        
        {/* Current Occupants Info */}
        {room?.occupants && room.occupants.length > 0 ? (
          <Box>
            <Text fontSize="md" fontWeight="semibold" mb={3} color="green.600">
              <Icon as={MdPerson} mr={2} />
              Current Occupants ({room.occupants.filter(occupant => 
                occupant.status === 'approved' || occupant.status === 'checked_in'
              ).length})
            </Text>
            <VStack spacing={2} align="stretch">
              {room.occupants
                .filter(occupant => occupant.status === 'approved' || occupant.status === 'checked_in')
                .map((occupant, index) => (
                <HStack key={index} justify="space-between" p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                  <HStack>
                    <Icon as={MdPerson} color="green.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="medium">{occupant.name}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(occupant.checkIn).toLocaleDateString()} - {new Date(occupant.checkOut).toLocaleDateString()}
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge colorScheme={occupant.status === 'checked_in' ? 'green' : 'blue'} variant="solid">
                    {occupant.status === 'checked_in' ? 'Checked In' : 'Approved'}
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </Box>
        ) : (
          <Box>
            <Text fontSize="md" fontWeight="semibold" mb={3} color="gray.600">
              <Icon as={MdPerson} mr={2} />
              Current Occupants (0)
            </Text>
            <Box p={4} bg="gray.50" borderRadius="md" textAlign="center">
              <Icon as={MdEventAvailable} boxSize={8} color="gray.400" mb={2} />
              <Text fontSize="sm" color="gray.500" mb={2}>
                No current occupants in this room
              </Text>
              <Text fontSize="xs" color="gray.400">
                This room is available for booking and can accommodate up to {room.capacity || 'specified'} {room.capacity === 1 ? 'person' : 'people'}.
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <TenantLayout>
        <Container maxW="container.xl" py={8} textAlign="center">
          {/* Back button */}
          <Button leftIcon={<MdArrowBack />} onClick={() => navigate(-1)} variant="ghost" mb={4} alignSelf="flex-start">
            Back to Rooms
          </Button>
          <Spinner size="xl" />
          <Text mt={4}>Loading room details...</Text>
        </Container>
      </TenantLayout>
    );
  }

  if (error && !room) {
    return (
      <TenantLayout>
        <Container maxW="container.xl" py={8}>
          <Alert status="error">
            <AlertIcon />
            <Box fontWeight="bold" mr={2}>Room not found</Box>
          </Alert>
          <Button leftIcon={<MdArrowBack />} mt={4} onClick={() => navigate('/tenant/rooms')}>
            Back to Rooms
          </Button>
        </Container>
      </TenantLayout>
    );
  }
  
  // Image URL priority: database primary image > room.imageUrl > default image
  const roomImage = primaryImage?.imageUrl || room?.imageUrl || getDefaultRoomImage(room);

  return (
    <TenantLayout>
      <Container maxW="container.xl" py={8}>
        <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8}>
          <GridItem>            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="lg">
              <Box position="relative">
                <Image
                  src={roomImage}
                  alt={room.name}
                  borderRadius="md"
                  mb={6}
                  objectFit="cover"
                  w="100%"
                  h={{ base: '250px', md: '400px' }}
                  fallbackSrc={defaultImages.default}
                />
                {/* Loading overlay for image */}
                {imageLoading && (
                  <Flex
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="blackAlpha.300"
                    align="center"
                    justify="center"
                    borderRadius="md"
                  >
                    <Spinner size="lg" color="white" />
                  </Flex>
                )}
                {/* Database image badge */}
                {primaryImage && (
                  <Badge
                    position="absolute"
                    top={4}
                    left={4}
                    colorScheme="blue"
                    variant="solid"
                  >
                    Room Photo
                  </Badge>
                )}
              </Box>
              <Heading size="lg" color={headingColor} mb={2}>{room.name}</Heading>
              <Text color={textColor} fontSize="md" mb={4}>
                Classification: {getClassificationDisplay(room.classification)}
              </Text>
              <HStack spacing={4} mb={2}>
                <Icon as={MdPerson} w={5} h={5} color="brand.500" />
                <Text>{getRoomCapacityText(room.capacity)}</Text>
              </HStack>
              <HStack spacing={4} mb={4}>
                <Icon as={MdAttachMoney} w={5} h={5} color="brand.500" />
                <Text fontWeight="bold" color="brand.600">{getFormattedRoomPrice(room)}</Text>
              </HStack>

              {/* Tabs Section - Example Structure */}
              
              <Divider my={4} />
              
              <Box mb={6}>
                <Heading as="h3" size="md" mb={3}>
                  Description
                </Heading>
                <Text color="gray.600">
                  {room.description || 'No description provided for this room.'}
                </Text>
              </Box>
            </Box>
            
            <Tabs variant="soft-rounded" colorScheme="brand" mt={6} bg={bgColor}>              <TabList>
                <Tab>Images</Tab>
                <Tab>Features</Tab>
                <Tab>Location</Tab>
                <Tab>Policies</Tab>
                {!isMeetingRoom() && <Tab>Occupancy</Tab>}
              </TabList>              <TabPanels>                <TabPanel>
                  <TenantRoomImageGallery roomId={room?.room_id || room?.roomId || roomId} />
                </TabPanel>
                <TabPanel>{renderRoomFeatures()}</TabPanel>
                <TabPanel>{renderRoomLocation()}</TabPanel>
                <TabPanel>{renderRoomPolicies()}</TabPanel>{!isMeetingRoom() && (
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      {loadingOccupancy ? (
                        <Flex justify="center" py={8}>
                          <Spinner size="lg" />
                        </Flex>
                      ) : occupancyInfo ? (
                        <>
                          <Text fontSize="lg" fontWeight="bold" mb={4}>Room Occupancy Details</Text>
                          
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <Box>
                              <Text fontSize="md" fontWeight="semibold" mb={2}>Current Status</Text>
                              <HStack spacing={4}>
                                <Icon as={MdGroup} w={5} h={5} color="blue.500" />
                                <Text>{occupancyInfo.occupied_slots} of {occupancyInfo.capacity} beds occupied</Text>
                              </HStack>
                              <HStack spacing={4} mt={2}>
                                <Icon as={MdEventAvailable} w={5} h={5} color="green.500" />
                                <Text>{occupancyInfo.available_slots} beds available</Text>
                              </HStack>
                            </Box>
                            
                            <Box>
                              <Text fontSize="md" fontWeight="semibold" mb={2}>Availability</Text>
                              <Progress 
                                value={occupancyInfo.occupancy_percentage} 
                                colorScheme={
                                  occupancyInfo.occupancy_percentage >= 100 ? "red" :
                                  occupancyInfo.occupancy_percentage >= 75 ? "orange" : "green"
                                }
                                size="lg" 
                                borderRadius="full"
                              />
                              <Text fontSize="sm" color="gray.500" mt={1}>
                                {Math.round(occupancyInfo.occupancy_percentage)}% occupied
                              </Text>
                            </Box>
                          </SimpleGrid>
                          
                          {occupancyInfo.available_slots === 0 && (
                            <Alert status="warning" borderRadius="md">
                              <AlertIcon />
                              This room is currently at full capacity. No beds are available for booking.
                            </Alert>
                          )}
                          
                          {occupancyInfo.available_slots > 0 && (
                            <Alert status="success" borderRadius="md">
                              <AlertIcon />
                              {occupancyInfo.available_slots} bed{occupancyInfo.available_slots > 1 ? 's' : ''} available for booking.
                            </Alert>
                          )}
                        </>                      ) : (
                        <VStack spacing={4} align="stretch">
                          <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">Room Capacity Information</Text>
                              <Text fontSize="sm">
                                This room can accommodate up to {room.capacity || 'N/A'} {room.capacity === 1 ? 'person' : 'people'}.
                                {room.classification?.name === 'ruang_rapat' 
                                  ? ' Meeting room booking is subject to availability.'
                                  : ' Current occupancy details are not available at this time.'}
                              </Text>
                            </VStack>
                          </Alert>
                          <Box p={4} bg="gray.50" borderRadius="md">
                            <Text fontWeight="medium" mb={2}>Room Details</Text>
                            <VStack spacing={2} align="start">
                              <Text fontSize="sm">
                                <Text as="span" fontWeight="medium">Maximum Capacity: </Text>
                                {room.capacity || 'Not specified'} {room.capacity === 1 ? 'person' : 'people'}
                              </Text>
                              <Text fontSize="sm">
                                <Text as="span" fontWeight="medium">Room Type: </Text>
                                {getClassificationDisplay(room.classification)}
                              </Text>
                              <Text fontSize="sm">
                                <Text as="span" fontWeight="medium">Rental Period: </Text>
                                {room.rentalType?.name || room.rental_type || 'Not specified'}
                              </Text>
                            </VStack>
                          </Box>
                        </VStack>
                      )}
                    </VStack>
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
          </GridItem>          <GridItem>
            {/* Room occupancy status */}
            {renderOccupancyStatus()}
              <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="lg" position="sticky" top="80px">
              <Heading size="md" color={headingColor} mb={4}>Book This Room</Heading>
              
              {/* Room booking info */}
              <VStack spacing={4} align="stretch">
                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium" color="blue.700" mb={2}>
                    {room.rentalType?.name === 'bulanan' ? 'Monthly Rental' : 'Daily Rental'}
                  </Text>
                  <Text fontSize="xs" color="blue.600">
                    {room.rentalType?.name === 'bulanan' 
                      ? 'Full month booking with flexible start date'
                      : 'Flexible daily booking available'}
                  </Text>
                </Box>

                {/* Price display */}
                <Box textAlign="center" p={4} bg="green.50" borderRadius="md">
                  {loadingRates ? (
                    <Spinner size="sm" color="green.500" />
                  ) : (
                    <>
                      {room?.classification?.name === 'ruang_rapat' ? (
                        <>
                          <Text fontSize="2xl" fontWeight="bold" color="green.700">
                            {formatCurrency(dynamicRates.daily) || 'N/A'}
                          </Text>
                          <Text fontSize="sm" color="green.600">
                            per day
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text fontSize="lg" fontWeight="bold" color="green.700">
                            {formatCurrency(dynamicRates.daily) || 'N/A'} / day
                          </Text>
                          <Text fontSize="lg" fontWeight="bold" color="green.700">
                            {formatCurrency(dynamicRates.monthly) || 'N/A'} / month
                          </Text>
                          <Text fontSize="xs" color="green.600">
                            per person
                          </Text>
                        </>
                      )}
                    </>
                  )}
                </Box>

                {/* Capacity info */}
                <Box p={3} bg="gray.50" borderRadius="md" textAlign="center">
                  <HStack justify="center" spacing={2}>
                    <Icon as={MdGroup} color="gray.600" />
                    <Text fontSize="sm" color="gray.600">
                      Capacity: {room.capacity || 'N/A'} {room.capacity === 1 ? 'person' : 'people'}
                    </Text>
                  </HStack>
                  {room.capacity && room?.occupants && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {Math.max(0, room.capacity - room.occupants.filter(occupant => 
                        occupant.status === 'approved' || occupant.status === 'checked_in'
                      ).length)} space(s) available
                    </Text>
                  )}
                </Box>

                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                {/* Main booking button */}
                <Button
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  onClick={handleBookNow}
                  isLoading={checkingAvailability}
                  leftIcon={<Icon as={MdEventAvailable} />}
                >
                  {isAuthenticated ? 'Book This Room' : 'Login to Book'}
                </Button>

                {!isAuthenticated && (
                  <Text textAlign="center" fontSize="sm" color="gray.500">
                    <RouterLink to="/tenant/login" style={{ color: 'blue' }}>Login</RouterLink> or {' '}
                    <RouterLink to="/tenant/register" style={{ color: 'blue' }}>Register</RouterLink> to book this room
                  </Text>
                )}
                
                {/* Additional info */}
                <Box p={3} bg="yellow.50" borderRadius="md">
                  <Text fontSize="xs" color="yellow.700" textAlign="center">
                    <Icon as={MdAttachMoney} mr={1} />
                    Date selection and payment will be handled in the next step
                  </Text>
                </Box>
              </VStack>
            </Box>
          </GridItem>
        </Grid>      </Container>
    </TenantLayout>
  );
};

export default RoomDetail;
