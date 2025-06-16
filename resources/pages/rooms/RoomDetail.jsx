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
  TabPanel,
  Alert,
  AlertIcon,
  Spinner,
  Divider,
  Badge,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useColorModeValue,
  useToast,
  Flex,
  Tooltip,
  SimpleGrid,
  useDisclosure
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
import tenantAuthService from '../../services/tenantAuthService';
import { getFormattedRoomPrice, getRoomCapacityText, isRoomAvailable, validateDateSelectionByRentalType, calculateRoomOccupancy } from '../../utils/roomUtils';
import { formatCurrency } from '../../components/helpers/typeConverters';
import { defaultImages } from '../../utils/imageUtils';
import { getRoomImage } from '../../../utils/roomImageUtils';

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
const isAuthenticated = tenantAuthService.isAuthenticated();

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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // State management
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [roomAvailability, setRoomAvailability] = useState([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  
  // New state for occupancy information
  const [occupancyInfo, setOccupancyInfo] = useState(null);
  const [loadingOccupancy, setLoadingOccupancy] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800'); 
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');

  const handleBookNow = () => { onOpen(); };  const proceedToBooking = async () => { 
    onClose(); 
    
    // Use the primary state variables (startDate and endDate) for validation
    if (!startDate || !endDate) {
      toast({
        title: 'Invalid dates',
        description: 'Please select valid check-in and check-out dates.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // Convert to Date objects and validate
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    // Check if dates are valid
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      toast({
        title: 'Invalid dates',
        description: 'Please select valid check-in and check-out dates.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // Check if end date is after start date
    if (endDateObj <= startDateObj) {
      toast({
        title: 'Invalid date range',
        description: 'Check-out date must be after check-in date.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // Proceed directly to booking without availability check
    navigate(`/tenant/rooms/${roomId}/book?startDate=${startDate}&endDate=${endDate}`);
  };
  
  const renderRoomFeatures = () => <Text>Room features go here...</Text>;
  const renderRoomLocation = () => <Text>Room location details go here...</Text>;
  const renderRoomPolicies = () => <Text>Room policies go here...</Text>;
  const isMeetingRoom = () => room?.classification?.name === 'ruang_rapat'; // Example

  useEffect(() => {
    const fetchRoomDetails = async () => {
      // Validate roomId first
      if (!roomId || roomId === 'undefined') {
        setError('Invalid room ID');
        setLoading(false);
        return;
      }      try {
        setLoading(true);
        const response = await roomService.getRoom(roomId);
        
        if (response && response.room) {
          setRoom(response.room);
          // Fetch occupancy information after room details are loaded
          fetchOccupancyInfo();
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
        
        {/* Current Occupants Info */}
        {room?.occupants && room.occupants.length > 0 && (
          <Box mt={4}>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Current Occupants:</Text>
            <VStack spacing={2} align="stretch">
              {room.occupants
                .filter(occupant => occupant.status === 'approved' || occupant.status === 'checked_in')
                .map((occupant, index) => (
                <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium">{occupant.name}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(occupant.checkIn).toLocaleDateString()} - {new Date(occupant.checkOut).toLocaleDateString()}
                    </Text>
                  </VStack>
                  <Badge colorScheme={occupant.status === 'checked_in' ? 'green' : 'blue'}>
                    {occupant.status}
                  </Badge>
                </HStack>
              ))}
            </VStack>
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
  
  const roomImage = room?.imageUrl || getDefaultRoomImage(room);

  return (
    <TenantLayout>
      <Container maxW="container.xl" py={8}>
        <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8}>
          <GridItem>
            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="lg">
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
            
            <Tabs variant="soft-rounded" colorScheme="brand" mt={6} bg={bgColor}>
              <TabList>
                <Tab>Features</Tab>
                <Tab>Location</Tab>
                <Tab>Policies</Tab>
                {!isMeetingRoom() && <Tab>Occupancy</Tab>}
              </TabList>
              <TabPanels>
                <TabPanel>{renderRoomFeatures()}</TabPanel>
                <TabPanel>{renderRoomLocation()}</TabPanel>
                <TabPanel>{renderRoomPolicies()}</TabPanel>                {!isMeetingRoom() && (
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
                        </>
                      ) : (
                        <Text>Occupancy information unavailable.</Text>
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
              <Text mb={4} fontSize="sm" color={textColor}>
                {room.rentalType?.name === 'bulanan' 
                  ? 'Monthly rental requires booking in full month increments'
                  : 'Daily rental allows flexible date selection'}
              </Text>
              <FormControl isInvalid={!!error && !startDate}>
                <FormLabel htmlFor="start-date">
                  {room.rentalType?.name === 'bulanan' ? 'Start of Month' : 'Check-in Date'}
                </FormLabel>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormControl>
              <FormControl mt={4} isInvalid={!!error && !endDate}>
                <FormLabel htmlFor="end-date">
                  {room.rentalType?.name === 'bulanan' ? 'End of Month' : 'Check-out Date'}
                </FormLabel>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  disabled={room.rentalType?.name === 'bulanan'} // Disable manual end date selection for monthly rentals
                />
                {room.rentalType?.name === 'bulanan' && startDate && endDate && (
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Rental period: {calculateDurationMonths(startDate, endDate)} month(s)
                  </Text>
                )}
              </FormControl>                {checkingAvailability && (
                  <HStack spacing={2} mt={4}>
                    <Spinner size="sm" />
                    <Text>Checking availability...</Text>
                  </HStack>
                )}
                
                {/* Removed availability status display since we're not checking availability */}
                
                {error && (
                  <Alert status="error" mt={4} borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <Button
                  colorScheme="brand"
                  mt={6}
                  w="full"
                  onClick={handleBookNow}
                  isDisabled={!startDate || !endDate || checkingAvailability}
                  isLoading={checkingAvailability}
                >
                  {isAuthenticated ? 'Book Now' : 'Login to Book'}
                </Button>
              {!isAuthenticated && (
                <Text mt={2} textAlign="center" fontSize="sm">
                  <RouterLink to="/tenant/login">Login</RouterLink> or <RouterLink to="/tenant/register">Register</RouterLink> to book.
                </Text>
              )}
            </Box>
          </GridItem>
        </Grid>
      </Container>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Your Booking Dates</ModalHeader>
          <ModalCloseButton />          <ModalBody>
            <Text mb={4}>Room: {room?.name}</Text>
            <Text>Selected Check-in: {startDate}</Text>
            <Text>Selected Check-out: {endDate}</Text>

            {startDate && endDate && room?.rate && (
              <Box mt={4}>
                <Text fontWeight="bold">
                  Total Price: {formatCurrency(calculateTotalPrice(startDate, endDate, room.rate))}
                </Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>            <Button
              colorScheme="brand"
              onClick={proceedToBooking}
              isDisabled={!startDate || !endDate}
            >
              Proceed to Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </TenantLayout>
  );
};

export default RoomDetail;
