import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Select,
  VStack,
  HStack,
  useToast,
  Icon,
  useColorModeValue,
  Divider,
  Card,
  CardBody,
  VisuallyHidden,
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
  Alert,
  AlertIcon,
  Image,
  IconButton,
  Spinner
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, CheckCircleIcon, SearchIcon } from '@chakra-ui/icons';
import { FaUser, FaEnvelope, FaLock, FaIdCard, FaMapMarkerAlt, FaPhone, FaSchool, FaTransgender } from 'react-icons/fa';

import tenantAuthService from '../../services/tenantAuthService';
import { validateEmail, validatePassword, validateConfirmPassword, validateName, validatePhone, validateNIM } from '../../utils/validationUtils';
import LocationPicker from '../../components/map/LocationPicker';
import { useTenantAuth } from '../../context/tenantAuthContext';
import rusunavaLogo from '../../assets/images/rusunawa-logo.png';

// Common jurusan (major) options
const jurusanOptions = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Teknik Komputer',
  'Teknik Elektro',
  'Teknik Mesin',
  'Teknik Sipil',
  'Teknik Industri',
  'Teknik Kimia',
  'Arsitektur',
  'Manajemen',
  'Akuntansi',
  'Ekonomi',
  'Hukum',
  'Psikologi',
  'Kedokteran',
  'Farmasi',
  'Keperawatan',
  'Pendidikan',
  'Sastra Indonesia',
  'Sastra Inggris',
  'Komunikasi',
  'Desain Grafis',
  'Lainnya'
];

const steps = [
  { title: 'Account', description: 'Create account' },
  { title: 'Personal', description: 'Personal info' },
  { title: 'Location', description: 'Your address' },
  { title: 'Review', description: 'Complete' }
];

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  const { isAuthenticated } = useTenantAuth();
  
  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {    navigate('/tenant/dashboard');
  }

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    gender: '',
    phone: '',
    address: '',
    homeLatitude: null,
    homeLongitude: null,
    nim: '',
    typeId: 1, // Default: mahasiswa
    isAfirmasi: false, // Default: false (regular mahasiswa)
    jurusan: '', // Major/Department
    customJurusan: '', // For custom jurusan input
    isCustomJurusan: false // Track if user selected "Other"
  });
  
  // Add the missing serverError state
  const [serverError, setServerError] = useState('');
    // Form validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Geocoding trigger state
  const [geocodeTrigger, setGeocodeTrigger] = useState(0);
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const labelColor = useColorModeValue('gray.700', 'gray.200');
    // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
      // Special handling for typeId change
    if (name === 'typeId') {
      const newTypeId = parseInt(value);
      setFormData(prev => ({
        ...prev,
        [name]: newTypeId,
        // Clear student-specific fields when switching to non-student
        ...(newTypeId !== 1 && {
          nim: '',
          isAfirmasi: false,
          jurusan: '',
          customJurusan: '',
          isCustomJurusan: false
        })
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field when typing
    if(errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };  // Handle address field changes
  const handleAddressChange = (e) => {
    const address = e.target.value;
    setFormData(prev => ({ ...prev, address }));
    
    // Clear error for address field when typing
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: '' }));
    }
  };

  // Handle Enter key in address field (prevent form submission)
  const handleAddressKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Optionally trigger geocoding here
      handleCheckCoordinates();
    }
  };
  // Handle manual coordinate checking
  const handleCheckCoordinates = () => {
    if (formData.address && formData.address.trim().length > 10) {
      // Trigger geocoding by incrementing the trigger counter
      setGeocodeTrigger(prev => prev + 1);
      toast({
        title: 'Checking Coordinates',
        description: 'Looking up coordinates for your address...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Address Too Short',
        description: 'Please enter a more detailed address (at least 10 characters)',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle location selection with optional address
  const handleLocationSelect = (position, address = null) => {
    const newFormData = {
      ...formData,
      homeLatitude: position?.lat || null,
      homeLongitude: position?.lng || null
    };

    // Always update address if provided from map selection
    if (address) {
      newFormData.address = address;
    }

    setFormData(newFormData);
    
    // Clear location errors
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
    
    // Show success message if address was auto-filled
    if (address) {
      toast({
        title: 'Address Updated',
        description: 'Address has been automatically updated based on your selected coordinates.',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };
  
  // Validate current step
  const validateStep = () => {
    const newErrors = {};
    
    switch(activeStep) {
      case 0: // Account
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword);
        
        if (emailError) newErrors.email = emailError;
        if (passwordError) newErrors.password = passwordError;
        if (confirmError) newErrors.confirmPassword = confirmError;
        break;
        
      case 1: // Personal
        const nameError = validateName(formData.name);
        const phoneError = validatePhone(formData.phone);
        
        if (nameError) newErrors.name = nameError;
        if (phoneError) newErrors.phone = phoneError;
        if (!formData.gender) newErrors.gender = 'Gender is required';
          // NIM is required only for students
        if (formData.typeId === 1) {
          const nimError = validateNIM(formData.nim);
          if (nimError) newErrors.nim = nimError;
          
          // Jurusan is also required for students
          if (!formData.jurusan.trim()) {
            newErrors.jurusan = 'Jurusan (Major/Department) is required for students';
          }
        }
        break;
        
      case 2: // Location
        if (!formData.homeLatitude || !formData.homeLongitude) {
          newErrors.location = 'Please select your home location on the map';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Move to next step
  const handleNextStep = () => {
    if (validateStep()) {
      setActiveStep(activeStep + 1);
    }
  };

  // Move to previous step
  const handlePrevStep = () => {
    setActiveStep(activeStep - 1);
  };

  // Add the validateForm function if it doesn't exist
  const validateForm = () => {
    const validationErrors = {};
    
    // Email validation
    if (!formData.email) {
      validationErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = "Invalid email format";
    }
    
    // Password validation
    if (!formData.password) {
      validationErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters";
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }
    
    // Name validation
    if (!formData.name) {
      validationErrors.name = "Name is required";
    }
    
    // Gender validation
    if (!formData.gender) {
      validationErrors.gender = "Gender is required";
    }
    
    // Type validation
    if (!formData.typeId && !formData.tenantType) {
      validationErrors.typeId = "Tenant type is required";
    }
      // NIM validation for students
    if ((formData.typeId === 1 || formData.tenantType === 'mahasiswa') && !formData.nim) {
      validationErrors.nim = "NIM is required for students";
    }
    
    // Jurusan validation for students
    if ((formData.typeId === 1 || formData.tenantType === 'mahasiswa') && !formData.jurusan.trim()) {
      validationErrors.jurusan = "Jurusan (Major/Department) is required for students";
    }
    
    return validationErrors;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setErrors({});
    setServerError('');
    setIsSubmitting(true);
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      const result = await tenantAuthService.register(formData);
      
      // Check if registration was successful
      if (result.success || 
          (result.status && result.status.status === 'success') || 
          (result.tenant && result.tenant.tenantId)) {
        
        toast({
          title: "Registration successful!",
          description: "Please check your email for the verification token.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        // IMPORTANT: Immediately redirect to verification page with email pre-filled
        navigate('/tenant/verification-prompt', { 
          state: { 
            email: formData.email,
            fromRegistration: true
          } 
        });
      } else {
        setServerError(result.message || result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error('Registration error:', err);
      setServerError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render different steps
  const renderStepContent = () => {
    switch(activeStep) {
      case 0: // Account Information
        return (
          <VStack spacing={6} align="stretch">
            <FormControl isInvalid={!!errors.email}>
              <FormLabel htmlFor="email" color={labelColor}>
                <HStack spacing={2}>
                  <Icon as={FaEnvelope} />
                  <Text>Email Address</Text>
                </HStack>
              </FormLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="youremail@example.com"
                size="lg"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={!!errors.password}>
              <FormLabel htmlFor="password" color={labelColor}>
                <HStack spacing={2}>
                  <Icon as={FaLock} />
                  <Text>Password</Text>
                </HStack>
              </FormLabel>
              <InputGroup>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter a strong password"
                  size="lg"
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
            
            <FormControl isInvalid={!!errors.confirmPassword}>
              <FormLabel htmlFor="confirmPassword" color={labelColor}>
                <HStack spacing={2}>
                  <Icon as={FaLock} />
                  <Text>Confirm Password</Text>
                </HStack>
              </FormLabel>
              <InputGroup>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  size="lg"
                />
                <InputRightElement width="4.5rem" h="100%">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    variant="ghost"
                  >
                    {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
            </FormControl>
            
            <FormControl>
              <FormLabel htmlFor="typeId" color={labelColor}>
                <HStack spacing={2}>
                  <Icon as={FaUser} />
                  <Text>Account Type</Text>
                </HStack>
              </FormLabel>
              <Select
                id="typeId"
                name="typeId"
                value={formData.typeId}
                onChange={handleChange}
                size="lg"
              >
                <option value={1}>Student (Mahasiswa)</option>
                <option value={2}>Non-Student (Non-Mahasiswa)</option>
              </Select>
            </FormControl>
          </VStack>
        );
        
      case 1: // Personal Information
        return (
          <VStack spacing={6} align="stretch">
            <FormControl isInvalid={!!errors.name}>
              <FormLabel htmlFor="name" color={labelColor}>
                <HStack spacing={2}>
                  <Icon as={FaUser} />
                  <Text>Full Name</Text>
                </HStack>
              </FormLabel>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                size="lg"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={!!errors.gender}>
              <FormLabel htmlFor="gender" color={labelColor}>
                <HStack spacing={2}>
                  <Icon as={FaTransgender} />
                  <Text>Gender</Text>
                </HStack>
              </FormLabel>
              <Select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                placeholder="Select gender"
                size="lg"
              >
                <option value="L">Male (Laki-laki)</option>
                <option value="P">Female (Perempuan)</option>
              </Select>
              <FormErrorMessage>{errors.gender}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={!!errors.phone}>
              <FormLabel htmlFor="phone" color={labelColor}>
                <HStack spacing={2}>
                  <Icon as={FaPhone} />
                  <Text>Phone Number</Text>
                </HStack>
              </FormLabel>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 08123456789"
                size="lg"
              />
              <FormErrorMessage>{errors.phone}</FormErrorMessage>
            </FormControl>
              {formData.typeId === 1 && (
              <>
                <FormControl isInvalid={!!errors.nim}>
                  <FormLabel htmlFor="nim" color={labelColor}>
                    <HStack spacing={2}>
                      <Icon as={FaIdCard} />
                      <Text>Student ID (NIM)</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    id="nim"
                    name="nim"
                    value={formData.nim}
                    onChange={handleChange}
                    placeholder="Your student ID number"
                    size="lg"
                  />
                  <FormErrorMessage>{errors.nim}</FormErrorMessage>
                </FormControl>                <FormControl isInvalid={!!errors.jurusan}>
                  <FormLabel htmlFor="jurusan" color={labelColor}>
                    <HStack spacing={2}>
                      <Icon as={FaSchool} />
                      <Text>Jurusan (Major/Department)</Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    id="jurusan"
                    name="jurusan"
                    value={formData.isCustomJurusan ? 'Lainnya' : formData.jurusan}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'Lainnya') {
                        setFormData(prev => ({
                          ...prev,
                          isCustomJurusan: true,
                          jurusan: ''
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          isCustomJurusan: false,
                          jurusan: value,
                          customJurusan: ''
                        }));
                      }
                    }}
                    placeholder="Select your major/department"
                    size="lg"
                  >
                    {jurusanOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                  
                  {/* Custom jurusan input field */}
                  {formData.isCustomJurusan && (
                    <Input
                      mt={2}
                      id="customJurusan"
                      name="customJurusan"
                      type="text"
                      value={formData.customJurusan}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          customJurusan: value,
                          jurusan: value // Update jurusan with custom value
                        }));
                      }}
                      placeholder="Enter your major/department"
                      size="lg"
                    />
                  )}
                  
                  <FormErrorMessage>{errors.jurusan}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel color={labelColor}>
                    <HStack spacing={2}>
                      <Icon as={CheckCircleIcon} />
                      <Text>Status Mahasiswa</Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    name="isAfirmasi"
                    value={formData.isAfirmasi}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      isAfirmasi: e.target.value === 'true' 
                    }))}
                    size="lg"
                  >
                    <option value={false}>Mahasiswa Regular</option>
                    <option value={true}>Mahasiswa Afirmasi</option>
                  </Select>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Pilih "Mahasiswa Afirmasi" jika Anda merupakan mahasiswa penerima beasiswa atau program afirmasi
                  </Text>
                </FormControl>
              </>
            )}
          </VStack>
        );
        
      case 2: // Location Information
        return (
          <VStack spacing={6} align="stretch">
            <FormControl isInvalid={!!errors.location}>
              <FormLabel color={labelColor}>
                <HStack spacing={2}>
                  <Icon as={FaMapMarkerAlt} />
                  <Text>Home Location</Text>
                </HStack>
              </FormLabel>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Click on the map to select your home location
              </Text>              <LocationPicker
                value={{
                  lat: formData.homeLatitude, 
                  lng: formData.homeLongitude
                }}
                onChange={handleLocationSelect}
                addressValue={formData.address}
                onAddressChange={(address) => setFormData(prev => ({ ...prev, address }))}
                triggerGeocode={geocodeTrigger}
              />
              <FormErrorMessage>{errors.location}</FormErrorMessage>
            </FormControl>            <FormControl>
              <FormLabel htmlFor="address" color={labelColor}>Address</FormLabel>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Type your address or click on the map below to auto-fill
              </Text>
              <HStack spacing={2}>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleAddressChange}
                  onKeyDown={handleAddressKeyDown}
                  placeholder="Enter your full address or select on map"
                  size="lg"
                  flex={1}
                />
                <IconButton
                  aria-label="Check coordinates for address"
                  icon={<SearchIcon />}
                  onClick={handleCheckCoordinates}
                  colorScheme="blue"
                  variant="outline"
                  size="lg"
                  isDisabled={!formData.address || formData.address.trim().length < 10}
                  title="Click to find coordinates for your address"
                />
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Press Enter or click the search button to find coordinates for your address
              </Text>
            </FormControl>
          </VStack>
        );
        
      case 3: // Review & Complete
        return registrationComplete ? (
          <VStack spacing={6} align="center">
            <Icon as={CheckCircleIcon} w={20} h={20} color="green.500" />
            <Heading size="lg" textAlign="center">
              Registration Complete!
            </Heading>
            <Text textAlign="center">
              Thank you for registering with Rusunawa PNJ. Please check your email for verification instructions.
            </Text>
            <Button 
              as={RouterLink} 
              to="/tenant/login"
              colorScheme="brand" 
              size="lg" 
              width="100%"
            >
              Proceed to Login
            </Button>
          </VStack>
        ) : (
          <VStack spacing={6} align="stretch">
            <Heading size="md" mb={2}>
              Review Your Information
            </Heading>
            
            <Card variant="outline">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="bold">Account Details</Text>
                    <Text>Email: {formData.email}</Text>
                    <Text>Account Type: {formData.typeId === 1 ? 'Student (Mahasiswa)' : 'Non-Student (Non-Mahasiswa)'}</Text>
                  </Box>
                  
                  <Divider />
                    <Box>
                    <Text fontWeight="bold">Personal Information</Text>
                    <Text>Name: {formData.name}</Text>
                    <Text>Gender: {formData.gender === 'L' ? 'Male (Laki-laki)' : 'Female (Perempuan)'}</Text>
                    <Text>Phone: {formData.phone}</Text>
                    {formData.typeId === 1 && (
                      <>
                        <Text>Student ID (NIM): {formData.nim}</Text>
                        <Text>Jurusan: {formData.jurusan}</Text>
                        <Text>Status: {formData.isAfirmasi ? 'Mahasiswa Afirmasi' : 'Mahasiswa Regular'}</Text>
                      </>
                    )}
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Text fontWeight="bold">Location</Text>
                    <Text>Coordinates: {formData.homeLatitude?.toFixed(6)}, {formData.homeLongitude?.toFixed(6)}</Text>
                    <Text>Address: {formData.address || '(Auto-generated from coordinates)'}</Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
            
            <Alert status="info">
              <AlertIcon />
              By registering, you agree to our Terms of Service and Privacy Policy.
            </Alert>
          </VStack>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.800')}>
      <Container maxW="container.xl" py={10}>
        <Stack direction={{ base: 'column', md: 'row' }} spacing={8} align="flex-start">
          {/* Left side - Image and info */}
          <Box display={{ base: 'none', md: 'block' }} flexBasis={{ md: '40%', lg: '50%' }}>
            <VStack align="start" spacing={6}>              <Image 
                src={rusunavaLogo} 
                alt="Rusunawa PNJ Logo" 
                borderRadius="md" 
                boxShadow="md"
                objectFit="contain"
                height="300px"
                width="100%"
                fallbackSrc={rusunavaLogo}
              />
              <Heading as="h2" size="lg">
                Join Rusunawa PNJ
              </Heading>
              <Text fontSize="md">
                Register now to book your perfect accommodation at Politeknik Negeri Jakarta's dormitory.
                Enjoy comfortable rooms, great amenities, and a supportive community.
              </Text>
              
              <VStack align="start" spacing={3} mt={4}>
                <HStack>
                  <CheckCircleIcon color="green.500" />
                  <Text>Verified student-friendly accommodation</Text>
                </HStack>
                <HStack>
                  <CheckCircleIcon color="green.500" />
                  <Text>Secure payment options</Text>
                </HStack>
                <HStack>
                  <CheckCircleIcon color="green.500" />
                  <Text>24/7 support and security</Text>
                </HStack>
                <HStack>
                  <CheckCircleIcon color="green.500" />
                  <Text>Prime location near campus facilities</Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>
          
          {/* Right side - Registration form */}
          <Box 
            flexBasis={{ base: '100%', md: '60%', lg: '50%' }}
            bg={cardBg}
            p={8}
            borderRadius="lg"
            boxShadow="md"
            as="form"
            onSubmit={handleSubmit}
          >
            <VStack spacing={8} align="stretch">
              <Box>
                <Heading textAlign="center" mb={2}>Register</Heading>
                <Text textAlign="center" color="gray.500">
                  Create your Rusunawa PNJ account
                </Text>
              </Box>
              
              {/* Stepper */}
              <Stepper index={activeStep} colorScheme="brand" mb={8}>
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepIndicator>
                      <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                      />
                    </StepIndicator>
                    <Box flexShrink="0">
                      <StepTitle>{step.title}</StepTitle>
                      <StepDescription>{step.description}</StepDescription>
                    </Box>
                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>
              
              {/* Step content */}
              {renderStepContent()}
              
              {/* Navigation buttons */}
              <HStack justifyContent={activeStep > 0 ? 'space-between' : 'flex-end'} mt={4}>
                {activeStep > 0 && (
                  <Button 
                    onClick={handlePrevStep}
                    variant="outline"
                    colorScheme="brand"
                    isDisabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
                {activeStep < steps.length - 1 ? (
                  <Button 
                    onClick={handleNextStep}
                    colorScheme="brand"
                  >
                    Next
                  </Button>
                ) : !registrationComplete && (
                  <Button 
                    type="submit"
                    colorScheme="brand"
                    isLoading={isSubmitting}
                    loadingText="Submitting"
                  >
                    Register
                  </Button>
                )}
              </HStack>
              
              {/* Sign in link */}
              {!registrationComplete && (
                <Text mt={4} textAlign="center">
                  Already have an account?{' '}
                  <Link as={RouterLink} to="/tenant/login" color="brand.500" fontWeight="semibold">
                    Sign In
                  </Link>
                </Text>
              )}
            </VStack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Register;
