import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  useToast
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaExclamationTriangle,
  FaCheck,
  FaClock,
  FaTools,
  FaCalendarAlt
} from 'react-icons/fa';
import TenantLayout from '../../components/layout/TenantLayout';
import { useTenantAuth } from '../../context/tenantAuthContext';
import issueService from '../../services/issueService';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

const IssuesPage = () => {
  const { tenant } = useTenantAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  // Fetch issues from API
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call the real API
        const response = await issueService.getIssues();
        setIssues(response.issues || response || []);
        
      } catch (err) {
        setError(err.message || 'Failed to load issues');
        console.error('Error fetching issues:', err);
        toast({
          title: 'Error Loading Issues',
          description: err.message || 'Failed to load issues',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'red';
      case 'in_progress': return 'yellow';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'gray';
    }
  };

  // Priority color mapping
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  // Filter issues by status
  const filterIssuesByStatus = (status) => {
    if (status === 'all') return issues;
    return issues.filter(issue => issue.status === status);  };

  // Issue card component
  const IssueCard = ({ issue }) => (
    <Card 
      bg={cardBg} 
      borderWidth="1px" 
      borderColor={borderColor} 
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => navigate(`/tenant/issues/${issue.issueId}`)}
    >
      <CardHeader pb={2}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex="1">
            <Heading size="sm" noOfLines={1}>
              {issue.title || `Issue #${issue.issueId}`}
            </Heading>
            <Text fontSize="sm" color="gray.500" noOfLines={2}>
              {issue.description || 'No description provided'}
            </Text>
          </VStack>
          <Badge colorScheme={getStatusColor(issue.status)} variant="solid">
            {(issue.status || 'pending').replace('_', ' ').toUpperCase()}
          </Badge>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <VStack align="stretch" spacing={3}>
          {issue.category && (
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Icon as={FaTools} color="gray.500" />
                <Text fontSize="sm" color="gray.600">{issue.category}</Text>
              </HStack>
              {issue.priority && (
                <Badge colorScheme={getPriorityColor(issue.priority)} variant="outline">
                  {issue.priority.toUpperCase()}
                </Badge>
              )}
            </HStack>
          )}
          
          <HStack spacing={2}>
            <Icon as={FaCalendarAlt} color="gray.500" />
            <Text fontSize="sm" color="gray.600">
              {formatDate(issue.reportedAt)}
            </Text>
          </HStack>
          
          <Button 
            size="sm" 
            colorScheme="blue" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              navigate(`/tenant/issues/${issue.issueId}`);
            }}
          >
            View Details
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <TenantLayout>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="center">
            <Spinner size="xl" color="blue.500" />
            <Text>Loading your issues...</Text>
          </VStack>
        </Container>
      </TenantLayout>
    );
  }

  if (error) {
    return (
      <TenantLayout>
        <Container maxW="container.xl" py={8}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        </Container>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <Box>
              <Heading size="xl" mb={2}>
                Maintenance Issues
              </Heading>
              <Text color="gray.600">
                Report and track maintenance issues in your room
              </Text>
            </Box>
            <Button
              as={RouterLink}
              to="/tenant/issues/report"
              leftIcon={<FaPlus />}
              colorScheme="blue"
              size="lg"
            >
              Report New Issue
            </Button>
          </HStack>

          {/* Stats */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Card bg={cardBg} textAlign="center">
              <CardBody>
                <VStack spacing={2}>
                  <Icon as={FaExclamationTriangle} boxSize={8} color="red.500" />
                  <Heading size="lg">{filterIssuesByStatus('open').length}</Heading>
                  <Text color="gray.600">Open Issues</Text>
                </VStack>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} textAlign="center">
              <CardBody>
                <VStack spacing={2}>
                  <Icon as={FaClock} boxSize={8} color="yellow.500" />
                  <Heading size="lg">{filterIssuesByStatus('in_progress').length}</Heading>
                  <Text color="gray.600">In Progress</Text>
                </VStack>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} textAlign="center">
              <CardBody>
                <VStack spacing={2}>
                  <Icon as={FaCheck} boxSize={8} color="green.500" />
                  <Heading size="lg">{filterIssuesByStatus('resolved').length}</Heading>
                  <Text color="gray.600">Resolved</Text>
                </VStack>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} textAlign="center">
              <CardBody>
                <VStack spacing={2}>
                  <Icon as={FaTools} boxSize={8} color="blue.500" />
                  <Heading size="lg">{issues.length}</Heading>
                  <Text color="gray.600">Total Issues</Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Issues List with Tabs */}
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>All Issues</Tab>
              <Tab>Open</Tab>
              <Tab>In Progress</Tab>
              <Tab>Resolved</Tab>
            </TabList>

            <TabPanels>
              {/* All Issues */}
              <TabPanel px={0}>
                {issues.length === 0 ? (
                  <Card bg={cardBg} textAlign="center" py={10}>
                    <CardBody>
                      <VStack spacing={4}>
                        <Icon as={FaTools} boxSize={12} color="gray.400" />
                        <Heading size="md" color="gray.500">
                          No Issues Found
                        </Heading>
                        <Text color="gray.500">
                          You haven't reported any maintenance issues yet.
                        </Text>
                        <Button
                          as={RouterLink}
                          to="/tenant/issues/report"
                          leftIcon={<FaPlus />}
                          colorScheme="blue"
                        >
                          Report Your First Issue
                        </Button>
                      </VStack>                    </CardBody>
                  </Card>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {issues.map((issue) => (
                      <IssueCard key={issue.issueId} issue={issue} />
                    ))}
                  </SimpleGrid>                )}
              </TabPanel>

              {/* Open Issues */}
              <TabPanel px={0}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filterIssuesByStatus('open').map((issue) => (
                    <IssueCard key={issue.issueId} issue={issue} />
                  ))}
                </SimpleGrid>
                {filterIssuesByStatus('open').length === 0 && (
                  <Text textAlign="center" color="gray.500" py={8}>
                    No open issues found.
                  </Text>                )}
              </TabPanel>

              {/* In Progress Issues */}
              <TabPanel px={0}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filterIssuesByStatus('in_progress').map((issue) => (
                    <IssueCard key={issue.issueId} issue={issue} />
                  ))}
                </SimpleGrid>
                {filterIssuesByStatus('in_progress').length === 0 && (
                  <Text textAlign="center" color="gray.500" py={8}>
                    No issues currently in progress.
                  </Text>                )}
              </TabPanel>

              {/* Resolved Issues */}
              <TabPanel px={0}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filterIssuesByStatus('resolved').map((issue) => (
                    <IssueCard key={issue.issueId} issue={issue} />
                  ))}
                </SimpleGrid>
                {filterIssuesByStatus('resolved').length === 0 && (
                  <Text textAlign="center" color="gray.500" py={8}>
                    No resolved issues found.
                  </Text>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </TenantLayout>
  );
};

export default IssuesPage;
