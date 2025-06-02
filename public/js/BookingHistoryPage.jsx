import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Badge,
  Flex,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Divider,
  HStack,
  VStack,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Link as ChakraLink,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiCreditCard,
  FiHome,
  FiFileText
} from 'react-icons/fi';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { bookingApi } from './api.js';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const navigate = useNavigate();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.700');
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingApi.getBookings();
        
        if (response.data && response.data.bookings) {
          setBookings(response.data.bookings);
        } else {
          // Fallback to mock data if API response structure is unexpected
          setBookings(mockBookings);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to fetch booking history. Please try again later.');
        setBookings(mockBookings); // Use mock data on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    onOpen();
  };
  
  const handleCancelBooking = async () => {
    try {
      if (!selectedBooking) return;
      
      setLoading(true);
      
      const response = await bookingApi.cancelBooking(selectedBooking.bookingId, { reason: cancelReason });
      
      if (response.data && response.data.status && response.data.status.status === 'success') {
        // Update the booking status in the state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.bookingId === selectedBooking.bookingId 
              ? { ...booking, status: 'CANCELLED' } 
              : booking
          )
        );
        
        onClose();
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePayment = (bookingId) => {
    navigate(`/payment/${bookingId}`);
  };
  
  // Filter bookings by status
  const activeBookings = bookings.filter(booking => 
    ['CONFIRMED', 'PENDING', 'WAITING_PAYMENT'].includes(booking.status)
  );
  
  const completedBookings = bookings.filter(booking => booking.status === 'COMPLETED');
  const cancelledBookings = bookings.filter(booking => booking.status === 'CANCELLED');
  
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      
      <Box flex="1" bg={useColorModeValue('gray.50', 'gray.900')} py={8}>
        <Container maxW="container.xl">
          <Stack spacing={8}>
            <Flex justify="space-between" align="center">
              <Stack>
                <Heading size="lg">My Bookings</Heading>
                <Text color="gray.600">View and manage your room bookings</Text>
              </Stack>
              
              <Button 
                as={Link} 
                to="/rooms" 
                colorScheme="blue" 
                leftIcon={<Icon as={FiHome} />}
              >
                Browse Rooms
              </Button>
            </Flex>
            
            {loading ? (
              <Center py={10}>
                <VStack spacing={3}>
                  <Spinner size="xl" thickness="4px" speed="0.65s" color="brand.500" />
                  <Text>Loading your bookings...</Text>
                </VStack>
              </Center>
            ) : error ? (
              <Alert status="error" borderRadius="lg">
                <AlertIcon />
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : bookings.length === 0 ? (
              <Alert status="info" borderRadius="lg" flexDirection="column" alignItems="center" p={6}>
                <AlertIcon boxSize={10} mr={0} mb={4} />
                <AlertTitle mb={2} fontSize="lg">No bookings found</AlertTitle>
                <AlertDescription textAlign="center" maxW="md">
                  You haven't made any bookings yet. Browse our available rooms to make your first booking.
                </AlertDescription>
                <Button 
                  as={Link} 
                  to="/rooms"
                  colorScheme="blue"
                  mt={4}
                >
                  Browse Rooms
                </Button>
              </Alert>
            ) : (
              <Tabs colorScheme="blue" variant="enclosed">
                <TabList>
                  <Tab>Active ({activeBookings.length})</Tab>
                  <Tab>Completed ({completedBookings.length})</Tab>
                  <Tab>Cancelled ({cancelledBookings.length})</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Active Bookings */}
                  <TabPanel>
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                      {activeBookings.map(booking => (
                        <BookingCard 
                          key={booking.bookingId} 
                          booking={booking} 
                          onView={handleViewBooking}
                          onPayment={handlePayment}
                        />
                      ))}
                    </SimpleGrid>
                    {activeBookings.length === 0 && (
                      <Text textAlign="center" py={10} color="gray.500">
                        No active bookings at the moment.
                      </Text>
                    )}
                  </TabPanel>
                  
                  {/* Completed Bookings */}
                  <TabPanel>
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                      {completedBookings.map(booking => (
                        <BookingCard 
                          key={booking.bookingId} 
                          booking={booking} 
                          onView={handleViewBooking}
                          showActions={false}
                        />
                      ))}
                    </SimpleGrid>
                    {completedBookings.length === 0 && (
                      <Text textAlign="center" py={10} color="gray.500">
                        No completed bookings yet.
                      </Text>
                    )}
                  </TabPanel>
                  
                  {/* Cancelled Bookings */}
                  <TabPanel>
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                      {cancelledBookings.map(booking => (
                        <BookingCard 
                          key={booking.bookingId} 
                          booking={booking} 
                          onView={handleViewBooking}
                          showActions={false}
                        />
                      ))}
                    </SimpleGrid>
                    {cancelledBookings.length === 0 && (
                      <Text textAlign="center" py={10} color="gray.500">
                        No cancelled bookings.
                      </Text>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </Stack>
        </Container>
      </Box>
      
      {/* Booking Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Booking Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedBooking && (
              <Stack spacing={4}>
                <Flex justify="space-between">
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">Room {selectedBooking.room?.name || `#${selectedBooking.roomId}`}</Text>
                    <Badge colorScheme={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                  </Box>
                  <Box textAlign="right">
                    <Text fontWeight="bold">Booking ID</Text>
                    <Text color="gray.600">{selectedBooking.bookingId}</Text>
                  </Box>
                </Flex>
                
                <Divider />
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Check-in</Text>
                    <Text>{new Date(selectedBooking.startDate).toLocaleDateString()}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Check-out</Text>
                    <Text>{new Date(selectedBooking.endDate).toLocaleDateString()}</Text>
                  </Box>
                </SimpleGrid>
                
                {selectedBooking.invoice && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontWeight="bold">Payment Status</Text>
                      <Badge colorScheme={selectedBooking.invoice.status === 'PAID' ? 'green' : 'yellow'}>
                        {selectedBooking.invoice.status}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Total Amount</Text>
                      <Text>Rp {selectedBooking.invoice.amount.toLocaleString('id-ID')}</Text>
                    </Box>
                    {selectedBooking.invoice.dueDate && (
                      <Box>
                        <Text fontWeight="bold">Due Date</Text>
                        <Text>{new Date(selectedBooking.invoice.dueDate).toLocaleDateString()}</Text>
                      </Box>
                    )}
                  </>
                )}
                
                {selectedBooking.notes && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontWeight="bold">Special Requests</Text>
                      <Text>{selectedBooking.notes}</Text>
                    </Box>
                  </>
                )}
                
                {selectedBooking.status === 'CANCELLED' && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontWeight="bold">Cancellation Reason</Text>
                      <Text>{selectedBooking.cancelReason || 'No reason provided'}</Text>
                    </Box>
                  </>
                )}
              </Stack>
            )}
          </ModalBody>
          <ModalFooter>
            {selectedBooking && selectedBooking.status === 'WAITING_PAYMENT' && (
              <Button 
                colorScheme="green" 
                mr={3} 
                leftIcon={<Icon as={FiCreditCard} />}
                onClick={() => handlePayment(selectedBooking.bookingId)}
              >
                Make Payment
              </Button>
            )}
            
            {selectedBooking && ['PENDING', 'CONFIRMED', 'WAITING_PAYMENT'].includes(selectedBooking.status) && (
              <Button 
                colorScheme="red" 
                mr={3}
                leftIcon={<Icon as={FiXCircle} />}
                onClick={handleCancelBooking}
              >
                Cancel Booking
              </Button>
            )}
            
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      <Footer />
    </Box>
  );
}

// Booking Card Component
const BookingCard = ({ booking, onView, onPayment, showActions = true }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const navigate = useNavigate();
  
  return (
    <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} overflow="hidden">
      <CardBody>
        <Stack spacing={4}>
          <HStack justify="space-between">
            <Box>
              <Heading size="md" mb={1}>
                Room {booking.room?.name || `#${booking.roomId}`}
              </Heading>
              <Badge colorScheme={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </Box>
            <Icon 
              as={getStatusIcon(booking.status)} 
              boxSize={6} 
              color={getIconColor(booking.status)}
            />
          </HStack>
          
          <SimpleGrid columns={2} spacing={3}>
            <Box>
              <Text fontWeight="semibold">Check-in</Text>
              <HStack>
                <Icon as={FiCalendar} color="gray.500" />
                <Text>{new Date(booking.startDate).toLocaleDateString()}</Text>
              </HStack>
            </Box>
            <Box>
              <Text fontWeight="semibold">Check-out</Text>
              <HStack>
                <Icon as={FiCalendar} color="gray.500" />
                <Text>{new Date(booking.endDate).toLocaleDateString()}</Text>
              </HStack>
            </Box>
          </SimpleGrid>
          
          {booking.invoice && (
            <Flex justify="space-between" align="center">
              <HStack>
                <Icon as={FiCreditCard} color="gray.500" />
                <Text>
                  Payment: 
                  <Badge ml={2} colorScheme={booking.invoice.status === 'PAID' ? 'green' : 'yellow'}>
                    {booking.invoice.status}
                  </Badge>
                </Text>
              </HStack>
              <Text fontWeight="bold">
                Rp {booking.invoice.amount?.toLocaleString('id-ID')}
              </Text>
            </Flex>
          )}
          
          {showActions && (
            <>
              <Divider />
              <HStack justify="space-between">
                <Button 
                  variant="ghost" 
                  colorScheme="blue" 
                  size="sm"
                  onClick={() => onView(booking)}
                >
                  View Details
                </Button>
                
                {booking.status === 'WAITING_PAYMENT' && (
                  <Button 
                    colorScheme="green" 
                    size="sm"
                    leftIcon={<Icon as={FiCreditCard} />}
                    onClick={() => onPayment(booking.bookingId)}
                  >
                    Pay Now
                  </Button>
                )}
              </HStack>
            </>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};

// Helper function to get status color for badges
function getStatusColor(status) {
  switch(status) {
    case 'CONFIRMED':
      return 'green';
    case 'PENDING':
      return 'yellow';
    case 'WAITING_PAYMENT':
      return 'blue';
    case 'CANCELLED':
      return 'red';
    case 'COMPLETED':
      return 'gray';
    default:
      return 'gray';
  }
}

// Helper function to get icon based on booking status
function getStatusIcon(status) {
  switch(status) {
    case 'CONFIRMED':
      return FiCheckCircle;
    case 'PENDING':
      return FiClock;
    case 'WAITING_PAYMENT':
      return FiCreditCard;
    case 'CANCELLED':
      return FiXCircle;
    case 'COMPLETED':
      return FiCheckCircle;
    default:
      return FiAlertCircle;
  }
}

// Helper function to get icon color based on booking status
function getIconColor(status) {
  switch(status) {
    case 'CONFIRMED':
      return 'green.500';
    case 'PENDING':
      return 'yellow.500';
    case 'WAITING_PAYMENT':
      return 'blue.500';
    case 'CANCELLED':
      return 'red.500';
    case 'COMPLETED':
      return 'gray.500';
    default:
      return 'gray.500';
  }
}

// Mock data for development/fallback
const mockBookings = [
  {
    bookingId: 1,
    roomId: 1,
    room: { name: 'Marina', type: 'premium' },
    startDate: '2023-07-15',
    endDate: '2023-07-22',
    status: 'CONFIRMED',
    invoice: {
      invoiceId: 101,
      amount: 700000,
      status: 'PAID',
      dueDate: '2023-07-12'
    }
  },
  {
    bookingId: 2,
    roomId: 3,
    room: { name: 'Seruni', type: 'standard' },
    startDate: '2023-08-01',
    endDate: '2023-08-07',
    status: 'WAITING_PAYMENT',
    invoice: {
      invoiceId: 102,
      amount: 500000,
      status: 'UNPAID',
      dueDate: '2023-07-28'
    }
  },
  {
    bookingId: 3,
    roomId: 5,
    room: { name: 'Anggrek', type: 'shared' },
    startDate: '2023-06-10',
    endDate: '2023-06-17',
    status: 'COMPLETED',
    invoice: {
      invoiceId: 98,
      amount: 450000,
      status: 'PAID',
      dueDate: '2023-06-07'
    }
  },
  {
    bookingId: 4,
    roomId: 2,
    room: { name: 'Dahlia', type: 'premium' },
    startDate: '2023-07-05',
    endDate: '2023-07-12',
    status: 'CANCELLED',
    cancelReason: 'Change of plans',
    invoice: {
      invoiceId: 99,
      amount: 700000,
      status: 'REFUNDED',
      dueDate: '2023-07-02'
    }
  }
];
