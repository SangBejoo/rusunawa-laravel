import React from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Grid,
  GridItem,
  Card,
  CardBody,
  Icon,
  useColorModeValue,
  Image,
  Badge,
  Stack,
  Divider,
  SimpleGrid
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiWifi,
  FiTv,
  FiUsers,
  FiMapPin,
  FiStar,
  FiCheck,
  FiPhone,
  FiMail
} from 'react-icons/fi';

const TenantLanding = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, cyan.50)',
    'linear(to-br, gray.900, blue.900)'
  );

  const features = [
    {
      icon: FiHome,
      title: 'Modern Rooms',
      description: 'Clean, comfortable, and fully furnished rooms with modern amenities'
    },
    {
      icon: FiWifi,
      title: 'Free WiFi',
      description: 'High-speed internet connection available in all rooms and common areas'
    },
    {
      icon: FiTv,
      title: 'Entertainment',
      description: 'TV and entertainment facilities in rooms and common areas'
    },
    {
      icon: FiUsers,
      title: 'Community',
      description: 'Join a vibrant community of residents and make new friends'
    }
  ];

  const roomTypes = [
    {
      name: 'Daily Room',
      price: 'Rp 100,000',
      period: '/day',
      features: ['Shared room', 'Shared bathroom', 'WiFi included', 'Study desk'],
      popular: false
    },
    {
      name: 'Monthly Room',
      price: 'Rp 2,500,000',
      period: '/month',
      features: ['Shared room', 'Private bathroom', 'WiFi included', 'Study desk', 'Wardrobe'],
      popular: true
    },
    {
      name: 'VIP Room',
      price: 'Rp 3,500,000',
      period: '/month',
      features: ['Private room', 'Private bathroom', 'WiFi included', 'Study desk', 'Air conditioning', 'Mini fridge'],
      popular: false
    }
  ];

  return (
    <Box minH="100vh" bg={bgGradient}>
      {/* Header */}
      <Box bg={bgColor} shadow="sm" position="sticky" top={0} zIndex={1000}>
        <Container maxW="7xl" py={4}>
          <HStack justify="space-between">
            <Heading size="lg" color="blue.600">
              Rusunawa
            </Heading>
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/tenant/login"
                variant="ghost"
                colorScheme="blue"
              >
                Login
              </Button>
              <Button
                as={RouterLink}
                to="/tenant/register"
                colorScheme="blue"
              >
                Register
              </Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={8} textAlign="center">
          <Heading
            size="2xl"
            bgGradient="linear(to-r, blue.600, cyan.500)"
            bgClip="text"
            fontWeight="extrabold"
          >
            Find Your Perfect Home Away From Home
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="2xl">
            Discover comfortable, affordable, and modern accommodation 
            designed for students and young professionals
          </Text>
          <HStack spacing={4}>
            <Button
              size="lg"
              colorScheme="blue"
              onClick={() => navigate('/tenant/rooms')}
              leftIcon={<FiHome />}
            >
              Browse Rooms
            </Button>
            <Button
              size="lg"
              variant="outline"
              colorScheme="blue"
              onClick={() => navigate('/tenant/register')}
            >
              Get Started
            </Button>
          </HStack>
        </VStack>
      </Container>

      {/* Features Section */}
      <Container maxW="7xl" py={16}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl">Why Choose Rusunawa?</Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              We provide more than just a place to stay - we create a community 
              where you can thrive and succeed
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
            {features.map((feature, index) => (
              <Card key={index} bg={bgColor} shadow="md" _hover={{ transform: 'translateY(-4px)' }} transition="all 0.2s">
                <CardBody textAlign="center">
                  <VStack spacing={4}>
                    <Icon as={feature.icon} boxSize={12} color="blue.500" />
                    <Heading size="md">{feature.title}</Heading>
                    <Text color="gray.600">{feature.description}</Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Room Types Section */}
      <Container maxW="7xl" py={16}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl">Choose Your Room Type</Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Select from our variety of room options designed to fit your budget and lifestyle
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
            {roomTypes.map((room, index) => (
              <Card key={index} bg={bgColor} shadow="lg" position="relative" _hover={{ transform: 'translateY(-4px)' }} transition="all 0.2s">
                {room.popular && (
                  <Badge
                    colorScheme="blue"
                    position="absolute"
                    top={-2}
                    left="50%"
                    transform="translateX(-50%)"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    Most Popular
                  </Badge>
                )}
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <VStack spacing={2} textAlign="center">
                      <Heading size="lg">{room.name}</Heading>
                      <HStack spacing={1} justify="center">
                        <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                          {room.price}
                        </Text>
                        <Text color="gray.500">{room.period}</Text>
                      </HStack>
                    </VStack>

                    <Divider />

                    <VStack spacing={3} align="stretch">
                      {room.features.map((feature, featureIndex) => (
                        <HStack key={featureIndex}>
                          <Icon as={FiCheck} color="green.500" />
                          <Text>{feature}</Text>
                        </HStack>
                      ))}
                    </VStack>

                    <Button
                      colorScheme={room.popular ? "blue" : "gray"}
                      variant={room.popular ? "solid" : "outline"}
                      size="lg"
                      onClick={() => navigate('/tenant/rooms')}
                    >
                      View Details
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* CTA Section */}
      <Box bg="blue.600" color="white" py={16}>
        <Container maxW="7xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="xl">Ready to Move In?</Heading>
            <Text fontSize="lg" maxW="2xl">
              Join thousands of students and professionals who have made Rusunawa their home. 
              Start your application today and secure your spot.
            </Text>
            <HStack spacing={4}>
              <Button
                size="lg"
                bg="white"
                color="blue.600"
                _hover={{ bg: 'gray.100' }}
                onClick={() => navigate('/tenant/register')}
              >
                Apply Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                color="white"
                borderColor="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={() => navigate('/tenant/rooms')}
              >
                Browse Rooms
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg={bgColor} py={8} borderTop="1px" borderColor="gray.200">
        <Container maxW="7xl">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8}>
            <GridItem>
              <VStack align="start" spacing={4}>
                <Heading size="md" color="blue.600">Rusunawa</Heading>
                <Text color="gray.600">
                  Modern accommodation solutions for students and young professionals.
                </Text>
              </VStack>
            </GridItem>
            <GridItem>
              <VStack align="start" spacing={4}>
                <Heading size="sm">Quick Links</Heading>
                <VStack align="start" spacing={2}>
                  <Button variant="link" as={RouterLink} to="/tenant/rooms" colorScheme="blue">
                    Browse Rooms
                  </Button>
                  <Button variant="link" as={RouterLink} to="/tenant/login" colorScheme="blue">
                    Login
                  </Button>
                  <Button variant="link" as={RouterLink} to="/tenant/register" colorScheme="blue">
                    Register
                  </Button>
                </VStack>
              </VStack>
            </GridItem>
            <GridItem>
              <VStack align="start" spacing={4}>
                <Heading size="sm">Contact Us</Heading>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Icon as={FiPhone} />
                    <Text>+62 123 456 7890</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiMail} />
                    <Text>info@rusunawa.com</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiMapPin} />
                    <Text>Jakarta, Indonesia</Text>
                  </HStack>
                </VStack>
              </VStack>
            </GridItem>
          </Grid>
          <Divider my={8} />
          <Text textAlign="center" color="gray.600">
            © 2024 Rusunawa. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

export default TenantLanding;
