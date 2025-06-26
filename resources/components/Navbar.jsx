import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
  Image
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
  CloseIcon, 
  ChevronDownIcon, 
  ChevronRightIcon, 
  BellIcon
} from '@chakra-ui/icons';
import { useTenantAuth } from '../context/tenantAuthContext';
import logo from '../../assets/images/rusunawa-logo.png';
import { FaMoneyBillWave, FaFileInvoice } from 'react-icons/fa';

const NavBar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { isAuthenticated, tenant, logout } = useTenantAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  // Notifications state (could be connected to a real notifications system)
  const [notifications] = useState([
    { id: 1, message: 'Your booking has been approved', isRead: false },
    { id: 2, message: 'Payment received for your latest booking', isRead: true }
  ]);
  
  // Check if there are unread notifications
  const hasUnreadNotifications = notifications.some(n => !n.isRead);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/tenant/login');
  };
  
  return (
    <Box>
      <Flex
        bg={bgColor}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4, md: 8 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={borderColor}
        align={'center'}
        position="sticky"
        top="0"
        zIndex="sticky"
        boxShadow="sm"
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        
        {/* Logo */}
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Link to="/tenant">
            <Image 
              src={logo} 
              alt="Rusunawa Logo" 
              height="40px"
              display={{ base: 'none', md: 'block' }}
            />
            <Text
              textAlign={{ base: 'center', md: 'left' }}
              fontFamily={'heading'}
              fontWeight="bold"
              color={useColorModeValue('brand.600', 'white')}
              fontSize="xl"
              display={{ base: 'block', md: 'none' }}
            >
              Rusunawa
            </Text>
          </Link>
        </Flex>

        {/* Desktop Navigation */}        <Stack
          direction={'row'}
          spacing={4}
          display={{ base: 'none', md: 'flex' }}
          flex={1}
          justify={'center'}
        >
          <DesktopNavItem 
            to="/tenant" 
            label="Home" 
            active={location.pathname === '/tenant'} 
          />
          <DesktopNavItem 
            to="/tenant/rooms" 
            label="Rooms" 
            active={location.pathname.includes('/tenant/rooms')} 
          />          {isAuthenticated && (
            <>
              <DesktopNavItem 
                to="/tenant/bookings" 
                label="My Bookings" 
                active={location.pathname.includes('/tenant/bookings')} 
              />              <DesktopNavItem 
                to="/tenant/dashboard" 
                label="Dashboard" 
                active={location.pathname.includes('/tenant/dashboard')} 
              />
              <DesktopNavItem 
                to="/tenant/profile" 
                label="Profile" 
                active={location.pathname.includes('/tenant/profile')} 
              />              <DesktopNavItem 
                to="/tenant/payments/history"
                label="Payment History"
                active={location.pathname.includes('/tenant/payments/history')}
              />
              <DesktopNavItem 
                to="/tenant/invoices/history"
                label="Invoices"
                active={location.pathname.includes('/tenant/invoices/history')}
              />
              <DesktopNavItem 
                to="/tenant/issues" 
                label="Report Issue" 
                active={location.pathname.includes('/tenant/issues')} 
              />
            </>
          )}
          <DesktopNavItem 
            to="/tenant/about" 
            label="About" 
            active={location.pathname === '/tenant/about'} 
          />
          <DesktopNavItem 
            to="/tenant/contact" 
            label="Contact" 
            active={location.pathname === '/tenant/contact'} 
          />
        </Stack>

        {/* Authentication Buttons */}
        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={4}
          align={'center'}
        >
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Menu>
                <MenuButton
                  as={IconButton}
                  size={'sm'}
                  variant={'ghost'}
                  aria-label={'Notifications'}
                  icon={
                    <>
                      <BellIcon w={5} h={5} />
                      {hasUnreadNotifications && (
                        <Badge
                          colorScheme="red"
                          position="absolute"
                          top="0"
                          right="0"
                          borderRadius="full"
                          boxSize="2"
                        />
                      )}
                    </>
                  }
                  position="relative"
                />
                <MenuList>
                  <MenuItem fontWeight="bold" color="brand.500">
                    Notifications
                  </MenuItem>
                  <MenuDivider />
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <MenuItem key={notification.id}>
                        <Flex align="center">
                          {!notification.isRead && (
                            <Box
                              w="2"
                              h="2"
                              borderRadius="full"
                              bg="brand.500"
                              mr={2}
                            />
                          )}
                          <Text>{notification.message}</Text>
                        </Flex>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem>No notifications</MenuItem>
                  )}
                  <MenuDivider />
                  <MenuItem fontWeight="semibold" color="blue.500">
                    View all notifications
                  </MenuItem>
                </MenuList>
              </Menu>

              {/* User Menu */}
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}
                >
                  <Avatar
                    size={'sm'}
                    name={tenant?.user?.fullName || 'User'}
                    bg="brand.500"
                  />
                </MenuButton>                <MenuList>
                  <MenuItem as={Link} to="/tenant/profile">
                    Profile
                  </MenuItem>
                  <MenuItem as={Link} to="/tenant/bookings">
                    My Bookings
                  </MenuItem>
                  <MenuItem as={Link} to="/tenant/payments/history">
                    Payment History
                  </MenuItem>
                  <MenuItem as={Link} to="/tenant/invoices/history">
                    Invoices
                  </MenuItem>
                  <MenuItem as={Link} to="/tenant/issues">
                    Report Issue
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <>
              <Button
                as={Link}
                fontSize={'sm'}
                fontWeight={400}
                variant={'link'}
                to={'/tenant/login'}
              >
                Sign In
              </Button>
              <Button
                as={Link}
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'brand.500'}
                to={'/tenant/register'}
                _hover={{
                  bg: 'brand.400',
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      {/* Mobile Navigation Collapse */}
      <Collapse in={isOpen} animateOpacity>
        <MobileNav isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      </Collapse>
    </Box>
  );
};

const DesktopNavItem = ({ label, to, active }) => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('brand.500', 'white');
  const activeLinkColor = useColorModeValue('brand.600', 'brand.300');
  const activeBgColor = useColorModeValue('brand.50', 'gray.700');

  return (
    <Box
      as={Link}
      to={to}
      px={2}
      py={1}
      rounded={'md'}
      bg={active ? activeBgColor : 'transparent'}
      color={active ? activeLinkColor : linkColor}
      fontWeight={active ? 'semibold' : 'medium'}
      _hover={{
        bg: activeBgColor,
        color: linkHoverColor,
      }}
      transition="all 0.2s"
    >
      {label}
    </Box>
  );
};

const MobileNav = ({ isAuthenticated, handleLogout }) => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
      boxShadow="md"
    >
      <MobileNavItem label="Home" href="/tenant" />
      <MobileNavItem label="Rooms" href="/tenant/rooms" />      {isAuthenticated && (
        <>
          <MobileNavItem label="My Bookings" href="/tenant/bookings" />
          <MobileNavItem label="Profile" href="/tenant/profile" />
          <MobileNavItem label="Payment History" href="/tenant/payments/history" />
          <MobileNavItem label="Invoices" href="/tenant/invoices/history" />
          <MobileNavItem label="Report Issue" href="/tenant/issues" />
        </>
      )}
      <MobileNavItem label="About" href="/tenant/about" />
      <MobileNavItem label="Contact" href="/tenant/contact" />
      {isAuthenticated ? (
        <Button onClick={handleLogout} colorScheme="red" mt={2}>
          Logout
        </Button>
      ) : (
        <Stack spacing={2} mt={2}>
          <Button as={Link} to={'/tenant/login'} variant="outline" colorScheme="brand">
            Sign In
          </Button>
          <Button as={Link} to={'/tenant/register'} colorScheme="brand">
            Sign Up
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

const MobileNavItem = ({ label, href }) => {
  return (
    <Stack spacing={4}>
      <Box
        py={2}
        as={Link}
        to={href}
        justifyContent="space-between"
        alignItems="center"
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}
        >
          {label}
        </Text>
      </Box>
    </Stack>
  );
};

export default NavBar;
