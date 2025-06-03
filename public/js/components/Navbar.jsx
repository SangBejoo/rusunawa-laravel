import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Collapse,
  IconButton,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Icon
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
  CloseIcon, 
  ChevronDownIcon, 
  ChevronRightIcon 
} from '@chakra-ui/icons';

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tenant, setTenant] = useState(null);

  // Check authentication status on component mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('tenant_token');
      const tenantData = localStorage.getItem('tenant_data');
      
      if (token && tenantData) {
        setIsAuthenticated(true);
        try {
          setTenant(JSON.parse(tenantData));
        } catch (e) {
          console.error('Error parsing tenant data:', e);
        }
      } else {
        setIsAuthenticated(false);
        setTenant(null);
      }
    };
    
    // Check auth on load
    checkAuth();
    
    // Listen for storage changes (for cross-tab synchronization)
    const handleStorageChange = (e) => {
      if (e.key === 'tenant_token' || e.key === 'tenant_data') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for within-page changes
    const handleAuthEvent = () => checkAuth();
    window.addEventListener('tenantAuthChanged', handleAuthEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tenantAuthChanged', handleAuthEvent);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Send logout request to server
      const response = await fetch('/tenant/logout', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // Clear local storage regardless of response
      localStorage.removeItem('tenant_token');
      localStorage.removeItem('tenant_data');
      sessionStorage.removeItem('tenant_token');
      sessionStorage.removeItem('tenant_data');
      
      // Update state
      setIsAuthenticated(false);
      setTenant(null);
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('tenantAuthChanged'));
      
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      
      // Still clear storage and update state on error
      localStorage.removeItem('tenant_token');
      localStorage.removeItem('tenant_data');
      setIsAuthenticated(false);
      setTenant(null);
      
      window.location.href = '/';
    }
  };

  // Get tenant name for display
  const getTenantName = () => {
    if (!tenant) return 'User';
    
    // Handle different possible structures
    if (typeof tenant === 'object') {
      if (tenant.user && tenant.user.fullName) {
        return tenant.user.fullName;
      }
      if (tenant.tenant && tenant.tenant.user && tenant.tenant.user.fullName) {
        return tenant.tenant.user.fullName;
      }
      return tenant.name || tenant.fullName || 'User';
    }
    
    return 'User';
  };

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
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
        
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            as={'a'}
            href="/"
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            fontWeight="bold"
            fontSize="xl"
            color={useColorModeValue('brand.600', 'white')}
          >
            Rusunawa
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          {isAuthenticated ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <Avatar
                  size="sm"
                  name={getTenantName()}
                />
              </MenuButton>
              <MenuList>
                <MenuItem as="a" href="/tenant/profile">My Profile</MenuItem>
                <MenuItem as="a" href="/tenant/bookings">My Bookings</MenuItem>
                <MenuItem as="a" href="/tenant/invoices">My Invoices</MenuItem>
                <MenuItem as="a" href="/tenant/payments">Payment History</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <>
              <Button
                as={'a'}
                fontSize={'sm'}
                fontWeight={400}
                variant={'link'}
                onClick={(e) => {
                  e.preventDefault(); // Prevent React Router from intercepting
                  console.log("Sign In clicked, navigating to /tenant/login");
                  // Add a timestamp to prevent caching issues
                  const timestamp = new Date().getTime();
                  // Use direct window.location navigation to bypass React Router
                  window.location.href = `/tenant/login?t=${timestamp}`;
                }}
              >
                Sign In
              </Button>
              <Button
                as={'a'}
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'brand.500'}
                _hover={{
                  bg: 'brand.600',
                }}
                onClick={(e) => {
                  e.preventDefault(); // Prevent React Router from intercepting
                  console.log("Sign Up clicked, navigating to /tenant/register");
                  // Use direct window.location navigation to bypass React Router
                  window.location.href = "/tenant/register";
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      </Collapse>
    </Box>
  );
};

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                as={'a'}
                p={2}
                href={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <Link
      as={'a'}
      href={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('brand.50', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'brand.500' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'brand.500'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = ({ isAuthenticated, handleLogout }) => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
      
      {isAuthenticated && (
        <>
          <Text fontWeight={600} color="gray.600" mt={4} mb={2}>
            My Account
          </Text>
          <MobileNavItem label="My Profile" href="/tenant/profile" />
          <MobileNavItem label="My Bookings" href="/tenant/bookings" />
          <MobileNavItem label="My Invoices" href="/tenant/invoices" />
          <MobileNavItem label="Payment History" href="/tenant/payments" />
          <Box 
            as="button" 
            py={2}
            onClick={handleLogout}
            textAlign="left"
          >
            <Text
              fontWeight={600}
              color="red.500">
              Sign Out
            </Text>
          </Box>
        </>
      )}
      
      {!isAuthenticated && (
        <Stack spacing={4} mt={4}>
          <Button
            as="a"
            w="full"
            fontSize={'sm'}
            bg={'brand.50'}
            color={'brand.600'}
            onClick={(e) => {
              e.preventDefault();
              const timestamp = new Date().getTime();
              window.location.href = `/tenant/login?t=${timestamp}`;
            }}
          >
            Sign In
          </Button>
          <Button
            as="a"
            w="full"
            fontSize={'sm'}
            fontWeight={600}
            color={'white'}
            bg={'brand.500'}
            _hover={{
              bg: 'brand.600',
            }}
            onClick={(e) => {
              e.preventDefault();
              const timestamp = new Date().getTime();
              window.location.href = `/tenant/register?t=${timestamp}`;
            }}
          >
            Sign Up
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={href ? 'a' : 'div'}
        href={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}>
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}>
          {children &&
            children.map((child) => (
              <Link
                key={child.label}
                as={'a'}
                href={child.href}
                py={2}
              >
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Browse Rooms',
    href: '/rooms',
  },
  {
    label: 'Room Types',
    children: [
      {
        label: 'Student Rooms',
        subLabel: 'Affordable options for students',
        href: '/rooms?type=student',
      },
      {
        label: 'VIP Rooms',
        subLabel: 'Premium accommodations',
        href: '/rooms?type=VIP',
      },
      {
        label: 'Meeting Rooms',
        subLabel: 'For events and gatherings',
        href: '/rooms?type=meeting',
      },
    ],
  },
  {
    label: 'My Bookings',
    href: '/tenant/bookings',
  },
  {
    label: 'Financial',
    children: [
      {
        label: 'My Invoices',
        subLabel: 'View and pay your invoices',
        href: '/tenant/invoices',
      },
      {
        label: 'Payment History',
        subLabel: 'Track your payment records',
        href: '/tenant/payments',
      },
    ],
  },
  {
    label: 'About Us',
    href: '/about',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

export default Navbar;
