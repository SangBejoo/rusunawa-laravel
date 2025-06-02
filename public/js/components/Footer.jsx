import {
  Box,
  Container,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  Heading,
} from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      mt="auto"
      borderTop={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.900')}>
      <Container as={Stack} maxW={'container.xl'} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align={'flex-start'}>
            <Heading as="h5" size="sm" mb={2}>Rusunawa</Heading>
            <Link href={'/'}>Home</Link>
            <Link href={'/about'}>About Us</Link>
            <Link href={'/contact'}>Contact</Link>
            <Link href={'/faq'}>FAQ</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <Heading as="h5" size="sm" mb={2}>Accommodations</Heading>
            <Link href={'/rooms'}>Room Types</Link>
            <Link href={'/facilities'}>Facilities</Link>
            <Link href={'/gallery'}>Gallery</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <Heading as="h5" size="sm" mb={2}>For Tenants</Heading>
            <Link href={'/register'}>Sign Up</Link>
            <Link href={'/tenant/login'}>Login</Link>
            <Link href={'/policies'}>Policies</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <Heading as="h5" size="sm" mb={2}>Connect With Us</Heading>
            <Link href={'#'}>Facebook</Link>
            <Link href={'#'}>Twitter</Link>
            <Link href={'#'}>Instagram</Link>
            <Link href={'#'}>LinkedIn</Link>
          </Stack>
        </SimpleGrid>
      </Container>
      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.700')}>
        <Container
          as={Stack}
          maxW={'container.xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ md: 'space-between' }}
          align={{ md: 'center' }}>
          <Text>© 2023 Rusunawa. All rights reserved</Text>
          <Stack direction={'row'} spacing={6}>
            <Link href={'#'}>Privacy Policy</Link>
            <Link href={'#'}>Terms of Service</Link>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
