import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Stack,
  Heading,
  Text,
  Container,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  Select,
  Divider,
  useToast,
  ScaleFade,
  Center,
  Icon,
  Link,
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, CheckCircleIcon } from '@chakra-ui/icons';
import axios from 'axios';
import LocationPicker from './components/map/LocationPicker.jsx';

export default function RegisterPage() {
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    address: '',
    gender: 'L',
    nim: '',
    tenant_type: 'mahasiswa',
    type_id: 1,
    home_latitude: null,
    home_longitude: null
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      // Reset NIM if tenant type is not student
      ...(name === 'tenant_type' && value !== 'mahasiswa' ? { nim: '' } : {}),
      // Set type_id based on tenant_type
      ...(name === 'tenant_type' ? { type_id: value === 'mahasiswa' ? 1 : 2 } : {})
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleLocationChange = (position) => {
    setForm(prev => ({
      ...prev,
      home_latitude: position.lat,
      home_longitude: position.lng
    }));
    
    if (errors.location) {
      setErrors(prev => ({
        ...prev,
        location: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
    
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    
    if (!form.phone) newErrors.phone = "Phone number is required";
    if (!form.address) newErrors.address = "Address is required";
    if (!form.gender) newErrors.gender = "Gender is required";
    
    // Only validate NIM for students
    if (form.tenant_type === 'mahasiswa' && !form.nim) {
      newErrors.nim = "Student ID (NIM) is required for students";
    }
    
    if (!form.home_latitude || !form.home_longitude) {
      newErrors.location = "Please select your home location on the map";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      const registerData = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        gender: form.gender,
        tenant_type: form.tenant_type,
        type_id: form.type_id,
        home_latitude: form.home_latitude,
        home_longitude: form.home_longitude
      };

      // Only include NIM for students
      if (form.tenant_type === 'mahasiswa') {
        registerData.nim = form.nim;
      }
      
      // Make direct API call to the backend
      const response = await axios.post('http://localhost:8001/v1/tenant/auth/register', registerData, config);
      
      if (response.data && response.data.status && response.data.status.status === 'success') {        setRegistrationSuccess(true);
        
        // Store user data if needed
        if (response.data.tenant) {
          // Normalize tenant data before storing
          const normalizedTenant = { ...response.data.tenant };
          
          // Convert tenant type objects to strings to prevent React rendering issues
          if (normalizedTenant.tenant && normalizedTenant.tenant.tenantType && 
              typeof normalizedTenant.tenant.tenantType === 'object' && 
              normalizedTenant.tenant.tenantType !== null) {
            console.log('Normalizing nested tenant type on register:', normalizedTenant.tenant.tenantType);
            normalizedTenant.tenant.tenantType = normalizedTenant.tenant.tenantType.name || '';
          }
          
          if (normalizedTenant.tenantType && 
              typeof normalizedTenant.tenantType === 'object' && 
              normalizedTenant.tenantType !== null) {
            console.log('Normalizing direct tenant type on register:', normalizedTenant.tenantType);
            normalizedTenant.tenantType = normalizedTenant.tenantType.name || '';
          }
          
          localStorage.setItem('tenant_data', JSON.stringify(normalizedTenant));
        }
        
        toast({
          title: "Registration Successful",
          description: "Your account has been created. Redirecting to login page...",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        // Show success and redirect after delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          setErrors(err.response.data.errors);
        } else {
          toast({
            title: "Registration Failed",
            description: err.response.data.message || "An error occurred during registration",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: "Registration Failed",
          description: "Unable to connect to the server. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <ScaleFade initialScale={0.9} in={true}>
        <Center flexDirection="column" p={8} bg="green.50" borderRadius="xl" boxShadow="md">
          <Icon as={CheckCircleIcon} boxSize={16} color="green.500" mb={4} />
          <Heading size="lg" mb={2}>Registration Successful!</Heading>
          <Text mb={4}>Your account has been created. Redirecting to login page...</Text>
          <Box width="100%" maxW="300px">
            <Box
              height="4px"
              bg="green.100"
              borderRadius="full"
              overflow="hidden"
              position="relative"
            >
              <Box
                position="absolute"
                width="100%"
                height="100%"
                borderRadius="full"
                bg="green.500"
                animation="progress 3s linear forwards"
              />
            </Box>
          </Box>
          <Box as="style">
            {`
              @keyframes progress {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(0); }
              }
            `}
          </Box>
        </Center>
      </ScaleFade>
    );
  }

  return (
    <Container maxW="xl" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing="8">
        <Stack spacing="6" textAlign="center">
          <Heading fontSize="3xl">Create your account</Heading>
          <Text color="gray.500">
            Register for Rusunawa Tenant Portal
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
                <FormControl id="tenant_type" isRequired>
                  <FormLabel>Tenant Type</FormLabel>
                  <RadioGroup
                    name="tenant_type"
                    value={form.tenant_type}
                    onChange={(value) => handleChange({ target: { name: 'tenant_type', value } })}
                  >
                    <Stack direction="row">
                      <Radio value="mahasiswa">Student (Mahasiswa)</Radio>
                      <Radio value="non-mahasiswa">Non-Student (Non-Mahasiswa)</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <FormControl id="name" isRequired isInvalid={errors.name}>
                  <FormLabel>Full Name</FormLabel>
                  <Input 
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>
                
                <FormControl id="email" isRequired isInvalid={errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>
                
                <FormControl id="password" isRequired isInvalid={errors.password}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
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
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>
                
                <FormControl id="password_confirmation" isRequired isInvalid={errors.password_confirmation}>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup>
                    <Input
                      name="password_confirmation"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.password_confirmation}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                    />
                    <InputRightElement h={'full'}>
                      <Button
                        variant={'ghost'}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.password_confirmation}</FormErrorMessage>
                </FormControl>
                
                <FormControl id="phone" isRequired isInvalid={errors.phone}>
                  <FormLabel>Phone Number</FormLabel>
                  <Input 
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g., 812-3456-7890"
                  />
                  <FormErrorMessage>{errors.phone}</FormErrorMessage>
                </FormControl>
                
                <FormControl id="gender" isRequired isInvalid={errors.gender}>
                  <FormLabel>Gender</FormLabel>
                  <Select 
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    placeholder="Select gender"
                  >
                    <option value="L">Male (L)</option>
                    <option value="P">Female (P)</option>
                  </Select>
                  <FormErrorMessage>{errors.gender}</FormErrorMessage>
                </FormControl>
                
                {form.tenant_type === 'mahasiswa' && (
                  <FormControl id="nim" isRequired isInvalid={errors.nim}>
                    <FormLabel>Student ID (NIM)</FormLabel>
                    <Input 
                      name="nim"
                      value={form.nim}
                      onChange={handleChange}
                      placeholder="e.g., 1904100001"
                    />
                    <FormErrorMessage>{errors.nim}</FormErrorMessage>
                  </FormControl>
                )}
                
                <FormControl id="address" isRequired isInvalid={errors.address}>
                  <FormLabel>Address</FormLabel>
                  <Input 
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Your home address"
                  />
                  <FormErrorMessage>{errors.address}</FormErrorMessage>
                </FormControl>
                
                <FormControl id="location" isRequired isInvalid={errors.location}>
                  <FormLabel>Home Location</FormLabel>
                  <LocationPicker 
                    value={form.home_latitude && form.home_longitude ? 
                      { lat: form.home_latitude, lng: form.home_longitude } : null
                    }
                    onChange={handleLocationChange}
                  />
                  <FormErrorMessage>{errors.location}</FormErrorMessage>
                </FormControl>
              </Stack>
              
              <Divider />
              
              <Stack spacing="6">
                <Button 
                  colorScheme="blue" 
                  type="submit" 
                  isLoading={loading}
                  loadingText="Registering"
                  bg="brand.500"
                  _hover={{ bg: "brand.400" }}
                >
                  Register
                </Button>
                <Text textAlign="center">
                  Already have an account?{' '}
                  <Link color="brand.500" href="/login">
                    Sign in
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
