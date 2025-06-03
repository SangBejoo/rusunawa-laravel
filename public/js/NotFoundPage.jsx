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
} from '@chakra-ui/react';

import Footer from './components/Footer.jsx';

export default function NotFoundPage() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Box flex="1">
        <Container maxW="container.xl" py={20}>
          <Center>
            <VStack spacing={8} textAlign="center">
              <Heading fontSize="9xl" color="brand.500">404</Heading>
              <Image 
                src="https://cdn-icons-png.flaticon.com/512/5107/5107293.png"
                alt="Page Not Found"
                boxSize="200px"
                opacity="0.7"
              />
              <Heading as="h2" size="xl" mt={6} mb={2}>
                Page Not Found
              </Heading>
              <Text color="gray.500" fontSize="lg" maxW="md">
                Oops! The page you're looking for doesn't exist or has been moved.
              </Text>
              <Button
                colorScheme="blue"
                bgGradient="linear(to-r, brand.400, brand.500, brand.600)"
                color="white"
                variant="solid"
                size="lg"
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
