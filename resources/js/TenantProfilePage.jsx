import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  VStack,
  HStack,
  Heading,
  Text,
  Avatar,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  Icon,
  Badge,
  useToast,
  Skeleton,
  Button
} from '@chakra-ui/react';
import {
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaIdCard,
  FaEdit
} from 'react-icons/fa';
import axios from 'axios';

const TenantProfilePage = () => {
  const toast = useToast();
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First try to get tenant data from localStorage for immediate display
    try {
      const tenantDataStr = localStorage.getItem('tenant_data');
      if (tenantDataStr) {
        const parsedData = JSON.parse(tenantDataStr);
        setTenant(parsedData);
        setIsLoading(false);
        console.log("Loaded tenant data from localStorage:", parsedData.name);
      }
    } catch (e) {
      console.error("Error loading tenant data from localStorage:", e);
    }

    // Then fetch fresh data from the Golang API directly
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('tenant_token');
        
        if (!token) {
          console.error("No auth token found in localStorage");
          return;
        }
        
        // Make direct API call to Golang backend
        const response = await axios({
          method: 'GET',
          url: 'http://localhost:8001/v1/tenant/profile',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log("API response:", response.data);
        
        // Check if response contains tenant data
        if (response.data && response.data.tenant) {
          const profileData = response.data.tenant;
          setTenant(profileData);
          
          // Save updated data to localStorage
          localStorage.setItem('tenant_data', JSON.stringify(profileData));
        }
      } catch (error) {
        console.error("Error fetching profile from API:", error);
        
        // Check for authorization error
        if (error.response && error.response.status === 401) {
          toast({
            title: "Authentication error",
            description: "Your session has expired. Please log in again.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          
          // Clear invalid token and redirect to login
          localStorage.removeItem('tenant_token');
          localStorage.removeItem('tenant_data');
          
          setTimeout(() => {
            window.location.href = '/tenant/login?redirect=/tenant/profile';
          }, 2000);
        } else {
          toast({
            title: "Error loading profile",
            description: "Unable to fetch your profile information.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [toast]);

  const renderGenderLabel = (code) => {
    if (code === 'L') return 'Male';
    if (code === 'P') return 'Female';
    return code;
  };
  
  const renderTenantType = (type) => {
    if (!type) return 'Unknown';
    
    if (typeof type === 'string') {
      if (type.toLowerCase() === 'mahasiswa') return 'Student';
      if (type.toLowerCase() === 'non_mahasiswa' || type.toLowerCase() === 'non-mahasiswa') return 'Non-Student';
      return type;
    }
    
    if (typeof type === 'object' && type !== null && type.name) {
      if (type.name.toLowerCase() === 'mahasiswa') return 'Student';
      if (type.name.toLowerCase() === 'non_mahasiswa' || type.name.toLowerCase() === 'non-mahasiswa') return 'Non-Student';
      return type.name;
    }
    
    return 'Unknown';
  };

  return (
    <Container maxW="6xl" py={10}>
      <Card shadow="md" mb={8}>
        <CardBody>
          <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={6}>
            <Box>
              <Avatar 
                size="2xl" 
                src={tenant?.profile_image} 
                name={tenant?.name || "Tenant"} 
                bg="brand.500"
              />
            </Box>
            
            <VStack align="flex-start" spacing={2} flex={1}>
              <Flex width="100%" justify="space-between" align="center">
                <Heading size="lg">
                  {isLoading ? <Skeleton height="40px" width="200px" /> : tenant?.name}
                </Heading>
                
                <Button
                  leftIcon={<FaEdit />}
                  colorScheme="blue"
                  variant="outline"
                  size="sm"
                  onClick={() => toast({
                    title: "Edit Profile",
                    description: "Profile editing feature is coming soon!",
                    status: "info",
                    duration: 3000,
                  })}
                >
                  Edit Profile
                </Button>
              </Flex>
              
              <HStack>
                <Badge colorScheme="green">
                  {isLoading ? <Skeleton height="20px" width="80px" /> : renderTenantType(tenant?.tenant?.tenantType || tenant?.tenantType)}
                </Badge>
                <Badge colorScheme={tenant?.gender === 'L' ? 'blue' : 'pink'}>
                  {isLoading ? <Skeleton height="20px" width="60px" /> : renderGenderLabel(tenant?.gender)}
                </Badge>
              </HStack>
              
              <Flex wrap="wrap" gap={4} mt={2}>
                <HStack>
                  <Icon as={FaEnvelope} color="gray.500" />
                  <Text>{isLoading ? <Skeleton height="20px" width="150px" /> : tenant?.email}</Text>
                </HStack>
                <HStack>
                  <Icon as={FaPhone} color="gray.500" />
                  <Text>{isLoading ? <Skeleton height="20px" width="120px" /> : tenant?.phone}</Text>
                </HStack>
              </Flex>
              
              <HStack mt={1}>
                <Icon as={FaMapMarkerAlt} color="gray.500" />
                <Text>{isLoading ? <Skeleton height="20px" width="250px" /> : tenant?.address}</Text>
              </HStack>
              
              {(tenant?.nim || (tenant?.tenant?.nim)) && (
                <HStack>
                  <Icon as={FaIdCard} color="gray.500" />
                  <Text>Student ID (NIM): {isLoading ? <Skeleton height="20px" width="100px" display="inline-block" /> : (tenant?.nim || tenant?.tenant?.nim)}</Text>
                </HStack>
              )}
            </VStack>
          </Flex>
        </CardBody>
      </Card>
      
      <Tabs colorScheme="brand" variant="enclosed">
        <TabList>
          <Tab>Profile Information</Tab>
          <Tab>Booking History</Tab>
          <Tab>Location</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
              <GridItem>
                <Card shadow="md" height="100%">
                  <CardHeader>
                    <Heading size="md">Personal Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500">Full Name</Text>
                        <Text>{isLoading ? <Skeleton height="20px" /> : tenant?.name}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500">Email</Text>
                        <Text>{isLoading ? <Skeleton height="20px" /> : tenant?.email}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500">Phone</Text>
                        <Text>{isLoading ? <Skeleton height="20px" /> : tenant?.phone}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500">Address</Text>
                        <Text>{isLoading ? <Skeleton height="20px" /> : tenant?.address}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500">Gender</Text>
                        <Text>{isLoading ? <Skeleton height="20px" width="60px" /> : renderGenderLabel(tenant?.gender)}</Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem>
                <Card shadow="md" height="100%">
                  <CardHeader>
                    <Heading size="md">Academic Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500">Tenant Type</Text>
                        <Text>
                          {isLoading ? <Skeleton height="20px" /> : 
                            renderTenantType(tenant?.tenant?.tenantType || tenant?.tenantType)}
                        </Text>
                      </Box>
                      
                      {((tenant?.tenant?.tenantType && tenant?.tenant?.tenantType.name === 'mahasiswa') || 
                        (tenant?.tenantType && 
                          (tenant?.tenantType === 'mahasiswa' || 
                          (typeof tenant?.tenantType === 'object' && tenant?.tenantType?.name === 'mahasiswa')))) && (
                        <Box>
                          <Text fontWeight="bold" fontSize="sm" color="gray.500">Student ID (NIM)</Text>
                          <Text>{isLoading ? <Skeleton height="20px" /> : (tenant?.nim || tenant?.tenant?.nim || '-')}</Text>
                        </Box>
                      )}
                      
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500">Joined Date</Text>
                        <Text>
                          {isLoading ? <Skeleton height="20px" /> : 
                            (tenant?.created_at ? new Date(tenant.created_at).toLocaleDateString() : '-')}
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </TabPanel>
          
          <TabPanel>
            <Card shadow="md">
              <CardHeader>
                <Heading size="md">Recent Bookings</Heading>
              </CardHeader>
              <CardBody>
                <Text color="gray.500">No recent bookings found.</Text>
                <Button 
                  mt={4} 
                  colorScheme="blue" 
                  as="a" 
                  href="/tenant/bookings"
                >
                  View All Bookings
                </Button>
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel>
            <Card shadow="md">
              <CardHeader>
                <Heading size="md">Location Information</Heading>
              </CardHeader>
              <CardBody>
                {tenant && tenant.home_latitude && tenant.home_longitude ? (
                  <Box h="400px" position="relative" bg="gray.100" borderRadius="md">
                    <Text p={4}>Map will be displayed here</Text>
                    <Box position="absolute" top={2} left={2} bg="white" p={2} borderRadius="md" shadow="md">
                      <Text fontWeight="bold">Home Location</Text>
                      <Text fontSize="sm">Latitude: {tenant.home_latitude}</Text>
                      <Text fontSize="sm">Longitude: {tenant.home_longitude}</Text>
                    </Box>
                  </Box>
                ) : (
                  <Box 
                    h="400px" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                    bg="gray.100"
                    borderRadius="md"
                  >
                    <Text color="gray.500">No location data available</Text>
                  </Box>
                )}
                
                <Text mt={4} fontSize="sm" color="gray.500">
                  Your home location is used to calculate distance to the rusunawa facility.
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default TenantProfilePage;
