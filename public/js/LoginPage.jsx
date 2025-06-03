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
      
      // First try with Laravel endpoint
      try {
        console.log('Attempting Laravel login...');
        const response = await axios.post('/tenant/login', {
          email: form.email,
          password: form.password
        }, config);
        
        console.log('Login response:', response);
        
        if (response.data && response.data.success) {
          // Store authentication data
          if (response.data.tenant_token) {
            localStorage.setItem('tenant_token', response.data.tenant_token);
            sessionStorage.setItem('tenant_token', response.data.tenant_token);
          }
          
          if (response.data.tenant_data) {
            localStorage.setItem('tenant_data', JSON.stringify(response.data.tenant_data));
            sessionStorage.setItem('tenant_data', JSON.stringify(response.data.tenant_data));
          }
          
          // Notify other components about the login
          window.dispatchEvent(new Event('tenantAuthChanged'));
          
          setSuccess('Login successful!');
          setShowSuccess(true);
          
          // Wait briefly then redirect
          setTimeout(() => {
            // Use explicit URL to navigate back to landing page
            window.location.href = response.data.redirect || '/';
            
            // Dispatch a custom event for any listening components
            window.dispatchEvent(new CustomEvent('loginSuccess', {
              detail: {
                tenant: response.data.tenant_data,
                token: response.data.tenant_token
              }
            }));
          }, 1000);
          return;
        }
      } catch (laravelErr) {
        console.error('Laravel login attempt failed:', laravelErr);
        
        // Only show error if it's a validation error, not a network error
        if (laravelErr.response && laravelErr.response.status === 422) {
          setError(laravelErr.response.data.errors || 'Invalid email or password');
          setLoading(false);
          return;
        }
      }
      
      // Fallback to direct API call
      const response = await axios.post('http://localhost:8001/v1/tenant/auth/login', {
        email: form.email,
        password: form.password
      }, config);
      
      if (response.data) {
        // Store JWT token in localStorage 
        if (response.data.token) {
          localStorage.setItem('tenant_token', response.data.token);
          sessionStorage.setItem('tenant_token', response.data.token);
        }
        
        // Store tenant data
        if (response.data.tenant) {
          localStorage.setItem('tenant_data', JSON.stringify(response.data.tenant));
          sessionStorage.setItem('tenant_data', JSON.stringify(response.data.tenant));
        }
        
        // Notify other components about the login
        window.dispatchEvent(new Event('tenantAuthChanged'));
        
        setSuccess('Login successful!');
        setShowSuccess(true);
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        if (err.response.data && err.response.data.status) {
          setError(err.response.data.status.message || 'Login failed. Please check your credentials.');
        } else {
          setError(err.response.data.message || 'Login failed. Please check your credentials.');
        }
      } else if (err.request) {
        setError('Unable to connect to the server. The backend API may not be running.');
      } else {
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
          {showSuccess ? (
            <ScaleFade initialScale={0.9} in={true}>
              <Center flexDirection="column" p={8} textAlign="center">
                <Icon as={CheckCircleIcon} w={12} h={12} color="green.500" mb={4} />
                <Heading size="md" mb={2}>Login Successful!</Heading>
                <Text mb={4}>Redirecting you to dashboard...</Text>
              </Center>
            </ScaleFade>
          ) : (
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
                    <Link color="brand.500" href="/tenant/password/reset">
                      Forgot password?
                    </Link>
                  </Text>
                  
                  <Divider />
                  
                  <Text textAlign="center">
                    Don't have an account?{' '}
                    <Link color="brand.500" href="/tenant/register">
                      Sign up
                    </Link>
                  </Text>
                  <Link href="/" color="brand.500" textAlign="center">
                    Return to Home
                  </Link>
                </Stack>
              </Stack>
            </form>
          )}
        </Box>
      </Stack>
    </Container>
  );
}