import React, { useState, useEffect } from 'react';
import {
  SimpleGrid,
  Box,
  Image,
  Badge,
  Text,
  Flex,
  Button,
  Icon,
  Stack,
  Skeleton,
  useColorModeValue,
  Heading,
  Link,
  useToast,
  HStack,
  Tag,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { StarIcon, RepeatIcon } from '@chakra-ui/icons';
import { FaBed, FaWifi, FaShower, FaUsers, FaAirFreshener, FaDesktop } from 'react-icons/fa';
import axios from 'axios';

// Helper function to get icon for a feature
const getFeatureIcon = (featureName) => {
  switch(featureName) {
    case 'AC': 
      return FaAirFreshener;
    case 'private_bathroom':
    case 'shared_bathroom':
      return FaShower;
    case 'single_bed':
    case 'double_bed':
      return FaBed;
    case 'wifi':
      return FaWifi;
    case 'desk':
      return FaDesktop;
    default:
      return null;
  }
};

// Helper function to format classification name
const formatClassification = (classification) => {
  switch(classification) {
    case 'laki_laki':
      return 'Male Only';
    case 'perempuan':
      return 'Female Only';
    case 'VIP':
      return 'VIP';
    case 'ruang_rapat':
      return 'Meeting Room';
    default:
      return classification.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

// Helper function to format rental type
const formatRentalType = (rentalType) => {
  switch(rentalType) {
    case 'harian':
      return 'Daily';
    case 'bulanan':
      return 'Monthly';
    default:
      return rentalType.replace(/\b\w/g, l => l.toUpperCase());
  }
};

const RoomCard = ({ room }) => {
  const toast = useToast();
  
  // Get primary features to display (limit to 3)
  const primaryFeatures = room.amenities?.slice(0, 3).map(amenity => amenity.feature) || [];
  
  // Generate a placeholder image based on room type
  const getPlaceholderImage = () => {
    switch(room.classification?.name) {
      case 'VIP':
        return 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=500&q=80';
      case 'perempuan':
        return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=500&q=80';
      case 'laki_laki':
        return 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=500&q=80';
      case 'ruang_rapat':
        return 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=500&q=80';
      default:
        return 'https://via.placeholder.com/500x300?text=Room+Image';
    }
  };
  
  const handleViewDetails = () => {
    window.location.href = `/rooms/${room.roomId}`;
  };
  
  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={useColorModeValue('white', 'gray.700')}
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg',
      }}
    >
      <Box onClick={handleViewDetails} cursor="pointer">
        <Image 
          src={room.imageUrl || getPlaceholderImage()} 
          alt={room.name}
          height="200px"
          width="100%"
          objectFit="cover"
        />
      </Box>

      <Box p="6">
        <Box d="flex" alignItems="baseline" mb={2}>
          <Badge borderRadius="full" px="2" colorScheme={
            room.classification?.name === 'VIP' ? 'purple' : 
            room.classification?.name === 'perempuan' ? 'pink' : 
            room.classification?.name === 'laki_laki' ? 'blue' : 'green'
          }>
            {formatClassification(room.classification?.name)}
          </Badge>
          <Badge ml={2} borderRadius="full" px="2" colorScheme="teal">
            {formatRentalType(room.rentalType?.name)}
          </Badge>
        </Box>

        <Box onClick={handleViewDetails} cursor="pointer">
          <Text
            mt="1"
            fontWeight="semibold"
            as="h4"
            lineHeight="tight"
            noOfLines={1}
            fontSize="xl"
            color={useColorModeValue('gray.700', 'white')}
          >
            {room.name}
          </Text>
          
          <Text color="gray.500" fontSize="sm" mt={1} noOfLines={2}>
            {room.description || `${formatClassification(room.classification?.name)} room with ${room.capacity} person capacity`}
          </Text>
          
          <HStack mt={3} spacing={2}>
            <Flex align="center">
              <Icon as={FaUsers} mr={1} color="gray.500" />
              <Text fontSize="sm">{room.capacity} {room.capacity > 1 ? 'Persons' : 'Person'}</Text>
            </Flex>

            {primaryFeatures.map((feature, index) => {
              const FeatureIcon = getFeatureIcon(feature.name);
              if (!FeatureIcon) return null;
              
              return (
                <Flex key={index} align="center">
                  <Icon as={FeatureIcon} mr={1} color="gray.500" />
                  <Text fontSize="sm">{feature.description}</Text>
                </Flex>
              );
            })}
          </HStack>
        </Box>
        
        <Stack mt={4}>
          <Flex justify="space-between" align="center">
            <Text
              color={useColorModeValue('gray.900', 'white')}
              fontWeight="bold"
              fontSize="lg"
            >
              Rp {new Intl.NumberFormat('id-ID').format(room.rate || 0)}
              <Text as="span" fontSize="sm" color="gray.500">
                /{room.rentalType?.name === 'bulanan' ? 'month' : 'day'}
              </Text>
            </Text>
            
            <Button
              onClick={handleViewDetails}
              colorScheme="blue"
              bg="brand.500"
              _hover={{ bg: "brand.400" }}
              size="sm"
            >
              View Details
            </Button>
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
};

const RoomList = ({ initialData }) => {
  const [rooms, setRooms] = useState(initialData?.rooms || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialData?.filters || {});
  const toast = useToast();
  
  useEffect(() => {
    // Only fetch rooms if no initialData was provided
    if (!initialData) {
      fetchRooms();
    }
  }, [filters]);
  
  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let queryParams = '';
      if (Object.keys(filters).length > 0) {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        
        queryParams = `?${params.toString()}`;
      }
      
      console.log('Fetching rooms from:', `/api/rooms${queryParams}`);
      const response = await axios.get(`/api/rooms${queryParams}`);
      
      if (response.data && Array.isArray(response.data.rooms)) {
        setRooms(response.data.rooms);
        
        if (response.data.rooms.length === 0) {
          toast({
            title: "No rooms found",
            description: "Try changing your search criteria",
            status: "info",
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        console.error("Unexpected API response format:", response.data);
        setError("Invalid data format received from server");
        
        // Fall back to mock data in development
        if (process.env.NODE_ENV !== 'production') {
          setRooms(getMockRooms());
          toast({
            title: "Using sample data",
            description: "Showing mock room data for development",
            status: "info",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      
      let errorMessage = "Failed to load rooms. Please try again later.";
      if (error.response && error.response.data && error.response.data.status) {
        errorMessage = error.response.data.status.message || errorMessage;
      }
      
      setError(errorMessage);
      
      // Fall back to mock data in development
      if (process.env.NODE_ENV !== 'production') {
        setRooms(getMockRooms());
        toast({
          title: "Using sample data",
          description: "API error occurred. Showing mock room data for development.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Mock data for development and fallback
  const getMockRooms = () => {
    return [
      {
        roomId: 1,
        name: "Marina Room",
        classificationId: 2,
        rentalTypeId: 1,
        rate: 100000,
        capacity: 4,
        description: "Spacious room with modern amenities",
        classification: {
          classificationId: 2,
          name: "laki_laki"
        },
        rentalType: {
          rentalTypeId: 1,
          name: "harian"
        },
        amenities: [
          {
            roomId: 1,
            featureId: 5,
            quantity: 1,
            feature: {
              featureId: 5,
              name: "double_bed",
              description: "Double bed"
            }
          },
          {
            roomId: 1,
            featureId: 7,
            quantity: 1,
            feature: {
              featureId: 7,
              name: "wifi",
              description: "Wi-Fi access"
            }
          }
        ]
      },
      {
        roomId: 2,
        name: "Ocean View A101",
        classificationId: 1,
        rentalTypeId: 2,
        rate: 350000,
        capacity: 2,
        description: "Twin bed female student room with AC",
        classification: {
          classificationId: 1,
          name: "perempuan"
        },
        rentalType: {
          rentalTypeId: 2,
          name: "bulanan"
        },
        amenities: [
          {
            roomId: 2,
            featureId: 1,
            quantity: 1,
            feature: {
              featureId: 1,
              name: "AC",
              description: "Air Conditioning"
            }
          },
          {
            roomId: 2,
            featureId: 3,
            quantity: 1,
            feature: {
              featureId: 3,
              name: "shared_bathroom",
              description: "Shared bathroom"
            }
          }
        ]
      },
      {
        roomId: 6,
        name: "Premium Suite C101",
        classificationId: 3,
        rentalTypeId: 2,
        rate: 500000,
        capacity: 1,
        description: "Single VIP room with private bathroom and AC",
        classification: {
          classificationId: 3,
          name: "VIP"
        },
        rentalType: {
          rentalTypeId: 2,
          name: "bulanan"
        },
        amenities: [
          {
            roomId: 6,
            featureId: 1,
            quantity: 1,
            feature: {
              featureId: 1,
              name: "AC",
              description: "Air Conditioning"
            }
          },
          {
            roomId: 6,
            featureId: 2,
            quantity: 1,
            feature: {
              featureId: 2,
              name: "private_bathroom",
              description: "Private attached bathroom"
            }
          }
        ]
      }
    ];
  };
  
  const handleRefresh = () => {
    fetchRooms();
  };
  
  // Apply filters from search panel
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  if (error) {
    return (
      <Box>
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Error Loading Rooms</AlertTitle>
            <AlertDescription display="block">
              {error}
            </AlertDescription>
          </Box>
          <Button rightIcon={<RepeatIcon />} onClick={handleRefresh} ml={3}>
            Try Again
          </Button>
        </Alert>
        
        {rooms.length > 0 && (
          <>
            <Heading as="h3" size="md" mb={4}>
              Showing sample rooms:
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
              {rooms.map(room => (
                <RoomCard key={room.roomId} room={room} />
              ))}
            </SimpleGrid>
          </>
        )}
      </Box>
    );
  }
  
  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>
        Available Rooms {rooms.length > 0 && `(${rooms.length})`}
      </Heading>
      
      {loading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {[...Array(6)].map((_, i) => (
            <Box key={i} borderWidth="1px" borderRadius="lg" overflow="hidden">
              <Skeleton height="200px" />
              <Box p="6">
                <Skeleton height="20px" mb={2} />
                <Skeleton height="20px" mb={2} />
                <Skeleton height="20px" mb={2} />
                <Skeleton height="40px" mt={4} />
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {rooms.length > 0 ? (
            rooms.map(room => (
              <RoomCard key={room.roomId} room={room} />
            ))
          ) : (
            <Box textAlign="center" gridColumn="1 / -1">
              <Text fontSize="lg">No rooms match your search criteria.</Text>
            </Box>
          )}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default RoomList;
