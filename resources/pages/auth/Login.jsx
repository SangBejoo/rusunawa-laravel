import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
  VStack,
  HStack,
  useToast,
  useColorModeValue,
  Icon,
  Divider,
  Image,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FaEnvelope, FaLock, FaSchool } from 'react-icons/fa';
import { useTenantAuth } from '../../context/tenantAuthContext';
import tenantAuthService from '../../services/tenantAuthService';
import rusunavaLogo from '../../assets/images/rusunawa-logo.png';

const Login = () => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasVerificationMessage, setHasVerificationMessage] = useState(false);
  const [error, setError] = useState('');
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const labelColor = useColorModeValue('gray.700', 'gray.200');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { login, isAuthenticated } = useTenantAuth();
  // Get the redirect destination from state, or default to dashboard
  const from = location.state?.from?.pathname || '/tenant/dashboard';
  // Check if redirected from email verification
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get('verified');
    const email = params.get('email');
    
    if (verified === 'true') {
      setHasVerificationMessage(true);
      if (email) setFormData(prev => ({ ...prev, email }));
      toast({
        title: 'Email verified successfully',
        description: 'You can now login to your account.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [location, toast]);
  
  // Show success message if redirected from verification
  useEffect(() => {
    if (location.state?.verificationSuccess) {
      toast({
        title: "Email Verified!",
        description: location.state.message || "Your email has been verified successfully. You can now log in.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Clear location state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, toast, navigate]);  // Redirect if already authenticated (this is handled by the context's token verification)
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/tenant/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const val = name === 'rememberMe' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };
    // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
      setError('');
    setIsLoading(true);
    
    try {
      // Call login with email and password
      const result = await login({
        email: formData.email,
        password: formData.password
      });
        if (result.success) {
        // If login is successful, the context will handle authentication
        // and redirect will happen via the useEffect that watches isAuthenticated
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else if (result.needsVerification) {
        // Handle email verification needed
        navigate('/tenant/verification-prompt', { 
          state: { 
            email: formData.email,
            from: from 
          }
        });
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={10}>
        <Stack direction={{ base: 'column', md: 'row' }} spacing={8}>
          {/* Left side - Image and info (for desktop) */}
          <Box display={{ base: 'none', md: 'block' }} flexBasis={{ md: '50%' }}>
            <VStack align="start" spacing={6}>
              <Heading as="h1" size="xl">
                Welcome to Rusunawa PNJ
              </Heading>
                <Image 
                src={rusunavaLogo} 
                alt="Rusunawa PNJ Logo" 
                borderRadius="md" 
                boxShadow="lg"
                w="100%"
                h="400px" 
                objectFit="contain"
                fallbackSrc={rusunavaLogo}
              />
              
              <Text fontSize="lg">
                Rusunawa PNJ provides comfortable and affordable accommodation for
                students and professionals at Politeknik Negeri Jakarta.
              </Text>
              
              <Card variant="outline" width="100%">
                <CardBody>
                  <Heading size="md" mb={4}>
                    Why Choose Rusunawa PNJ?
                  </Heading>
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Icon as={FaSchool} color="brand.500" />
                      <Text>Prime location on campus</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaSchool} color="brand.500" />
                      <Text>24/7 security and support</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaSchool} color="brand.500" />
                      <Text>Affordable rates for students</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaSchool} color="brand.500" />
                      <Text>Comfortable and well-maintained facilities</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </Box>
          
          {/* Right side - Login form */}
          <Box flexBasis={{ base: '100%', md: '50%' }}>
            <Card bg={cardBg} p={8} borderRadius="lg" boxShadow="md">
              <CardBody>
                <VStack spacing={6} as="form" onSubmit={handleSubmit}>
                  <Heading textAlign="center">Login to Your Account</Heading>
                  
                  {/* Email verification success message */}
                  {hasVerificationMessage && (
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Email verified!</AlertTitle>
                        <AlertDescription>
                          Your email has been verified. You can now login to your account.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                  
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel color={labelColor}>
                      <HStack spacing={2}>
                        <Icon as={FaEnvelope} />
                        <Text>Email Address</Text>
                      </HStack>
                    </FormLabel>                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="youremail@example.com"
                      size="lg"
                      autoComplete="email"
                    />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel color={labelColor}>
                      <HStack spacing={2}>
                        <Icon as={FaLock} />
                        <Text>Password</Text>
                      </HStack>
                    </FormLabel>
                    <InputGroup>                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        size="lg"
                        autoComplete="current-password"
                      />
                      <InputRightElement width="4.5rem" h="100%">
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                        >
                          {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  </FormControl>
                    <HStack justify="flex-end" width="100%">
                    <Link as={RouterLink} to="/forgot-password" color="brand.500">
                      Forgot password?
                    </Link>
                  </HStack>
                  
                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    width="100%"
                    isLoading={isLoading}
                    loadingText="Logging In"
                  >
                    Login
                  </Button>
                  
                  <Divider />                  <Text textAlign="center">
                    Don't have an account yet?{' '}
                    <Link as={RouterLink} to="/tenant/register" color="brand.500" fontWeight="semibold">
                      Register Now
                    </Link>
                  </Text>
                </VStack>
              </CardBody>
            </Card>
              {/* Link to homepage (displayed only on mobile) */}
            <Box display={{ base: 'block', md: 'none' }} textAlign="center" mt={4}>
              <Link as={RouterLink} to="/" color="brand.500">
                ← Back to Home
              </Link>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Login;
