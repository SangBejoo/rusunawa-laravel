import React, { useState } from 'react';
import {
  Box,
  Flex,
  Input,
  Button,
  Select,
  FormControl,
  FormLabel,
  Stack,
  useColorModeValue,
  Heading,
  IconButton,
  Collapse,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

const SearchPanel = ({ onSearch, initialFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    keyword: initialFilters.keyword || '',
    classification: initialFilters.classification || '',
    rentalType: initialFilters.rentalType || '',
    priceMin: initialFilters.priceMin || '',
    priceMax: initialFilters.priceMax || '',
    capacity: initialFilters.capacity || '',
    sort: initialFilters.sort || 'recommended'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(filters);
    }
  };

  return (
    <Box
      bg={useColorModeValue('white', 'gray.700')}
      p={6}
      borderRadius="lg"
      boxShadow="md"
      mb={8}
    >
      <Flex justify="space-between" align="center" mb={isOpen ? 4 : 0}>
        <Heading as="h3" size="md">
          Find Your Perfect Room
        </Heading>
        <IconButton
          icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          aria-label={isOpen ? "Collapse search" : "Expand search"}
        />
      </Flex>
      
      <Collapse in={isOpen} animateOpacity>
        <form onSubmit={handleSearch}>
          <Stack spacing={4}>
            <Flex direction={{ base: "column", md: "row" }} gap={4}>
              <FormControl flex={2}>
                <FormLabel>Search</FormLabel>
                <Input 
                  name="keyword"
                  value={filters.keyword}
                  onChange={handleChange}
                  placeholder="Search by room name or features..."
                />
              </FormControl>
              
              <FormControl flex={1}>
                <FormLabel>Room Type</FormLabel>
                <Select 
                  name="classification"
                  value={filters.classification}
                  onChange={handleChange}
                  placeholder="All Types"
                >
                  <option value="perempuan">Female Only</option>
                  <option value="laki_laki">Male Only</option>
                  <option value="VIP">VIP</option>
                  <option value="ruang_rapat">Meeting Room</option>
                </Select>
              </FormControl>
            </Flex>
            
            <Flex direction={{ base: "column", md: "row" }} gap={4}>
              <FormControl flex={1}>
                <FormLabel>Rental Type</FormLabel>
                <Select 
                  name="rentalType"
                  value={filters.rentalType}
                  onChange={handleChange}
                  placeholder="All Rental Types"
                >
                  <option value="bulanan">Monthly</option>
                  <option value="harian">Daily</option>
                </Select>
              </FormControl>
              
              <FormControl flex={1}>
                <FormLabel>Min Price</FormLabel>
                <Input 
                  name="priceMin"
                  value={filters.priceMin}
                  onChange={handleChange}
                  type="number"
                  placeholder="Minimum price"
                />
              </FormControl>
              
              <FormControl flex={1}>
                <FormLabel>Max Price</FormLabel>
                <Input 
                  name="priceMax"
                  value={filters.priceMax}
                  onChange={handleChange}
                  type="number"
                  placeholder="Maximum price"
                />
              </FormControl>
            </Flex>
            
            <Flex direction={{ base: "column", md: "row" }} gap={4}>
              <FormControl flex={1}>
                <FormLabel>Capacity</FormLabel>
                <Select 
                  name="capacity"
                  value={filters.capacity}
                  onChange={handleChange}
                  placeholder="Any Capacity"
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="4">4+ People</option>
                </Select>
              </FormControl>
              
              <FormControl flex={1}>
                <FormLabel>Sort By</FormLabel>
                <Select 
                  name="sort"
                  value={filters.sort}
                  onChange={handleChange}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Price (Low to High)</option>
                  <option value="price_high">Price (High to Low)</option>
                  <option value="capacity">Capacity</option>
                </Select>
              </FormControl>
            </Flex>
            
            <Button 
              type="submit"
              colorScheme="blue" 
              bg="brand.500"
              size="lg"
              leftIcon={<SearchIcon />}
              _hover={{ bg: "brand.400" }}
              mt={2}
            >
              Search Rooms
            </Button>
          </Stack>
        </form>
      </Collapse>
      
      {!isOpen && (
        <form onSubmit={handleSearch}>
          <Flex gap={4}>
            <Input 
              name="keyword"
              value={filters.keyword}
              onChange={handleChange}
              placeholder="Quick search by room name or features..."
              flex={1}
            />
            <Button 
              type="submit"
              colorScheme="blue" 
              bg="brand.500"
              leftIcon={<SearchIcon />}
              _hover={{ bg: "brand.400" }}
            >
              Search
            </Button>
          </Flex>
        </form>
      )}
    </Box>
  );
};

export default SearchPanel;
