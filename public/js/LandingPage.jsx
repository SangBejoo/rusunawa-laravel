import React from 'react';
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  createIcon,
  Flex,
  SimpleGrid,
  Image,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  Card,
  CardBody,
  Center,
} from '@chakra-ui/react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

export default function LandingPage() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Box flex="1">
        {/* Hero Section */}
        <Box position="relative" height="90vh">
          {/* Background image */}
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            backgroundImage="url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
            backgroundSize="cover"
            backgroundPosition="center"
            filter="brightness(0.7)"
            zIndex="-1"
          />
          <Container maxW={'container.xl'} position="relative" height="100%">
            <Stack
              as={Box}
              textAlign={'center'}
              spacing={{ base: 8, md: 14 }}
              pt={{ base: 20, md: 36 }}
              color="white">
              <Heading
                fontWeight={700}
                fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
                lineHeight={'110%'}>
                Find Your Perfect <br />
                <Text as={'span'} color={'brand.400'}>
                  Student Housing
                </Text>
              </Heading>
              <Text fontSize={{ base: 'lg', md: 'xl' }} maxW={'3xl'} mx="auto">
                Affordable, comfortable, and convenient accommodations for students.
                Our rusunawa offers modern amenities, security, and a supportive community.
              </Text>
              <Stack
                direction={'column'}
                spacing={3}
                align={'center'}
                alignSelf={'center'}
                position={'relative'}>
                <Button
                  colorScheme={'green'}
                  bg={'brand.500'}
                  rounded={'full'}
                  px={6}
                  _hover={{
                    bg: 'brand.400',
                  }}
                  as="a"
                  href="/rooms">
                  Find Rooms
                </Button>
                <Button variant={'link'} colorScheme={'blue'} size={'sm'} as="a" href="/about">
                  Learn More
                </Button>
                <Box>
                  <Icon
                    as={Arrow}
                    color={'white'}
                    w={71}
                    position={'absolute'}
                    right={-71}
                    top={'10px'}
                  />
                  <Text
                    fontSize={'lg'}
                    position={'absolute'}
                    right={'-115px'}
                    top={'-15px'}
                    transform={'rotate(10deg)'}>
                    Register now!
                  </Text>
                </Box>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Features Section */}
        <Box py={12} bg={useColorModeValue('white', 'gray.700')}>
          <Container maxW={'container.xl'}>
            <Stack
              textAlign={'center'}
              align={'center'}
              spacing={{ base: 5, md: 8 }}
              py={{ base: 10, md: 12 }}>
              <Heading
                fontWeight={600}
                fontSize={{ base: '2xl', sm: '4xl' }}
                lineHeight={'110%'}>
                Why Choose Our{' '}
                <Text as={'span'} color={'brand.500'}>
                  Rusunawa
                </Text>
              </Heading>
              <Text color={'gray.500'} maxW={'3xl'}>
                Our student housing offers everything you need for a comfortable and productive academic life. From modern facilities to a supportive community, we've got you covered.
              </Text>
            </Stack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mt={10}>
              {features.map((feature) => (
                <Box key={feature.id} p={5} shadow="md" borderWidth="1px" borderRadius="lg">
                  <Center mb={4}>
                    <Icon as={feature.icon} w={10} h={10} color="brand.500" />
                  </Center>
                  <Heading fontSize="xl" mb={2} textAlign="center">{feature.title}</Heading>
                  <Text color={'gray.600'} textAlign="center">{feature.text}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        {/* Room Types Preview */}
        <Box bg={useColorModeValue('gray.50', 'gray.900')} py={12}>
          <Container maxW={'container.xl'}>
            <Stack
              textAlign={'center'}
              align={'center'}
              spacing={{ base: 5, md: 8 }}
              py={{ base: 5, md: 8 }}>
              <Heading
                fontWeight={600}
                fontSize={{ base: '2xl', sm: '4xl' }}
                lineHeight={'110%'}>
                Room Types & {' '}
                <Text as={'span'} color={'brand.500'}>
                  Pricing
                </Text>
              </Heading>
              <Text color={'gray.500'} maxW={'3xl'}>
                Choose from a variety of room options that fit your needs and budget.
                All rooms come with essential furnishings and access to shared facilities.
              </Text>
            </Stack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mt={10}>
              {roomTypes.map((room) => (
                <Card key={room.id} borderRadius="lg" overflow="hidden" variant="outline">
                  <Image
                    src={room.image}
                    alt={room.title}
                    h="200px"
                    objectFit="cover"
                  />
                  <CardBody>
                    <Stack spacing={3}>
                      <Heading size="md">{room.title}</Heading>
                      <Text color={'gray.500'}>{room.description}</Text>
                      <Stack direction="row" justify="space-between" align="center">
                        <Text fontWeight={600} fontSize="xl" color="brand.500">
                          Rp {room.price.toLocaleString('id-ID')} / month
                        </Text>
                        <Button as="a" href={`/rooms/${room.id}`} colorScheme="blue" size="sm" variant="outline">
                          View Details
                        </Button>
                      </Stack>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>

            <Center mt={10}>
              <Button
                as="a"
                href="/rooms"
                rounded={'full'}
                px={6}
                colorScheme={'blue'}
                bg={'brand.500'}
                _hover={{ bg: 'brand.400' }}>
                View All Rooms
              </Button>
            </Center>
          </Container>
        </Box>

        {/* Statistics Section */}
        <Box py={12}>
          <Container maxW={'container.xl'}>
            <Stack
              textAlign={'center'}
              align={'center'}
              spacing={{ base: 5, md: 8 }}
              py={{ base: 5, md: 8 }}>
              <Heading
                fontWeight={600}
                fontSize={{ base: '2xl', sm: '4xl' }}
                lineHeight={'110%'}>
                Our Rusunawa in {' '}
                <Text as={'span'} color={'brand.500'}>
                  Numbers
                </Text>
              </Heading>
            </Stack>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={5}>
              {stats.map((stat) => (
                <Stat
                  key={stat.id}
                  px={{ base: 2, md: 4 }}
                  py={5}
                  shadow={'xl'}
                  border={'1px solid'}
                  borderColor={useColorModeValue('gray.200', 'gray.500')}
                  rounded={'lg'}>
                  <Flex justifyContent={'center'}>
                    <Box
                      my={'auto'}
                      color={useColorModeValue('gray.800', 'gray.200')}
                      alignContent={'center'}>
                      <StatLabel fontWeight={'medium'} isTruncated>
                        {stat.title}
                      </StatLabel>
                      <StatNumber fontSize={'2xl'} fontWeight={'bold'}>
                        {stat.value}
                      </StatNumber>
                      <Text fontSize={'sm'} mt={2}>{stat.description}</Text>
                    </Box>
                  </Flex>
                </Stat>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        {/* Call to Action */}
        <Box bg={useColorModeValue('brand.500', 'brand.600')} color="white" py={10}>
          <Container maxW={'container.xl'}>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} align="center" justify="space-between">
              <VStack align={{ base: 'center', md: 'start'}} spacing={2} mb={{ base: 4, md: 0 }}>
                <Heading size="lg">Ready to join our community?</Heading>
                <Text>Register now to apply for a room at our rusunawa!</Text>
              </VStack>
              <Button
                as="a"
                href="/register"
                rounded={'full'}
                px={6}
                colorScheme="whiteAlpha"
                _hover={{
                  bg: 'whiteAlpha.500',
                }}>
                Register Today
              </Button>
            </Stack>
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}

// Arrow icon for hero section
const Arrow = createIcon({
  displayName: 'Arrow',
  viewBox: '0 0 72 24',
  path: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.600904 7.08166C0.764293 6.8879 1.01492 6.79004 1.26654 6.82177C2.83216 7.01918 5.20326 7.24581 7.54543 7.23964C9.92491 7.23338 12.1351 6.98464 13.4704 6.32142C13.84 6.13785 14.2885 6.28805 14.4722 6.65692C14.6559 7.02578 14.5052 7.47362 14.1356 7.6572C12.4625 8.48822 9.94063 8.72541 7.54852 8.7317C5.67514 8.73663 3.79547 8.5985 2.29921 8.44247C2.80955 9.59638 3.50943 10.6396 4.24665 11.7384C4.39435 11.9585 4.54354 12.1809 4.69301 12.4068C5.79543 14.0733 6.88128 15.8995 7.1179 18.2636C7.15893 18.6735 6.85928 19.0393 6.4486 19.0805C6.03792 19.1217 5.67174 18.8227 5.6307 18.4128C5.43271 16.4346 4.52957 14.868 3.4457 13.2296C3.3058 13.0181 3.16221 12.8046 3.01684 12.5885C2.05899 11.1646 1.02372 9.62564 0.457909 7.78069C0.383671 7.53862 0.437515 7.27541 0.600904 7.08166ZM5.52039 10.2248C5.77662 9.90161 6.24663 9.84687 6.57018 10.1025C16.4834 17.9344 29.9158 22.4064 42.0781 21.4773C54.1988 20.5514 65.0339 14.2748 69.9746 0.584299C70.1145 0.196597 70.5427 -0.0046455 70.931 0.134813C71.3193 0.274276 71.5206 0.70162 71.3807 1.08932C66.2105 15.4159 54.8056 22.0014 42.1913 22.965C29.6185 23.9254 15.8207 19.3142 5.64226 11.2727C5.31871 11.0171 5.26415 10.5479 5.52039 10.2248Z"
      fill="currentColor"
    />
  ),
});

// Features data
const features = [
  {
    id: 1,
    title: 'Convenient Location',
    text: 'Located near campus with easy access to public transportation, shops, and other essential services.',
    icon: LocationIcon,
  },
  {
    id: 2,
    title: 'Modern Facilities',
    text: 'Enjoy fast WiFi, study rooms, common areas, laundry services, and 24/7 security.',
    icon: FacilityIcon,
  },
  {
    id: 3,
    title: 'Community Living',
    text: 'Connect with fellow students, participate in events, and build a supportive network.',
    icon: CommunityIcon,
  },
];

// Room types data
const roomTypes = [
  {
    id: 1,
    title: 'Standard Single Room',
    description: 'Perfect for students who prefer privacy. Includes a bed, desk, chair, and storage space.',
    price: 1000000,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
  },
  {
    id: 2,
    title: 'Premium Single Room',
    description: 'Upgraded single room with additional space, improved furnishings, and better views.',
    price: 1500000,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80',
  },
  {
    id: 3,
    title: 'Shared Room',
    description: 'Economical option with two beds, shared desk area, and storage for each resident.',
    price: 750000,
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
];

// Stats data
const stats = [
  {
    id: 1,
    title: 'Total Rooms',
    value: '500+',
    description: 'Rooms available for students'
  },
  {
    id: 2,
    title: 'Happy Residents',
    value: '2,000+',
    description: 'Students housed over the years'
  },
  {
    id: 3,
    title: 'Occupancy Rate',
    value: '95%',
    description: 'Rooms currently occupied'
  },
  {
    id: 4,
    title: 'Satisfaction Rate',
    value: '4.8/5',
    description: 'Based on resident reviews'
  }
];

// Icon components
function LocationIcon(props) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      />
    </Icon>
  );
}

function FacilityIcon(props) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M8 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H8zm0 2h8v16H8V4zm1 7h6v2H9v-2zm0-3h6v2H9V8zm0 6h6v2H9v-2z"
      />
    </Icon>
  );
}

function CommunityIcon(props) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
      />
    </Icon>
  );
}
