import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Flex,
  Badge,
  Divider,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  Textarea,
  VStack,
  HStack,
  Icon,
  Image,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  useColorModeValue,
  Center,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiFile,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiUpload,
  FiPaperclip,
  FiTrash2,
  FiEye
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { tenantApi } from './api.js';

export default function DocumentUploadPage() {
  const [documents, setDocuments] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const fileInputRef = useRef();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // For document preview
  const [previewDoc, setPreviewDoc] = useState(null);
  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose
  } = useDisclosure();
  
  const lightBg = useColorModeValue('white', 'gray.700');
  const grayBg = useColorModeValue('gray.50', 'gray.800');
  
  useEffect(() => {
    // Get user data
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
    
    fetchDocuments();
  }, []);
  
  // Fetch required documents and user's uploaded documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Get required document types
      const typesResponse = await tenantApi.getDocumentTypes();
      
      // Get user's uploaded documents
      const userDocResponse = await tenantApi.getDocuments();
      
      // Extract data and handle possible API structure variations
      let docTypes = [];
      let userDocs = [];
      
      if (typesResponse.data && Array.isArray(typesResponse.data.documentTypes)) {
        docTypes = typesResponse.data.documentTypes;
      } else if (typesResponse.data && typesResponse.data.types) {
        docTypes = typesResponse.data.types;
      } else {
        // Fallback to hardcoded types
        docTypes = DEFAULT_DOC_TYPES;
      }
      
      if (userDocResponse.data && Array.isArray(userDocResponse.data.documents)) {
        userDocs = userDocResponse.data.documents;
      } else if (userDocResponse.data && userDocResponse.data.documents) {
        userDocs = userDocResponse.data.documents;
      } else {
        // Fallback to mock data
        userDocs = mockDocuments;
      }
      
      setRequiredDocuments(docTypes);
      setDocuments(userDocs);
      
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again later.');
      
      // Set fallback data
      setRequiredDocuments(DEFAULT_DOC_TYPES);
      setDocuments(mockDocuments);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileSelection = (docType) => {
    setUploadingDoc(docType);
    fileInputRef.current.click();
  };
  
  const handleFileChange = async (e) => {
    if (!e.target.files[0] || !uploadingDoc) return;
    
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB max
    
    // Validate file size
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      // Read the file as data URL for preview
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Content = reader.result.split(',')[1]; // Remove data URL prefix
        
        // Prepare file metadata
        const fileData = {
          docTypeId: uploadingDoc.docTypeId,
          documentType: uploadingDoc.name,
          fileName: file.name,
          fileType: file.type,
          content: base64Content,
          description: `${uploadingDoc.name} document for ${userData?.user?.fullName || 'tenant'}`,
          isImage: file.type.startsWith('image/')
        };
        
        try {
          setLoading(true);
          
          // Get tenant ID from stored user data
          const tenantId = userData?.tenantId;
          if (!tenantId) {
            throw new Error('Tenant ID not found. Please log in again.');
          }
          
          // Upload document
          const response = await tenantApi.uploadDocument(tenantId, fileData);
          
          if (response.data && response.data.document) {
            // Add the new document to the list or update if it exists
            const newDoc = response.data.document;
            
            setDocuments(prevDocs => {
              // Check if the document type already exists
              const existingIndex = prevDocs.findIndex(doc => doc.docTypeId === newDoc.docTypeId);
              
              if (existingIndex >= 0) {
                // Update existing document
                const updatedDocs = [...prevDocs];
                updatedDocs[existingIndex] = newDoc;
                return updatedDocs;
              } else {
                // Add new document
                return [...prevDocs, newDoc];
              }
            });
            
            toast({
              title: 'Upload successful',
              description: 'Your document has been uploaded.',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          }
        } catch (err) {
          console.error('Error uploading document:', err);
          
          toast({
            title: 'Upload failed',
            description: err.response?.data?.message || 'There was an error uploading your document.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
          setUploadingDoc(null);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      
      reader.readAsDataURL(file);
      
    } catch (err) {
      console.error('Error processing file:', err);
      
      toast({
        title: 'Error',
        description: 'There was an error processing your file.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleViewDocument = (doc) => {
    setPreviewDoc(doc);
    onPreviewOpen();
  };
  
  // Calculate completion percentage
  const completionPercentage = () => {
    if (requiredDocuments.length === 0) return 0;
    const approvedDocs = documents.filter(doc => doc.status === 'APPROVED').length;
    return Math.round((approvedDocs / requiredDocuments.length) * 100);
  };
  
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      
      <Box flex="1" bg={useColorModeValue('gray.50', 'gray.900')} py={8}>
        <Container maxW="container.xl">
          <Stack spacing={8}>
            <Flex justify="space-between" align="center" flexWrap="wrap">
              <Stack spacing={2}>
                <Heading size="lg">My Documents</Heading>
                <Text color="gray.600">Upload and manage required documents</Text>
              </Stack>
              
              <Box bg={lightBg} p={4} borderRadius="md" boxShadow="sm">
                <Text mb={2} fontWeight="medium">Documents Completion</Text>
                <Flex align="center">
                  <Progress
                    value={completionPercentage()}
                    size="sm"
                    colorScheme="green"
                    borderRadius="full"
                    flex="1"
                    mr={3}
                  />
                  <Text fontWeight="bold">{completionPercentage()}%</Text>
                </Flex>
              </Box>
            </Flex>
            
            {loading && !documents.length ? (
              <Center py={10}>
                <VStack spacing={3}>
                  <Spinner size="xl" thickness="4px" speed="0.65s" color="brand.500" />
                  <Text>Loading documents...</Text>
                </VStack>
              </Center>
            ) : error ? (
              <Alert status="error" borderRadius="lg">
                <AlertIcon />
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Stack>
                    <AlertTitle>Document Requirements</AlertTitle>
                    <AlertDescription>
                      To complete your tenant profile and booking, please upload the following documents.
                      All files must be clear, legible, and in JPG, PNG, or PDF format, and less than 5MB in size.
                    </AlertDescription>
                  </Stack>
                </Alert>
                
                {/* Document upload grid */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {requiredDocuments.map(docType => {
                    // Find if user has uploaded this document type
                    const uploadedDoc = documents.find(doc => doc.docTypeId === docType.docTypeId);
                    
                    return (
                      <DocumentCard
                        key={docType.docTypeId}
                        docType={docType}
                        document={uploadedDoc}
                        onUpload={() => handleFileSelection(docType)}
                        onView={() => uploadedDoc && handleViewDocument(uploadedDoc)}
                        loading={loading && uploadingDoc?.docTypeId === docType.docTypeId}
                      />
                    );
                  })}
                </SimpleGrid>
              </>
            )}
          </Stack>
        </Container>
      </Box>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleFileChange}
      />
      
      {/* Document Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Document Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {previewDoc && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="bold">{previewDoc.documentType}</Text>
                    <Badge colorScheme={getStatusColor(previewDoc.status)}>
                      {previewDoc.status}
                    </Badge>
                  </Box>
                  <Text color="gray.500">{new Date(previewDoc.uploadDate || previewDoc.createdAt).toLocaleDateString()}</Text>
                </HStack>
                
                <Divider />
                
                <Box>
                  {previewDoc.fileUrl ? (
                    previewDoc.isImage ? (
                      <Image 
                        src={previewDoc.fileUrl} 
                        alt={previewDoc.documentType} 
                        maxH="500px"
                        w="100%"
                        objectFit="contain"
                        borderRadius="md"
                      />
                    ) : (
                      <Box 
                        bg="gray.100" 
                        p={8} 
                        textAlign="center" 
                        borderRadius="md"
                      >
                        <Icon as={FiFile} boxSize={12} color="gray.400" />
                        <Text mt={2}>
                          {previewDoc.fileName || 'Document'} (PDF)
                        </Text>
                        <Button 
                          as="a" 
                          href={previewDoc.fileUrl} 
                          target="_blank" 
                          mt={4}
                          colorScheme="blue"
                        >
                          Open Document
                        </Button>
                      </Box>
                    )
                  ) : (
                    <Box 
                      bg="gray.100" 
                      p={8} 
                      textAlign="center" 
                      borderRadius="md"
                    >
                      <Icon as={FiFile} boxSize={12} color="gray.400" />
                      <Text mt={2}>Document preview not available</Text>
                    </Box>
                  )}
                </Box>
                
                {previewDoc.comments && (
                  <Box>
                    <Text fontWeight="bold">Admin Comments:</Text>
                    <Text>{previewDoc.comments}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onPreviewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      <Footer />
    </Box>
  );
}

// Document Card Component
const DocumentCard = ({ docType, document, onUpload, onView, loading }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const hasDocument = !!document;
  
  return (
    <Card bg={cardBg} overflow="hidden" variant="outline">
      <CardBody>
        <Stack spacing={4}>
          <Flex justify="space-between" align="start">
            <Box>
              <Heading size="md" mb={1}>{docType.name}</Heading>
              {hasDocument ? (
                <Badge colorScheme={getStatusColor(document.status)}>
                  {document.status}
                </Badge>
              ) : (
                <Badge colorScheme="red">REQUIRED</Badge>
              )}
            </Box>
            <Icon 
              as={hasDocument ? FiFile : FiPaperclip} 
              boxSize={6}
              color={hasDocument ? "blue.500" : "gray.400"}
            />
          </Flex>
          
          <Text color="gray.600" fontSize="sm">
            {docType.description || getDocTypeDescription(docType.name)}
          </Text>
          
          <Divider />
          
          <Flex justify="space-between" align="center" wrap="wrap">
            <Text fontSize="sm" color="gray.500">
              {hasDocument 
                ? `Uploaded on ${new Date(document.uploadDate || document.createdAt).toLocaleDateString()}`
                : 'Not yet uploaded'
              }
            </Text>
            
            <HStack spacing={2}>
              {/* View document button if uploaded */}
              {hasDocument && (
                <Button 
                  size="sm" 
                  leftIcon={<Icon as={FiEye} />}
                  onClick={onView}
                  variant="ghost"
                >
                  View
                </Button>
              )}
              
              {/* Upload/Replace document button */}
              <Button 
                size="sm" 
                colorScheme="blue"
                leftIcon={<Icon as={hasDocument ? FiUpload : FiPaperclip} />}
                onClick={onUpload}
                isLoading={loading}
                loadingText="Uploading"
              >
                {hasDocument ? 'Replace' : 'Upload'}
              </Button>
            </HStack>
          </Flex>
          
          {/* Show error reason if rejected */}
          {hasDocument && document.status === 'REJECTED' && document.comments && (
            <Alert status="error" mt={2} size="sm" borderRadius="md">
              <AlertIcon />
              <Box flex="1" fontSize="sm">
                <AlertTitle>Rejected</AlertTitle>
                <AlertDescription>{document.comments}</AlertDescription>
              </Box>
            </Alert>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};

// Helper function to get status color for badges
function getStatusColor(status) {
  switch(status) {
    case 'APPROVED':
      return 'green';
    case 'PENDING':
      return 'yellow';
    case 'REJECTED':
      return 'red';
    default:
      return 'gray';
  }
}

// Helper function to get document type description
function getDocTypeDescription(docType) {
  switch(docType.toLowerCase()) {
    case 'identity_card':
    case 'id card':
      return 'Your valid government-issued ID card (KTP/SIM/Passport)';
    case 'surat_persetujuan':
    case 'approval letter':
      return 'Approval letter from your institution or guardian';
    case 'bukti_pembayaran':
    case 'payment proof':
      return 'Proof of payment for your reservation';
    case 'formulir_pendaftaran':
    case 'registration form':
      return 'Completed registration form with signature';
    default:
      return 'Required document for tenant verification';
  }
}

// Default document types
const DEFAULT_DOC_TYPES = [
  {
    docTypeId: 1,
    name: 'Identity Card',
    description: 'Your valid government-issued ID card (KTP/SIM/Passport)'
  },
  {
    docTypeId: 2,
    name: 'Approval Letter',
    description: 'Approval letter from your institution or guardian'
  },
  {
    docTypeId: 3,
    name: 'Payment Proof',
    description: 'Proof of payment for your reservation'
  },
  {
    docTypeId: 4,
    name: 'Registration Form',
    description: 'Completed registration form with signature'
  }
];

// Mock documents for development and fallback
const mockDocuments = [
  {
    documentId: 101,
    tenantId: 1,
    docTypeId: 1,
    documentType: 'Identity Card',
    fileName: 'ktp_andi.jpg',
    fileType: 'image/jpeg',
    isImage: true,
    status: 'APPROVED',
    uploadDate: '2023-06-01',
    fileUrl: 'https://via.placeholder.com/400x250.png?text=ID+Card+Preview'
  },
  {
    documentId: 102,
    tenantId: 1,
    docTypeId: 2,
    documentType: 'Approval Letter',
    fileName: 'approval_letter.pdf',
    fileType: 'application/pdf',
    isImage: false,
    status: 'PENDING',
    uploadDate: '2023-06-02'
  },
  {
    documentId: 103,
    tenantId: 1,
    docTypeId: 3,
    documentType: 'Payment Proof',
    fileName: 'payment_receipt.jpg',
    fileType: 'image/jpeg',
    isImage: true,
    status: 'REJECTED',
    uploadDate: '2023-06-03',
    comments: 'The receipt is not clear. Please reupload with better quality.'
  }
];
