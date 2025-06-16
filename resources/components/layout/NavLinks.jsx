import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Stack, 
  Text,
  Icon,
  Flex,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import {
  MdHome,
  MdHotel,
  MdPerson,
  MdAssignment,
  MdPayment,
  MdInfoOutline,
  MdMail,
  MdDashboard,
  MdChevronRight,
  MdBugReport
} from 'react-icons/md';

const NavLinks = ({ isAuthenticated, onClose }) => {
  return (
    <List spacing={4}>
      <NavLink to="/" icon={MdHome} label="Home" onClose={onClose} />
      <NavLink to="/rooms" icon={MdHotel} label="Rooms" onClose={onClose} />
        {isAuthenticated && (
        <>
          <NavLink to="/dashboard" icon={MdDashboard} label="Dashboard" onClose={onClose} />
          <NavLink to="/bookings" icon={MdAssignment} label="My Bookings" onClose={onClose} />
          <NavLink to="/invoices" icon={MdPayment} label="Payments" onClose={onClose} />
          <NavLink to="/payments/testing" icon={MdBugReport} label="Payment Testing" onClose={onClose} />
          <NavLink to="/profile" icon={MdPerson} label="Profile" onClose={onClose} />
        </>
      )}
      
      <NavLink to="/about" icon={MdInfoOutline} label="About" onClose={onClose} />
      <NavLink to="/contact" icon={MdMail} label="Contact" onClose={onClose} />
    </List>
  );
};

const NavLink = ({ to, icon, label, onClose }) => {
  return (
    <ListItem>
      <Link to={to} onClick={onClose}>
        <Flex align="center" p={2} borderRadius="md" _hover={{ bg: "gray.100" }} role="group">
          <ListIcon as={icon} fontSize="xl" color="gray.500" _groupHover={{ color: "brand.500" }} />
          <Text ml={4} _groupHover={{ color: "brand.500" }}>{label}</Text>
          <Icon 
            as={MdChevronRight} 
            ml="auto" 
            fontSize="lg" 
            opacity={0}
            transform="translateX(-10px)"
            _groupHover={{ 
              opacity: 1, 
              transform: "translateX(0)",
              color: "brand.500"
            }}
            transition="all 0.2s"
          />
        </Flex>
      </Link>
    </ListItem>
  );
};

export default NavLinks;
