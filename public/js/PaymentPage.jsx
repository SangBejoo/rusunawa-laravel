import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Flex,
  Badge,
  Divider,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  Radio,
  RadioGroup,
  VStack,
  HStack,
  Icon,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  useColorModeValue,
  Center,
  Spinner,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FiCreditCard,
  FiUpload,
  FiFileText,
  FiCheck,
  FiCheckCircle,
  FiDollarSign,
  FiAlertCircle,
} from 'react-icons/fi';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { bookingApi, paymentApi } from './api.js';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef();
  
  const [booking, setBooking] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('midtrans');
  const [paymentProof, setPaymentProof] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // For steps
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: 3,
  });
  
  // For success modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch booking details
        const bookingResponse = await bookingApi.getBookingById(bookingId);
        setBooking(bookingResponse.data);
        
        // Fetch invoice details
        const invoiceResponse = await paymentApi.getInvoiceByBookingId(bookingId);
        setInvoice(invoiceResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking or invoice:', err);
        setError('Failed to load booking details. Please try again later.');
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  useEffect(() => {
    if (paymentProof) {
      // Create a preview URL for the uploaded file
      const objectUrl = URL.createObjectURL(paymentProof);
      setProofPreview(objectUrl);
      
      // Clean up the object URL after component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [paymentProof]);

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);
    
    // Reset payment proof and note when changing payment method
    setPaymentProof(null);
    setProofPreview('');
    setPaymentNote('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setPaymentProof(file);
    }
  };

  const handleMidtransPayment = async () => {
    setSubmitting(true);
    
    try {
      // Call Midtrans API (backend should handle this)
      const response = await paymentApi.midtransPayment({
        bookingId: bookingId,
        amount: invoice.amount,
        // other necessary data
      });
      
      console.log('Midtrans response:', response);
      
      // Redirect to Midtrans payment page
      window.location.href = response.data.redirectUrl;
    } catch (err) {
      console.error('Midtrans payment error:', err);
      toast({
        title: "Payment Failed",
        description: "Unable to process Midtrans payment. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualUpload = async () => {
    if (!paymentProof) {
      toast({
        title: "No File Selected",
        description: "Please upload the payment proof file.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Upload payment proof file
      const formData = new FormData();
      formData.append('file', paymentProof);
      formData.append('bookingId', bookingId);
      
      const uploadResponse = await paymentApi.uploadPaymentProof(formData);
      
      console.log('File upload response:', uploadResponse);
      
      // After successful upload, you can directly update the booking status or
      // call another API to notify that payment has been made
      setIsComplete(true);
      onOpen();
      
      // Optionally, navigate to another page or refresh bookings
      // navigate('/my-bookings');
    } catch (err) {
      console.error('File upload error:', err);
      toast({
        title: "Upload Failed",
        description: "Unable to upload payment proof. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewBookings = () => {
    // Navigate to the bookings page or refresh the current page
    navigate('/my-bookings');
  };

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" thickness="4px" speed="0.65s" color="brand.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      
      <Box flex="1" bg={useColorModeValue('gray.50', 'gray.900')} py={8}>
        <Container maxW="container.xl">
          <Stack spacing={8}>
            <Stack spacing={2}>
              <Heading as="h1" size="xl">Payment for Booking #{bookingId}</Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                Please complete your payment to confirm your booking.
              </Text>
            </Stack>

            {/* Booking and Invoice Details */}
            <Card variant="outline">
              <CardBody>
                <Stack spacing={4}>
                  <HStack justify="space-between" align="center">
                    <Text fontWeight="bold" fontSize="lg">
                      Booking Details
                    </Text>
                    <Badge colorScheme={getStatusColor(booking.status)}>
                      {booking.status.replace('_', ' ')}
                    </Badge>
                  </HStack>
                  
                  <Divider />
                  
                  <VStack spacing={2} align="start">
                    <HStack width="100%">
                      <Text flex="1" fontWeight="medium">
                        Room:
                      </Text>
                      <Text flex="2" color={useColorModeValue('gray.800', 'gray.200')}>
                        {booking.room.name}
                      </Text>
                    </HStack>
                    
                    <HStack width="100%">
                      <Text flex="1" fontWeight="medium">
                        Check-in:
                      </Text>
                      <Text flex="2" color={useColorModeValue('gray.800', 'gray.200')}>
                        {new Date(booking.startDate).toLocaleString()}
                      </Text>
                    </HStack>
                    
                    <HStack width="100%">
                      <Text flex="1" fontWeight="medium">
                        Check-out:
                      </Text>
                      <Text flex="2" color={useColorModeValue('gray.800', 'gray.200')}>
                        {new Date(booking.endDate).toLocaleString()}
                      </Text>
                    </HStack>
                  </VStack>
                </Stack>
              </CardBody>
            </Card>
            
            <Card variant="outline">
              <CardBody>
                <Stack spacing={4}>
                  <Text fontWeight="bold" fontSize="lg">
                    Invoice Details
                  </Text>
                  
                  <Divider />
                  
                  <VStack spacing={2} align="start">
                    <HStack width="100%">
                      <Text flex="1" fontWeight="medium">
                        Invoice ID:
                      </Text>
                      <Text flex="2" color={useColorModeValue('gray.800', 'gray.200')}>
                        {invoice.invoiceId}
                      </Text>
                    </HStack>
                    
                    <HStack width="100%">
                      <Text flex="1" fontWeight="medium">
                        Amount:
                      </Text>
                      <Text flex="2" color={useColorModeValue('gray.800', 'gray.200')}>
                        Rp {invoice.amount.toLocaleString('id-ID')}
                      </Text>
                    </HStack>
                    
                    <HStack width="100%">
                      <Text flex="1" fontWeight="medium">
                        Due Date:
                      </Text>
                      <Text flex="2" color={useColorModeValue('gray.800', 'gray.200')}>
                        {new Date(invoice.dueDate).toLocaleString()}
                      </Text>
                    </HStack>
                  </VStack>
                </Stack>
              </CardBody>
            </Card>

            {/* Payment Section */}
            <Card variant="outline">
              <CardBody>
                <Stack spacing={4}>
                  <Text fontWeight="bold" fontSize="lg">
                    Payment
                  </Text>
                  
                  <Divider />
                  
                  <VStack spacing={4} align="stretch">
                    <RadioGroup value={paymentMethod} onChange={handlePaymentMethodChange}>
                      <Stack spacing={4}>
                        <Radio value="midtrans" size="lg">
                          <HStack spacing={4}>
                            <Icon as={FiCreditCard} boxSize={6} />
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">Credit Card / Debit Card</Text>
                              <Text fontSize="sm" color="gray.500">
                                Pay securely using your credit or debit card via Midtrans.
                              </Text>
                            </VStack>
                          </HStack>
                        </Radio>
                        
                        <Radio value="manual" size="lg">
                          <HStack spacing={4}>
                            <Icon as={FiUpload} boxSize={6} />
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">Manual Upload</Text>
                              <Text fontSize="sm" color="gray.500">
                                Upload your payment proof after transferring via bank.
                              </Text>
                            </VStack>
                          </HStack>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                    
                    {paymentMethod === 'midtrans' && (
                      <Button
                        colorScheme="blue"
                        size="lg"
                        onClick={handleMidtransPayment}
                        isLoading={submitting}
                        loadingText="Processing Payment"
                      >
                        Pay Now with Midtrans
                      </Button>
                    )}
                    
                    {paymentMethod === 'manual' && (
                      <VStack spacing={4} align="stretch">
                        <Button
                          as={Link}
                          to="/"
                          colorScheme="blue"
                          size="lg"
                          leftIcon={<FiDollarSign />}
                        >
                          Pay Now
                        </Button>
                        
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          Please transfer the amount to the following account:
                        </Text>
                        
                        <Box
                          p={4}
                          borderWidth="1px"
                          borderRadius="md"
                          bg={useColorModeValue('gray.100', 'gray.700')}
                          textAlign="center"
                        >
                          <Text fontWeight="medium">Bank BCA</Text>
                          <Text color="blue.500" fontWeight="bold">
                            123-456-7890
                          </Text>
                        </Box>
                        
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          After transferring, please upload the proof of payment.
                        </Text>
                        
                        <FormControl id="paymentProof" isRequired isInvalid={!paymentProof && error}>
                          <FormLabel>Payment Proof</FormLabel>
                          <Input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                          />
                          <FormHelperText>
                            Upload a clear photo or scan of your payment receipt.
                          </FormHelperText>
                          <FormErrorMessage>
                            {error && 'Payment proof is required'}
                          </FormErrorMessage>
                        </FormControl>
                        
                        {proofPreview && (
                          <Box mt={4} textAlign="center">
                            <Text fontSize="sm" color="gray.600" mb={2}>
                              Payment Proof Preview:
                            </Text>
                            <Image
                              src={proofPreview}
                              alt="Payment Proof"
                              maxH="200px"
                              mx="auto"
                              objectFit="contain"
                              borderRadius="md"
                            />
                          </Box>
                        )}
                        
                        <Button
                          colorScheme="blue"
                          size="lg"
                          onClick={handleManualUpload}
                          isLoading={submitting}
                          loadingText="Uploading"
                        >
                          Upload Payment Proof
                        </Button>
                      </VStack>
                    )}
                  </VStack>
                </Stack>
              </CardBody>
            </Card>
            
            {/* Steps Indicator */}
            <Stepper activeStep={activeStep} colorScheme="blue">
              <Step>
                <StepIndicator />
                <StepStatus>
                  <StepTitle>Booking Confirmed</StepTitle>
                  <StepDescription>Your booking has been confirmed.</StepDescription>
                </StepStatus>
              </Step>
              
              <Step>
                <StepIndicator />
                <StepStatus>
                  <StepTitle>Payment Pending</StepTitle>
                  <StepDescription>Please complete your payment.</StepDescription>
                </StepStatus>
              </Step>
              
              <Step>
                <StepIndicator />
                <StepStatus>
                  <StepTitle>Payment Received</StepTitle>
                  <StepDescription>Your payment has been received.</StepDescription>
                </StepStatus>
              </Step>
            </Stepper>
          </Stack>
          
          {/* Payment Success Modal */}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Payment Submitted</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4} align="center">
                  <Icon as={FiCheckCircle} boxSize={12} color="green.500" />
                  <Text fontWeight="bold">Your payment has been submitted successfully!</Text>
                  <Text textAlign="center">
                    Your payment will be verified by our team. This usually takes 1-2 business days.
                    You can check the status of your payment in the booking details.
                  </Text>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button onClick={handleViewBookings} colorScheme="blue" mr={3}>
                  View My Bookings
                </Button>
                <Button onClick={onClose} variant="ghost">Close</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
}

// Helper functions for payment statuses
function getStatusColor(status) {
  switch(status) {
    case 'PAID':
    case 'COMPLETED':
      return 'green';
    case 'PENDING':
    case 'VERIFYING':
      return 'yellow';
    case 'UNPAID':
    case 'WAITING':
      return 'blue';
    case 'FAILED':
    case 'DECLINED':
      return 'red';
    default:
      return 'gray';
  }
}

// Mock data for development/fallback
const mockBooking = {
  bookingId: 2,
  roomId: 3,
  room: { name: 'Seruni' },
  startDate: '2023-08-01T00:00:00Z',
  endDate: '2023-08-07T00:00:00Z',
  status: 'WAITING_PAYMENT',
  invoiceId: 102
};

const mockInvoice = {
  invoiceId: 102,
  bookingId: 2,
  amount: 700000,
  dueDate: '2023-07-28T00:00:00Z',
  status: 'UNPAID',
  createdAt: '2023-07-21T00:00:00Z'
};