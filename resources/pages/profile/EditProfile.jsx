import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Avatar,
  Card,
  CardBody,
  SimpleGrid,
  Flex,
  Icon
} from '@chakra-ui/react';
import { FaUser, FaArrowLeft, FaSave } from 'react-icons/fa';
import TenantLayout from '../../components/layout/TenantLayout';
import { useTenantAuth } from '../../context/tenantAuthContext';
import tenantService from '../../services/tenantService';
import { validateName, validatePhone, validateAddress } from '../../utils/validationUtils';

const EditProfile = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { tenant, refreshTenant } = useTenantAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        phone: tenant.phone || '',
        address: tenant.address || ''
      });
      setLoading(false);
    }
  }, [tenant]);

  const validateForm = () => {
    const newErrors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    const addressError = validateAddress(formData.address);
    if (addressError) newErrors.address = addressError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Call API to update profile
      await tenantService.updateProfile(formData);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      // Refresh tenant data
      await refreshTenant();
      
      // Navigate back to profile page
      navigate('/tenant/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile information.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <TenantLayout>
      <Container maxW="container.md" py={8}>
        <Button 
          leftIcon={<FaArrowLeft />} 
          mb={6} 
          onClick={() => navigate('/tenant/profile')}
        >
          Back to Profile
        </Button>
        
        <Heading size="xl" mb={6} display="flex" alignItems="center">
          <Icon as={FaUser} mr={3} color="brand.500" />
          Edit Profile
        </Heading>
        
        {loading ? (
          <Flex justify="center" my={10}>
            <Spinner size="xl" color="brand.500" />
          </Flex>
        ) : (
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box textAlign="center">
                      <Avatar 
                        size="2xl" 
                        name={tenant?.name || tenant?.user?.fullName} 
                        src={tenant?.avatar} 
                        mb={4}
                      />
                      <Text fontWeight="medium" fontSize="lg">
                        {tenant?.user?.email}
                      </Text>
                      <Text color="gray.500">
                        Account ID: {tenant?.tenant_id}
                      </Text>
                    </Box>
                    
                    <VStack spacing={4} align="stretch">
                      <FormControl isInvalid={errors.name}>
                        <FormLabel>Full Name</FormLabel>
                        <Input 
                          name="name" 
                          value={formData.name} 
                          onChange={handleChange}
                        />
                        <FormErrorMessage>{errors.name}</FormErrorMessage>
                      </FormControl>
                      
                      <FormControl isInvalid={errors.phone}>
                        <FormLabel>Phone Number</FormLabel>
                        <Input 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleChange}
                        />
                        <FormErrorMessage>{errors.phone}</FormErrorMessage>
                      </FormControl>
                    </VStack>
                  </SimpleGrid>
                  
                  <FormControl isInvalid={errors.address}>
                    <FormLabel>Address</FormLabel>
                    <Input 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange}
                    />
                    <FormErrorMessage>{errors.address}</FormErrorMessage>
                  </FormControl>
                  
                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    leftIcon={<FaSave />}
                    isLoading={saving}
                    loadingText="Saving..."
                  >
                    Save Changes
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>
        )}
      </Container>
    </TenantLayout>
  );
};

export default EditProfile;
