import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  Container,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  Link,
  Flex,
  Divider,
  ScaleFade,
  useDisclosure,
  Center,
  Icon
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, CheckCircleIcon } from '@chakra-ui/icons';
import axios from 'axios';

export default function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
    const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Set appropriate headers
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      };
      
      console.log('Sending login request:', { email: form.email });
      
      // First try to use Laravel's authentication endpoint
      try {
        const response = await axios.post('/login', {
          email: form.email,
          password: form.password
        }, config);
        
        console.log('Login response from Laravel:', response);
        
        if (response.data.success) {
          setSuccess('Login successful!');
          setShowSuccess(true);
          
          // Show success animation for 1.5 seconds before redirecting
          setTimeout(() => {
            window.location.href = response.data.redirect || '/'; 
          }, 1500);
          return;
        }
      } catch (laravelErr) {
        console.log('Laravel login failed, falling back to direct API:', laravelErr);
        // If Laravel auth fails, fall back to direct API call
      }
      
      // Fallback: Use axios to post data directly to Golang backend API
      const response = await axios.post('http://localhost:8001/v1/tenant/auth/login', {
        email: form.email,
        password: form.password
      }, config);
      
      console.log('Login response from direct API:', response);
      
      if (response.data) {
        // Store JWT token in localStorage and sessionStorage
        if (response.data.token) {
          localStorage.setItem('tenant_token', response.data.token);
          sessionStorage.setItem('tenant_token', response.data.token);
        }
        
        // Store login state in localStorage for persistent login state
        localStorage.setItem('isLoggedIn', 'true');
        
        // Store user data if available
        if (response.data.tenant) {
          localStorage.setItem('userData', JSON.stringify(response.data.tenant));
        }
        
        setSuccess('Login successful!');
        setShowSuccess(true);
        
        // Show success animation for 1.5 seconds before redirecting
        setTimeout(() => {
          window.location.href = '/'; // Redirect to landing page instead of dashboard
        }, 1500);
      } else if (response.data && response.data.message) {
        setError(response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error details:', err);
      
      if (err.response) {
        // The request was made and the server responded with an error status
        if (err.response.data && err.response.data.status) {
          // Handle Golang API error response format
          setError(err.response.data.status.message || 'Login failed. Please check your credentials.');
        } else {
          setError(err.response.data.message || 'Login failed. Please check your credentials.');
        }
      } else if (err.request) {
        // The request was made but no response was received (API might be down)
        setError('Unable to connect to the server. The backend API may not be running.');
      } else {
        // Something happened in setting up the request
        setError('Login failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '4', sm: '8' }}>
      <Stack spacing="8">
        <Stack spacing="6" textAlign="center">
          <Heading fontSize="3xl">Welcome Back</Heading>
          <Text color="gray.500">
            Sign in to your account
          </Text>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={{ base: 'transparent', sm: 'white' }}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
              <Stack spacing="5">
                <FormControl id="email" isRequired isInvalid={!!error}>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                  />
                </FormControl>
                
                <FormControl id="password" isRequired isInvalid={!!error}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                    />
                    <InputRightElement h={'full'}>
                      <Button
                        variant={'ghost'}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                
                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
                
                {success && (
                  <Alert status="success">
                    <AlertIcon />
                    {success}
                  </Alert>
                )}
                
                <Button 
                  colorScheme="blue" 
                  type="submit" 
                  isLoading={loading}
                  loadingText="Signing in"
                  bg="brand.500"
                  _hover={{ bg: "brand.400" }}
                >
                  Sign In
                </Button>
                
                <Text textAlign="center">
                  Don't have an account?{' '}
                  <Link color="brand.500" href="/register">
                    Sign up
                  </Link>
                </Text>
                <Link href="/" color="brand.500" textAlign="center">
                  Return to Home
                </Link>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
}