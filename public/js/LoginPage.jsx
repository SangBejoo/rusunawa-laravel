import React, { useState, useEffect } from 'react';
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
  ScaleFade,
  Center,
  Icon,
  Divider,
  useToast
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, CheckCircleIcon } from '@chakra-ui/icons';
import axios from 'axios';

export default function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const toast = useToast();
  
  useEffect(() => {
    // Log initial state for debugging
    console.log("Login page loaded, checking authentication state");
    
    // Check token and redirect if already logged in
    const token = localStorage.getItem('tenant_token');
    const tenantData = localStorage.getItem('tenant_data');
    
    // Display CSRF token for debugging
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    console.log("CSRF token from meta tag:", csrfToken ? "Found (length: " + csrfToken.length + ")" : "Not found");
    
    if (token && tenantData) {
      console.log("Found existing authentication data, verifying...");
      // Manually check for redirect parameter first
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('redirect');
      
      if (returnUrl) {
        console.log("Redirecting to:", returnUrl);
        window.location.href = returnUrl;
        return;
      }
      
      // Otherwise proceed to landing page instead of dashboard
      console.log("Redirecting to landing page");
      window.location.href = '/';  // Changed from '/tenant/dashboard' to '/'
    } else {
      console.log("No authentication data found, showing login form");
      // Clean up any invalid auth data
      localStorage.removeItem('tenant_token');
      localStorage.removeItem('tenant_data');
    }
    
    // Fetch a fresh CSRF token if needed
    refreshCsrfToken();
  }, []);

  // Function to refresh CSRF token
  const refreshCsrfToken = async () => {
    try {
      const response = await fetch('/csrf-refresh', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("CSRF token refreshed");
        
        // Update the meta tag with the new token
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
          metaTag.setAttribute("content", data.token);
          console.log("Meta tag updated with new CSRF token");
        }
      }
    } catch (error) {
      console.error("Failed to refresh CSRF token:", error);
    }
  };
  
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      console.log("Submitting login form directly to Go backend API...");
      
      // Create the payload for the API
      const loginData = {
        email: form.email,
        password: form.password
      };
      
      console.log("Sending login request to Go API");
      const response = await fetch('http://localhost:8001/v1/tenant/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      
      // Parse response
      const data = await response.json();
      console.log("Login response from API:", data);
      
      if (data.token && data.tenant) {
        console.log("Login successful, storing credentials");
        
        // Store authentication data
        localStorage.setItem('tenant_token', data.token);
        localStorage.setItem('tenant_data', JSON.stringify(data.tenant));
        
        // Show success message
        setShowSuccess(true);
        
        // Get redirect URL from query parameter or use landing page as default
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get('redirect') || '/';
        
        console.log("Will redirect to:", redirectUrl);
        
        // Redirect after a brief delay
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1500);
      } else {
        console.error("Login failed:", data.status?.message || "Unknown error");
        setError(data.status?.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (err.response) {
        if (err.response.status === 419) {
          errorMessage = 'CSRF token mismatch. Please refresh the page and try again.';
          
          // Try refreshing the CSRF token
          try {
            await axios.get('/csrf-refresh');
            // Reload the page to get a fresh CSRF token
            window.location.reload();
            return;
          } catch (refreshErr) {
            console.error("Failed to refresh CSRF token:", refreshErr);
          }
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: "Login Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
                <Text mb={4}>Redirecting you...</Text>
              </Center>
            </ScaleFade>
          ) : (
            <form id="login-form" onSubmit={handleLogin}>
              <Stack spacing="6">
                <Stack spacing="5">
                  {/* Add hidden CSRF token field */}
                  <input 
                    type="hidden" 
                    name="_token" 
                    value={document.querySelector('meta[name="csrf-token"]')?.content || ''} 
                  />
                  
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