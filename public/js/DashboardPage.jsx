import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Stack,
  Flex,
  Button,
  Badge,
  Icon,
  Divider,
  Avatar,
  HStack,
  VStack,
  Skeleton,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import { 
  FiHome, 
  FiCalendar, 
  FiClock, 
  FiFileText, 
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { tenantApi, bookingApi } from './api.js';

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get user data from localStorage or fetch from API
        const storedData = localStorage.getItem('userData');
        if (storedData) {
          setUserData(JSON.parse(storedData));
        } else {
          const response = await tenantApi.getProfile();
          setUserData(response.data.tenant);
        }
        
        // Fetch upcoming bookings
        const bookingsResponse = await bookingApi.getBookings();
        const activeBookings = bookingsResponse.data.bookings.filter(
          booking => booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED'
        );
        setUpcomingBookings(activeBookings.slice(0, 3)); // Show only 3 most recent
        
        // Fetch pending documents
        const documentsResponse = await tenantApi.getDocuments();
        setPendingDocuments(documentsResponse.data.documents.filter(
          doc => doc.status === 'PENDING'
        ).slice(0, 3));
        
        // Fetch pending payments
        const paymentsResponse = await bookingApi.getInvoices();
        setPendingPayments(paymentsResponse.data.invoices.filter(
          invoice => invoice.status === 'UNPAID'
        ).slice(0, 3));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // For demo, set mock data if API fails
        setUserData({
          user: { fullName: 'Andi Santoso' },
          address: 'Jl. Merdeka No. 10, Jakarta Pusat',
          phone: '812-3456-7890',
        });
        setUpcomingBookings(mockBookings);
        setPendingDocuments(mockDocuments);
        setPendingPayments(mockPayments);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const statBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Box flex="1" bg={useColorModeValue('gray.50', 'gray.900')} py={8}>
        <Container maxW="container.xl">
          {/* Welcome Section */}
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            align={{ base: 'center', md: 'flex-start' }} 
            justify="space-between"
            mb={8}
          >
            <Skeleton isLoaded={!loading}>
              <Box>
                <Heading size="lg" mb={2}>Welcome, {userData?.user?.fullName || 'Tenant'}</Heading>
                <Text color="gray.600">Manage your stay at Rusunawa with ease</Text>
              </Box>
            </Skeleton>
            
            <HStack spacing={4} mt={{ base: 4, md: 0 }}>
              <Button 
                as={Link} 
                to="/rooms" 
                colorScheme="blue" 
                leftIcon={<Icon as={FiHome} />}
              >
                Browse Rooms
              </Button>
              <Button 
                as={Link} 
                to="/bookings" 
                variant="outline" 
                leftIcon={<Icon as={FiCalendar} />}
              >
                My Bookings
              </Button>
            </HStack>
          </Flex>
          
          {/* Stats Overview */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={8}>
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>Active Booking</StatLabel>
              <Skeleton isLoaded={!loading}>
                <StatNumber>{upcomingBookings.length || 0}</StatNumber>
                <StatHelpText>Current stays</StatHelpText>
              </Skeleton>
            </Stat>
            
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>Pending Documents</StatLabel>
              <Skeleton isLoaded={!loading}>
                <StatNumber>{pendingDocuments.length || 0}</StatNumber>
                <StatHelpText>Need your attention</StatHelpText>
              </Skeleton>
            </Stat>
            
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>Pending Payments</StatLabel>
              <Skeleton isLoaded={!loading}>
                <StatNumber>{pendingPayments.length || 0}</StatNumber>
                <StatHelpText>To be processed</StatHelpText>
              </Skeleton>
            </Stat>
            
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>Profile Completion</StatLabel>
              <Skeleton isLoaded={!loading}>
                <StatNumber>85%</StatNumber>
                <StatHelpText>Complete your profile</StatHelpText>
              </Skeleton>
            </Stat>
          </SimpleGrid>
          
          {/* Quick Actions */}
          <Heading size="md" mb={4}>Quick Actions</Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={5} mb={8}>
            <Card as={Link} to="/rooms" bg={cardBg} _hover={{ transform: 'translateY(-5px)', transition: '0.3s' }}>
              <CardBody>
                <VStack spacing={3} align="flex-start">
                  <Icon as={FiHome} boxSize={6} color="blue.500" />
                  <Heading size="sm">Book a Room</Heading>
                  <Text color="gray.600" fontSize="sm">Browse and book available rooms</Text>
                </VStack>
              </CardBody>
            </Card>
            
            <Card as={Link} to="/documents" bg={cardBg} _hover={{ transform: 'translateY(-5px)', transition: '0.3s' }}>
              <CardBody>
                <VStack spacing={3} align="flex-start">
                  <Icon as={FiFileText} boxSize={6} color="green.500" />
                  <Heading size="sm">Upload Documents</Heading>
                  <Text color="gray.600" fontSize="sm">Manage your required documents</Text>
                </VStack>
              </CardBody>
            </Card>
            
            <Card as={Link} to="/payments" bg={cardBg} _hover={{ transform: 'translateY(-5px)', transition: '0.3s' }}>
              <CardBody>
                <VStack spacing={3} align="flex-start">
                  <Icon as={FiCreditCard} boxSize={6} color="purple.500" />
                  <Heading size="sm">Make Payment</Heading>
                  <Text color="gray.600" fontSize="sm">Pay your pending invoices</Text>
                </VStack>
              </CardBody>
            </Card>
            
            <Card as={Link} to="/profile" bg={cardBg} _hover={{ transform: 'translateY(-5px)', transition: '0.3s' }}>
              <CardBody>
                <VStack spacing={3} align="flex-start">
                  <Avatar size="sm" name={userData?.user?.fullName} />
                  <Heading size="sm">My Profile</Heading>
                  <Text color="gray.600" fontSize="sm">Update your personal information</Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Recent Bookings */}
          <Heading size="md" mb={4}>Recent Bookings</Heading>
          <Card bg={cardBg} mb={8}>
            <CardBody>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <Box key={i} mb={4}>
                    <Skeleton height="60px" />
                    {i < 2 && <Divider my={4} />}
                  </Box>
                ))
              ) : upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking, index) => (
                  <React.Fragment key={booking.bookingId}>
                    <HStack spacing={4} align="flex-start">
                      <Icon as={FiCalendar} boxSize={5} color="blue.500" mt={1} />
                      <Box flex="1">
                        <Flex justify="space-between" align="center" mb={2}>
                          <Heading size="sm">Room {booking.room?.name || `#${booking.roomId}`}</Heading>
                          <Badge colorScheme={getStatusColor(booking.status)}>{booking.status}</Badge>
                        </Flex>
                        <Text color="gray.600" fontSize="sm">
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </Text>
                      </Box>
                    </HStack>
                    {index < upcomingBookings.length - 1 && <Divider my={4} />}
                  </React.Fragment>
                ))
              ) : (
                <Text color="gray.500" textAlign="center">No upcoming bookings found</Text>
              )}
              {!loading && upcomingBookings.length > 0 && (
                <Flex justify="center" mt={4}>
                  <Button as={Link} to="/bookings" variant="ghost" colorScheme="blue">
                    View All Bookings
                  </Button>
                </Flex>
              )}
            </CardBody>
          </Card>
          
          {/* Pending Documents and Payments */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="md" mb={4}>Pending Documents</Heading>
                {loading ? (
                  Array(2).fill(0).map((_, i) => (
                    <Box key={i} mb={4}>
                      <Skeleton height="50px" />
                    </Box>
                  ))
                ) : pendingDocuments.length > 0 ? (
                  pendingDocuments.map((document, index) => (
                    <React.Fragment key={document.documentId}>
                      <HStack spacing={3}>
                        <Icon as={FiFileText} color="orange.500" />
                        <Box flex="1">
                          <Text fontWeight="medium">{document.documentType}</Text>
                          <Text color="gray.600" fontSize="sm">Required for your stay</Text>
                        </Box>
                        <Button 
                          as={Link} 
                          to={`/documents/${document.documentId}`}
                          size="sm" 
                          colorScheme="orange" 
                          variant="outline"
                        >
                          Upload
                        </Button>
                      </HStack>
                      {index < pendingDocuments.length - 1 && <Divider my={3} />}
                    </React.Fragment>
                  ))
                ) : (
                  <Text color="gray.500" textAlign="center">No pending documents</Text>
                )}
                {!loading && pendingDocuments.length > 0 && (
                  <Button as={Link} to="/documents" variant="link" colorScheme="blue" mt={3} w="full">
                    View All Documents
                  </Button>
                )}
              </CardBody>
            </Card>
            
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="md" mb={4}>Pending Payments</Heading>
                {loading ? (
                  Array(2).fill(0).map((_, i) => (
                    <Box key={i} mb={4}>
                      <Skeleton height="50px" />
                    </Box>
                  ))
                ) : pendingPayments.length > 0 ? (
                  pendingPayments.map((payment, index) => (
                    <React.Fragment key={payment.invoiceId}>
                      <HStack spacing={3}>
                        <Icon as={FiCreditCard} color="red.500" />
                        <Box flex="1">
                          <Text fontWeight="medium">Invoice #{payment.invoiceId}</Text>
                          <Text color="gray.600" fontSize="sm">
                            Due: {new Date(payment.dueDate).toLocaleDateString()}
                          </Text>
                        </Box>
                        <Text fontWeight="semibold">
                          Rp {payment.amount.toLocaleString('id-ID')}
                        </Text>
                        <Button 
                          as={Link} 
                          to={`/payments/${payment.invoiceId}`}
                          size="sm" 
                          colorScheme="blue"
                        >
                          Pay
                        </Button>
                      </HStack>
                      {index < pendingPayments.length - 1 && <Divider my={3} />}
                    </React.Fragment>
                  ))
                ) : (
                  <Text color="gray.500" textAlign="center">No pending payments</Text>
                )}
                {!loading && pendingPayments.length > 0 && (
                  <Button as={Link} to="/payments" variant="link" colorScheme="blue" mt={3} w="full">
                    View All Payments
                  </Button>
                )}
              </CardBody>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}

// Helper function to get badge color based on booking status
function getStatusColor(status) {
  switch(status) {
    case 'CONFIRMED':
      return 'green';
    case 'PENDING':
      return 'yellow';
    case 'CANCELLED':
      return 'red';
    case 'WAITING_PAYMENT':
      return 'blue';
    default:
      return 'gray';
  }
}

// Mock data for development
const mockBookings = [
  {
    bookingId: 1,
    roomId: 1,
    room: { name: 'Marina' },
    startDate: '2023-07-10T00:00:00Z',
    endDate: '2023-07-17T00:00:00Z',
    status: 'CONFIRMED'
  },
  {
    bookingId: 2,
    roomId: 3,
    room: { name: 'Seruni' },
    startDate: '2023-08-01T00:00:00Z',
    endDate: '2023-08-07T00:00:00Z',
    status: 'PENDING'
  }
];

const mockDocuments = [
  {
    documentId: 1,
    documentType: 'Identity Card',
    status: 'PENDING',
    docTypeId: 1
  },
  {
    documentId: 2,
    documentType: 'Approval Letter',
    status: 'PENDING',
    docTypeId: 2
  }
];

const mockPayments = [
  {
    invoiceId: 1,
    bookingId: 1,
    amount: 700000,
    dueDate: '2023-07-05T00:00:00Z',
    status: 'UNPAID'
  },
  {
    invoiceId: 2,
    bookingId: 2,
    amount: 1050000,
    dueDate: '2023-07-25T00:00:00Z',
    status: 'UNPAID'
  }
];
