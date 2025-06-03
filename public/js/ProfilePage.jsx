import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  VStack,
  HStack,
  Flex,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  Divider,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Avatar,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@chakra-ui/react';
import { FiUser, FiMail, FiPhone, FiEdit, FiSave, FiKey } from 'react-icons/fi';
import Navbar from './components/Navbar.jsx';
import axios from 'axios';

const ProfilePage = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    identity_number: '',
    address: '',
    emergency_contact: ''
  });

  // Get profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/tenant/profile');
        if (response.data.success) {
          setProfile(response.data.data || {});
        } else {
          setError(response.data.message || 'Failed to load profile');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await axios.put('/api/tenant/profile', profile);
      if (response.data.success) {
        toast({
          title: 'Profile updated',
          description: 'Your profile information has been updated successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true
        });
      } else {
        toast({
          title: 'Update failed',
          description: response.data.message || 'Failed to update profile',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'An error occurred while updating your profile',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    // Password change logic would go here
    toast({
      title: 'Not implemented',
      description: 'Password change functionality is not yet implemented',
      status: 'info',
      duration: 5000,
      isClosable: true
    });
  };

  if (loading) {
    return (
      <Box>
        <Navbar />
        <Container maxW="container.lg" py={8}>
          <Flex justify="center" align="center" minH="50vh">
            <Spinner size="xl" />
          </Flex>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Navbar />
        <Container maxW="container.lg" py={8}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Error loading profile</Text>
              <Text>{error}</Text>
            </Box>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Container maxW="container.lg" py={8}>
        <Heading as="h1" mb={6}>My Profile</Heading>
        
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab><Icon as={FiUser} mr={2} /> Personal Information</Tab>
            <Tab><Icon as={FiKey} mr={2} /> Security</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Personal Information</Heading>
                </CardHeader>
                <CardBody>
                  <form onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                      <HStack spacing={4}>
                        <FormControl id="name" isRequired>
                          <FormLabel>Full Name</FormLabel>
                          <Input
                            name="name"
                            value={profile.name || ''}
                            onChange={handleChange}
                            placeholder="Your full name"
                          />
                        </FormControl>
                        
                        <FormControl id="email" isRequired>
                          <FormLabel>Email</FormLabel>
                          <Input
                            name="email"
                            type="email"
                            value={profile.email || ''}
                            onChange={handleChange}
                            placeholder="Your email address"
                          />
                        </FormControl>
                      </HStack>
                      
                      <HStack spacing={4}>
                        <FormControl id="phone">
                          <FormLabel>Phone Number</FormLabel>
                          <Input
                            name="phone"
                            value={profile.phone || ''}
                            onChange={handleChange}
                            placeholder="Your phone number"
                          />
                        </FormControl>
                        
                        <FormControl id="identity_number">
                          <FormLabel>Identity Number (KTP/Passport)</FormLabel>
                          <Input
                            name="identity_number"
                            value={profile.identity_number || ''}
                            onChange={handleChange}
                            placeholder="Your identity number"
                          />
                        </FormControl>
                      </HStack>
                      
                      <FormControl id="address">
                        <FormLabel>Address</FormLabel>
                        <Textarea
                          name="address"
                          value={profile.address || ''}
                          onChange={handleChange}
                          placeholder="Your current address"
                          rows={3}
                        />
                      </FormControl>
                      
                      <FormControl id="emergency_contact">
                        <FormLabel>Emergency Contact</FormLabel>
                        <Input
                          name="emergency_contact"
                          value={profile.emergency_contact || ''}
                          onChange={handleChange}
                          placeholder="Emergency contact name and number"
                        />
                      </FormControl>
                      
                      <Button
                        type="submit"
                        colorScheme="blue"
                        leftIcon={<FiSave />}
                        isLoading={saving}
                        loadingText="Saving..."
                      >
                        Save Changes
                      </Button>
                    </Stack>
                  </form>
                </CardBody>
              </Card>
            </TabPanel>
            
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Change Password</Heading>
                </CardHeader>
                <CardBody>
                  <form onSubmit={handlePasswordChange}>
                    <Stack spacing={4}>
                      <FormControl id="current_password" isRequired>
                        <FormLabel>Current Password</FormLabel>
                        <Input type="password" placeholder="Enter your current password" />
                      </FormControl>
                      
                      <FormControl id="new_password" isRequired>
                        <FormLabel>New Password</FormLabel>
                        <Input type="password" placeholder="Enter your new password" />
                      </FormControl>
                      
                      <FormControl id="confirm_password" isRequired>
                        <FormLabel>Confirm New Password</FormLabel>
                        <Input type="password" placeholder="Confirm your new password" />
                      </FormControl>
                      
                      <Button
                        type="submit"
                        colorScheme="blue"
                        leftIcon={<FiKey />}
                      >
                        Change Password
                      </Button>
                    </Stack>
                  </form>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default ProfilePage;
