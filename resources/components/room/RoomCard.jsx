import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Image,
  Badge,
  Text,
  Button,
  Flex,
  Heading,
  Stack,
  useColorModeValue,
  HStack,
  Icon,
  AspectRatio,
  Tooltip,
  Progress
} from '@chakra-ui/react';
import { FaBed, FaUsers, FaWifi, FaThermometerHalf, FaRegClock } from 'react-icons/fa';
import { MdLocationOn, MdPerson, MdTimer, MdHome, MdHotel } from 'react-icons/md';
import roomService from '../../services/roomService';
import { getFormattedRoomPrice, getRoomTypeDisplay, getRoomCapacityText, calculateRoomOccupancy, getOccupancyBadgeInfo } from '../../utils/roomUtils';
import { defaultImages, getDefaultRoomImage } from '../../utils/imageUtils';

/**
 * RoomCard component displays a room in a card format
 * 
 * @param {Object} props - Component props
 * @param {Object} props.room - Room data
 * @returns {JSX.Element} Room card component
 */
const RoomCard = ({ room }) => {
  // Hooks must be called at the top level
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  const [occupancyStatus, setOccupancyStatus] = useState('available');
  const [isLoading, setIsLoading] = useState(false);
  
  // Ensure room ID is properly accessed with fallback
  const roomId = room?.room_id || room?.roomId || room?.id;

  const fetchOccupancyStatus = async () => {
    try {
      // Only attempt to fetch if we have a valid room ID
      if (!roomId || roomId === 'undefined') {
        console.warn('Missing or invalid room ID for occupancy check:', room);
        return;
      }

      // Use the occupancy data from room if available, otherwise fetch
      if (room.occupancy) {
        setOccupancyStatus(room.occupancy);
      } else if (room.occupants) {
        // Calculate from occupants array
        const occupancyData = calculateRoomOccupancy(room);
        setOccupancyStatus(occupancyData);
      } else {
        // Fallback: fetch from API
        const response = await roomService.getRoomOccupancyStatus(roomId);
        setOccupancyStatus(response);
      }
    } catch (error) {
      console.error('Error fetching occupancy status:', error);
      // Default to basic occupancy info on error
      setOccupancyStatus({
        capacity: room?.capacity || 4,
        occupied_slots: 0,
        available_slots: room?.capacity || 4,
        occupancy_percentage: 0,
        status: 'available'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Only fetch if room has a valid ID
    if ((room?.room_id || room?.roomId) && 
        (room.room_id !== 'undefined' || room.roomId !== 'undefined')) {
      fetchOccupancyStatus();
    }
  }, [room]);
  
  // Early return guard for room prop
  if (!room) {
    return null; 
  }
  
  const {
    room_id,
    name,
    classification,
    rentalType,
    rate,
    capacity,
    description,
    amenities = []
  } = room;
  
  // Determine room image based on classification
  const roomImage = defaultImages[classification?.name] || defaultImages.perempuan;
  
  // Get room type display info
  const classInfo = getRoomTypeDisplay(classification?.name || '');
  
  // Determine if this is a meeting room
  const isMeetingRoom = classification?.name === 'ruang_rapat';
  
  // Get room features directly from the provided amenities
  const hasAC = amenities.some(a => a.feature?.name === 'AC');
  const hasBathroom = amenities.some(a => a.feature?.name === 'private_bathroom');
  
  // Get occupancy status badge
  const getOccupancyBadge = () => {
    const badgeInfo = getOccupancyBadgeInfo(room);
    if (!badgeInfo) return null;
    
    return (
      <Badge colorScheme={badgeInfo.colorScheme} ml={2}>
        {badgeInfo.text}
      </Badge>
    );
  };
  
  // Fallback image URL
  const imageUrl = room.imageUrl || getDefaultRoomImage(room);
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      borderColor={cardBorder}
      boxShadow="md"
      transition="all 0.3s"
      _hover={{ boxShadow: 'lg', transform: 'translateY(-5px)' }}
    >
      {/* Room Image */}
      <AspectRatio ratio={16 / 9}>
        <Image 
          src={imageUrl} 
          alt={name} 
          objectFit="cover"
          fallbackSrc={defaultImages.default}
        />
      </AspectRatio>
      
      <Box p={5} display="flex" flexDirection="column">
        {/* Room Type Badge with Occupancy Status */}
        <Flex align="center" mb={2}>
          <Badge 
            colorScheme={classInfo.color} 
            alignSelf="flex-start"
          >
            {classInfo.label}
          </Badge>
          {getOccupancyBadge()}
        </Flex>
        
        {/* Room Name */}
        <Heading as="h3" size="md" mb={2}>
          {name}
        </Heading>
        
        {/* Rate - with formatted price display */}
        <Flex align="center" mb={3}>
          <Text fontWeight="bold" fontSize="xl">
            {getFormattedRoomPrice(room)}
          </Text>
        </Flex>
        
        {/* Description */}
        <Text 
          color="gray.600" 
          fontSize="sm" 
          noOfLines={2} 
          mb={4}
          flex="1"
        >
          {description || 'No description provided for this room.'}
        </Text>
        
        {/* Features */}
        <Stack spacing={2} mt="auto">
          {/* Only show capacity for non-meeting rooms */}
          <HStack>
            {!isMeetingRoom && (
              <Flex align="center">
                <MdPerson />
                <Text ml={1} fontSize="sm">{getRoomCapacityText(room)}</Text>
              </Flex>
            )}
            
            {rentalType && (
              <Flex align="center" ml={3}>
                <MdTimer />
                <Text ml={1} fontSize="sm">
                  {rentalType.name === 'harian' ? 'Harian' : 'Bulanan'}
                </Text>
              </Flex>
            )}
          </HStack>
          
          {/* Occupancy information for dorms */}
          {occupancyStatus && classification?.name !== 'ruang_rapat' && (
            <Tooltip 
              label={`${occupancyStatus.occupied_slots || 0} out of ${occupancyStatus.capacity || 4} beds occupied`} 
              hasArrow
            >
              <Box>
                <Flex align="center" justify="space-between" mt={1}>
                  <Flex align="center">
                    <MdHotel />
                    <Text ml={1} fontSize="sm">Occupancy:</Text>
                  </Flex>
                  <Text fontSize="sm" fontWeight="medium">
                    {occupancyStatus.occupied_slots || 0}/{occupancyStatus.capacity || 4}
                  </Text>
                </Flex>
                <Progress 
                  value={occupancyStatus.occupancy_percentage || 0} 
                  size="xs" 
                  colorScheme={
                    (occupancyStatus.occupancy_percentage || 0) >= 100 ? "red" :
                    (occupancyStatus.occupancy_percentage || 0) > 50 ? "orange" : "green"
                  }
                  mt={1}
                  borderRadius="full"
                />
              </Box>
            </Tooltip>
          )}
          
          {/* Amenities with proper keys */}
          <HStack>
            {amenities.map((amenity, index) => (
              <Badge key={`${roomId}-amenity-${index}`} colorScheme="blue" variant="subtle">
                {amenity.feature?.name || amenity}
              </Badge>
            ))}
          </HStack>
          
          {/* Critical fix: Ensure room ID is passed correctly in the URL */}
          <Button 
            as={RouterLink} 
            to={`/tenant/rooms/${roomId}`} 
            colorScheme="blue" 
            variant="solid"
            size="sm"
            isDisabled={occupancyStatus?.is_fully_booked}
          >
            {occupancyStatus?.is_fully_booked ? 'Fully Booked' : 'View Details'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default RoomCard;
