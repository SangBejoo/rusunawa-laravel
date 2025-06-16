import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  Radio,
  RadioGroup,
  Stack,
  Icon,
  Divider,
  Image,
  Flex,
  Progress,
  Badge
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaTools,
  FaHome,
  FaWater,
  FaBolt,
  FaSnowflake,
  FaBroom,
  FaUpload,
  FaImage,
  FaTimes,
  FaCamera
} from 'react-icons/fa';
import TenantLayout from '../../components/layout/TenantLayout';
import { useTenantAuth } from '../../context/tenantAuthContext';
import axios from 'axios';
import { API_URL, getAuthHeader } from '../../utils/apiConfig';
import issueService from '../../services/issueService'; // Make sure this path is correct

const ReportIssuePage = () => {
  const { tenant } = useTenantAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: '',
    contactPhone: ''
  });
  // Image state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Form validation
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'electrical', label: 'Electrical', icon: FaBolt, color: 'yellow' },
    { value: 'plumbing', label: 'Plumbing', icon: FaWater, color: 'blue' },
    { value: 'hvac', label: 'Air Conditioning/Heating', icon: FaSnowflake, color: 'cyan' },
    { value: 'cleaning', label: 'Cleaning', icon: FaBroom, color: 'green' },
    { value: 'maintenance', label: 'General Maintenance', icon: FaTools, color: 'orange' },
    { value: 'furniture', label: 'Furniture', icon: FaHome, color: 'purple' },
    { value: 'other', label: 'Other', icon: FaExclamationTriangle, color: 'gray' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', description: 'Can wait a few days', color: 'green' },
    { value: 'medium', label: 'Medium Priority', description: 'Should be fixed soon', color: 'yellow' },
    { value: 'high', label: 'High Priority', description: 'Needs immediate attention', color: 'red' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only JPG, PNG, and WEBP formats are supported',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }    // Set file data
    setSelectedImage(file);
    
    // Create image preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };
  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      if (!validateForm()) {
      toast({
        title: 'Please fix the errors in the form',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if tenant data is available
    if (!tenant || (!tenant.tenantId && !tenant.id)) {
      toast({
        title: 'Authentication Error',
        description: 'Unable to get tenant information. Please try logging in again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);    try {      // Log tenant object for debugging
      console.log('Tenant object structure:', tenant);
      console.log('Tenant ID:', tenant?.tenantId || tenant?.id);
      
      // Prepare issue data according to API specification
      const issueData = {
        tenantId: tenant?.tenantId || tenant?.id || 0,
        reportedByUserId: tenant?.userId || tenant?.id || 0,
        description: formData.description
      };

      // Make API request using issueService with file upload
      console.log('Sending issue data:', issueData);
      console.log('Selected image file:', selectedImage);
      const response = await issueService.reportIssue(issueData, selectedImage);
      
      toast({
        title: 'Issue Reported Successfully',
        description: 'Your maintenance request has been submitted. We will respond within 24 hours.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        location: '',
        contactPhone: ''
      });
      removeImage();

      // Navigate back to issues page
      setTimeout(() => {
        navigate('/tenant/issues');
      }, 2000);} catch (error) {
      console.error('Error submitting issue:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('API Response Error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      toast({
        title: 'Error Submitting Issue',
        description: error.response?.data?.message || 'Failed to submit your issue. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TenantLayout>
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <HStack mb={4}>
              <Button
                leftIcon={<FaArrowLeft />}
                variant="ghost"
                onClick={() => navigate('/tenant/issues')}
              >
                Back to Issues
              </Button>
            </HStack>
            
            <Heading size="xl" mb={2}>
              Report Maintenance Issue
            </Heading>
            <Text color="gray.600">
              Please provide detailed information about the issue you're experiencing.
              This helps us resolve it faster.
            </Text>
          </Box>

          {/* Information Alert */}
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">Response Time</Text>
              <Text fontSize="sm">
                Emergency issues (water leaks, electrical hazards) will be addressed within 2 hours.
                Other issues typically take 24-48 hours to resolve.
              </Text>
            </Box>
          </Alert>

          {/* Main Form */}
          <form onSubmit={handleSubmit}>
            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
              {/* Left Column - Form Fields */}
              <GridItem>
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Issue Details</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      {/* Title */}
                      <FormControl isRequired isInvalid={errors.title}>
                        <FormLabel>Issue Title</FormLabel>
                        <Input
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Brief description of the issue"
                        />
                        {errors.title && (
                          <Text color="red.500" fontSize="sm">{errors.title}</Text>
                        )}
                      </FormControl>

                      {/* Description */}
                      <FormControl isRequired isInvalid={errors.description}>
                        <FormLabel>Detailed Description</FormLabel>
                        <Textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Please describe the issue in detail. Include when it started, what you've tried, etc."
                          rows={4}
                        />
                        {errors.description && (
                          <Text color="red.500" fontSize="sm">{errors.description}</Text>
                        )}
                      </FormControl>

                      {/* Location */}
                      <FormControl isRequired isInvalid={errors.location}>
                        <FormLabel>Location</FormLabel>
                        <Input
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="e.g., Room 101, Bathroom, Kitchen"
                        />
                        {errors.location && (
                          <Text color="red.500" fontSize="sm">{errors.location}</Text>
                        )}
                      </FormControl>

                      {/* Contact Phone */}
                      <FormControl>
                        <FormLabel>Contact Phone (Optional)</FormLabel>
                        <Input
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          placeholder="Alternative contact number"
                        />
                      </FormControl>
                      
                      {/* Image Upload */}
                      <FormControl>
                        <FormLabel>Upload Image (Optional)</FormLabel>
                        <VStack spacing={4} align="stretch">
                          <HStack>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              display="none"
                              ref={fileInputRef}
                            />
                            <Button 
                              leftIcon={<FaUpload />}
                              onClick={() => fileInputRef.current.click()}
                              colorScheme="blue"
                              variant="outline"
                            >
                              Choose Image
                            </Button>
                            <Text fontSize="sm" color="gray.500">
                              Max size: 10MB (JPG, PNG, WEBP)
                            </Text>
                          </HStack>
                          
                          {imagePreview && (
                            <Box position="relative" mt={4}>
                              <Flex justifyContent="center">
                                <Box maxW="300px" borderWidth="1px" borderRadius="lg" overflow="hidden">
                                  <Image src={imagePreview} alt="Issue image" />
                                  <Button
                                    position="absolute"
                                    top={2}
                                    right={2}
                                    size="sm"
                                    colorScheme="red"
                                    onClick={removeImage}
                                    leftIcon={<FaTimes />}
                                  >
                                    Remove
                                  </Button>
                                  <Text p={2} fontSize="sm" color="gray.500">
                                    {selectedImage ? selectedImage.name : ''}
                                  </Text>
                                </Box>
                              </Flex>
                            </Box>
                          )}
                        </VStack>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>

              {/* Right Column - Category and Priority */}
              <GridItem>
                <VStack spacing={6} align="stretch">
                  {/* Category Selection */}
                  <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Category</Heading>
                    </CardHeader>
                    <CardBody>
                      <FormControl isRequired isInvalid={errors.category}>
                        <VStack spacing={3} align="stretch">
                          {categories.map((cat) => (
                            <Box
                              key={cat.value}
                              p={3}
                              borderWidth="1px"
                              borderRadius="md"
                              borderColor={formData.category === cat.value ? `${cat.color}.300` : borderColor}
                              bg={formData.category === cat.value ? `${cat.color}.50` : 'transparent'}
                              cursor="pointer"
                              onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                              _hover={{ borderColor: `${cat.color}.300` }}
                            >
                              <HStack>
                                <Icon as={cat.icon} color={`${cat.color}.500`} />
                                <Text fontWeight="medium">{cat.label}</Text>
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                        {errors.category && (
                          <Text color="red.500" fontSize="sm" mt={2}>{errors.category}</Text>
                        )}
                      </FormControl>
                    </CardBody>
                  </Card>

                  {/* Priority Selection */}
                  <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Priority Level</Heading>
                    </CardHeader>
                    <CardBody>
                      <FormControl>
                        <RadioGroup
                          value={formData.priority}
                          onChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                        >
                          <Stack spacing={4}>
                            {priorities.map((priority) => (
                              <Box
                                key={priority.value}
                                p={3}
                                borderWidth="1px"
                                borderRadius="md"
                                borderColor={formData.priority === priority.value ? `${priority.color}.300` : borderColor}
                                bg={formData.priority === priority.value ? `${priority.color}.50` : 'transparent'}
                              >
                                <Radio value={priority.value} colorScheme={priority.color}>
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="medium">{priority.label}</Text>
                                    <Text fontSize="sm" color="gray.600">{priority.description}</Text>
                                  </VStack>
                                </Radio>
                              </Box>
                            ))}
                          </Stack>
                        </RadioGroup>
                      </FormControl>
                    </CardBody>
                  </Card>

                  {/* Submit Button with Progress */}
                  <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <VStack spacing={4}>
                        {isSubmitting && (
                          <Box w="100%">
                            <Text fontSize="sm" mb={2}>
                              Uploading... {uploadProgress}%
                            </Text>
                            <Progress value={uploadProgress} colorScheme="blue" />
                          </Box>
                        )}
                        <Button
                          type="submit"
                          colorScheme="blue"
                          size="lg"
                          width="100%"
                          isLoading={isSubmitting}
                          loadingText="Submitting..."
                          leftIcon={<FaUpload />}
                        >
                          Submit Issue Report
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </GridItem>
            </Grid>
          </form>
        </VStack>
      </Container>
    </TenantLayout>
  );
};

export default ReportIssuePage;
