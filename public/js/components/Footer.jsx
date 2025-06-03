import React from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Link,
  useColorModeValue,
  Image,
  ButtonGroup,
  IconButton,
  Divider,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { FaTwitter, FaYoutube, FaInstagram, FaFacebook, FaHome } from 'react-icons/fa';

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      mt={20}
    >
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }}
          spacing={8}>
          <Stack spacing={6}>
            <Box>
              {/* Replace image with icon */}
              <Flex align="center">
                <Icon as={FaHome} boxSize="24px" color="gray.400" mr={2} />
                <Text fontSize="xl" fontWeight="bold" color="gray.400">
                  Rusunawa
                </Text>
              </Flex>
            </Box>
            <Text fontSize={'sm'}>
              © {new Date().getFullYear()} Rusunawa University Housing. All rights reserved.
            </Text>
            <ButtonGroup variant="ghost" spacing={4}>
              <IconButton
                as="a"
                href="#"
                aria-label="Facebook"
                icon={<FaFacebook fontSize="20px" />}
                _hover={{ bg: 'brand.500', color: 'white' }}
              />
              <IconButton
                as="a"
                href="#"
                aria-label="Twitter"
                icon={<FaTwitter fontSize="20px" />}
                _hover={{ bg: 'brand.500', color: 'white' }}
              />
              <IconButton
                as="a"
                href="#"
                aria-label="Instagram"
                icon={<FaInstagram fontSize="20px" />}
                _hover={{ bg: 'brand.500', color: 'white' }}
              />
              <IconButton
                as="a"
                href="#"
                aria-label="YouTube"
                icon={<FaYoutube fontSize="20px" />}
                _hover={{ bg: 'brand.500', color: 'white' }}
              />
            </ButtonGroup>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <Link href={'/about'}>About</Link>
            <Link href={'/contact'}>Contact</Link>
            <Link href={'/facilities'}>Facilities</Link>
            <Link href={'/careers'}>Careers</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Support</ListHeader>
            <Link href={'/tenant/register'}>Registration</Link>
            <Link href={'/faq'}>FAQ</Link>
            <Link href={'/help'}>Help Center</Link>
            <Link href={'/terms'}>Terms of Service</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Contact</ListHeader>
            <Text>Main Campus Building B</Text>
            <Text>Jl. University No. 123</Text>
            <Text>Jakarta, Indonesia</Text>
            <Text>Email: info@rusunawa.ac.id</Text>
            <Text>Phone: (021) 123-4567</Text>
          </Stack>
        </SimpleGrid>
      </Container>
      
      <Divider />
      
      <Box py={4} textAlign="center">
        <Text fontSize="sm">
          Developed by University IT Team - v1.0.5
        </Text>
      </Box>
    </Box>
  );
}
