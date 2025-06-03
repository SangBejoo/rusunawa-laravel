import React from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Icon,
  Text,
  Stack,
  HStack,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaWifi, FaShieldAlt, FaDollarSign, FaLightbulb, FaUsers, FaLeaf } from 'react-icons/fa';

const Feature = ({ title, text, icon }) => {
  return (
    <Stack
      align={'center'}
      bg={useColorModeValue('white', 'gray.700')}
      p={6}
      rounded={'md'}
      boxShadow={'md'}
      transition="transform 0.3s"
      _hover={{ transform: 'translateY(-5px)' }}
    >
      <Box
        w={16}
        h={16}
        bg={useColorModeValue('brand.500', 'brand.300')}
        color={useColorModeValue('white', 'gray.900')}
        rounded={'full'}
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={5}
      >
        <Icon as={icon} w={8} h={8} />
      </Box>
      <Text fontWeight={600} fontSize="lg" mb={2}>{title}</Text>
      <Text textAlign={'center'} color={useColorModeValue('gray.600', 'gray.300')}>
        {text}
      </Text>
    </Stack>
  );
};

export default function FeaturesSection() {
  return (
    <Box py={16} bg={useColorModeValue('gray.50', 'gray.800')}>
      <Container maxW={'6xl'}>
        <Stack spacing={4} as={Container} maxW={'4xl'} textAlign={'center'} mb={12}>
          <Heading fontSize={'3xl'}>Why Choose Our Rusunawa</Heading>
          <Text color={useColorModeValue('gray.600', 'gray.300')} fontSize={'xl'}>
            Our university housing provides everything you need for a comfortable
            and productive academic life.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          <Feature
            icon={FaWifi}
            title={'High-Speed Internet'}
            text={
              'Stay connected with complimentary high-speed WiFi throughout the building to support your studies and personal needs.'
            }
          />
          <Feature
            icon={FaShieldAlt}
            title={'Secure Access'}
            text={
              '24/7 security with electronic access cards and CCTV monitoring to ensure your safety and peace of mind.'
            }
          />
          <Feature
            icon={FaDollarSign}
            title={'All-Inclusive Pricing'}
            text={
              'No surprise bills - all utilities including electricity, water, and internet are included in your monthly rent.'
            }
          />
          <Feature
            icon={FaLightbulb}
            title={'Study Spaces'}
            text={
              'Dedicated quiet study areas and collaborative workspaces to support your academic success.'
            }
          />
          <Feature
            icon={FaUsers}
            title={'Community Living'}
            text={
              'Built-in community with fellow students and staff, featuring regular social events and activities.'
            }
          />
          <Feature
            icon={FaLeaf}
            title={'Sustainable Living'}
            text={
              'Energy-efficient accommodations with recycling programs and green spaces to promote sustainable living.'
            }
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
};
