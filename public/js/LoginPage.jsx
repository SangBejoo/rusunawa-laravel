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
  Divider
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, CheckCircleIcon } from '@chakra-ui/icons';
import tenantAuthService from './services/tenantAuthService.js';

export default function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Clear any existing tokens on page load
  useEffect(() => {
    // Check if we already have a token (for auto-redirect)
    const token = localStorage.getItem('tenant_token');
    const tenantData = localStorage.getItem('tenant_data');
    
    if (token && tenantData) {
      console.log('Already logged in, redirecting...');
      // Get return URL from query params or use landing page as default
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('redirect') || '/';
      window.location.href = returnUrl;
      return;
    }
    
    // If not already logged in, clean up any invalid auth data
    localStorage.removeItem('tenant_token');
    localStorage.removeItem('tenant_data');
    sessionStorage.removeItem('tenant_token');
    sessionStorage.removeItem('tenant_data');
    
    try {
      window.dispatchEvent(new Event('tenantAuthChanged'));
    } catch (e) {
      console.error('Error dispatching event:', e);
    }
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Client-side validation
      if (!form.email) {
        setError('Email is required');
        setLoading(false);
        return;
      }
      
      if (!form.password) {
        setError('Password is required');
        setLoading(false);
        return;
      }
      
      console.log('Attempting login with Go backend...');
      const response = await tenantAuthService.login(form.email, form.password);
      
      console.log('Login successful:', response);
      
      // Normalize tenant data before storing
      const normalizedTenant = { ...response.tenant };
      
      // Convert tenant type objects to strings to prevent React rendering issues
      if (normalizedTenant.tenant && normalizedTenant.tenant.tenantType && 
          typeof normalizedTenant.tenant.tenantType === 'object' && 
          normalizedTenant.tenant.tenantType !== null) {
        console.log('Normalizing nested tenant type on login:', normalizedTenant.tenant.tenantType);
        normalizedTenant.tenant.tenantType = normalizedTenant.tenant.tenantType.name || '';
      }
      
      if (normalizedTenant.tenantType && 
          typeof normalizedTenant.tenantType === 'object' && 
          normalizedTenant.tenantType !== null) {
        console.log('Normalizing direct tenant type on login:', normalizedTenant.tenantType);
        normalizedTenant.tenantType = normalizedTenant.tenantType.name || '';
      }
      
      // Make sure data is in both localStorage and sessionStorage for consistency
      localStorage.setItem('tenant_token', response.token);
      localStorage.setItem('tenant_data', JSON.stringify(normalizedTenant));
      
      // Force a tenantAuthChanged event to update all components
      try {
        window.dispatchEvent(new Event('tenantAuthChanged'));
      } catch (e) {
        console.error('Error dispatching auth event:', e);
      }
      
      // Show success message first
      setShowSuccess(true);
      
      // Get return URL from query params or use landing page as default
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('redirect') || '/';
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = returnUrl;
      }, 1500);
      
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
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
            <form id="login-form" onSubmit={handleSubmit}>
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