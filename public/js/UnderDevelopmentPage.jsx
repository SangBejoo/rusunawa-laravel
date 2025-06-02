import React from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Container,
  VStack,
  Image,
  Center,
  Progress,
} from '@chakra-ui/react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

export default function UnderDevelopmentPage() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Box flex="1">
        <Container maxW="container.xl" py={20}>
          <Center>
            <VStack spacing={8} textAlign="center">
              <Image 
                src="https://cdn-icons-png.flaticon.com/512/2810/2810051.png"
                alt="Under Development"
                boxSize="200px"
                opacity="0.8"
              />
              <Heading as="h1" size="xl">
                Under Development
              </Heading>
              <Text color="gray.500" fontSize="lg" maxW="md">
                We're working hard to bring you this feature! 
                Please check back soon for updates.
              </Text>
              <Box w="full" maxW="md">
                <Text textAlign="left" mb={2} fontWeight="medium">Development Progress</Text>
                <Progress hasStripe value={70} colorScheme="blue" borderRadius="md" />
                <Text textAlign="right" mt={1} fontSize="sm" color="gray.500">70% Complete</Text>
              </Box>
              <Button
                colorScheme="blue"
                bgGradient="linear(to-r, brand.400, brand.500, brand.600)"
                color="white"
                variant="solid"
                as="a"
                href="/"
                mt={4}
                _hover={{
                  bgGradient: "linear(to-r, brand.500, brand.600, brand.700)",
                }}
              >
                Return Home
              </Button>
            </VStack>
          </Center>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
