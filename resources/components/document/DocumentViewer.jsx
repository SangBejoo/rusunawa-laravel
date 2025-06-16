import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Image,
  Button,
  HStack,
  Spinner,
  useColorModeValue,
  Badge,
  Link,
  Flex,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  IconButton,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { FaDownload, FaEye, FaFileAlt, FaFilePdf, FaTrash, FaUpload } from 'react-icons/fa';
import { MdFullscreen } from 'react-icons/md';
import { formatDate } from '../../utils/dateUtils';
import documentService from '../../services/documentService';

/**
 * Component to view document details and preview
 */
const DocumentViewer = ({ document, onDelete, onReplace }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentData, setDocumentData] = useState(document);
  const [displayUrl, setDisplayUrl] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  
  // Load full document data if needed
  useEffect(() => {
    const loadDocumentData = async () => {
      if (!document?.docId || document?.content) {
        setDocumentData(document);
        return;
      }

      try {
        setLoading(true);
        const fullDocument = await documentService.getDocumentById(document.docId);
        setDocumentData(fullDocument);
      } catch (error) {
        console.error('Error loading document:', error);
        setError('Failed to load document details');
      } finally {
        setLoading(false);
      }
    };

    loadDocumentData();
  }, [document]);

  // Generate display URL
  useEffect(() => {
    if (!documentData) return;

    let url = null;

    // If document has base64 content and is an image, create blob URL
    if (documentData.content && documentData.isImage) {
      url = documentService.createBlobUrl(documentData.content, documentData.fileType);
    }
    // If document has fileUrl, use it
    else if (documentData.fileUrl) {
      url = documentData.fileUrl;
    }
    // Generate view URL as fallback
    else if (documentData.isImage) {
      url = documentService.getDocumentViewUrl(documentData.docId);
    }

    setDisplayUrl(url);

    // Cleanup blob URL when component unmounts or URL changes
    return () => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [documentData]);
  
  // Get status display properties
  const getStatusDisplay = () => {
    switch (documentData?.status) {
      case 'approved':
        return { color: 'green', text: 'Approved' };
      case 'rejected':
        return { color: 'red', text: 'Rejected' };
      case 'pending':
        return { color: 'yellow', text: 'Pending Review' };
      default:
        return { color: 'gray', text: 'Unknown' };
    }
  };
  
  const statusDisplay = getStatusDisplay();
  
  // Handle document deletion
  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (onDelete) {
        await onDelete(documentData?.docId);
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again.');
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete document. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle document replacement
  const handleReplace = () => {
    if (onReplace) {
      onReplace(documentData?.docId);
    }
  };
  
  // Handle document download
  const handleDownload = async () => {
    try {
      if (documentData?.content) {
        // Download from base64 content
        const blobUrl = documentService.createBlobUrl(documentData.content, documentData.fileType);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = documentData.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } else {
        // Use download service
        const blob = await documentService.downloadDocument(documentData.docId);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = documentData.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast({
        title: 'Download Started',
        description: 'Your document download has started.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download document. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Determine if document is viewable
  const isViewable = documentData?.isImage || documentData?.fileType?.includes('image') || false;
  
  // Function to render preview based on file type
  const renderPreview = () => {
    if (loading) {
      return (
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" />
        </Flex>
      );
    }
    
    if (error) {
      return (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      );
    }
    
    if (isViewable && displayUrl) {
      return (
        <Box 
          position="relative" 
          width="100%" 
          height={{ base: "250px", md: "350px" }}
          borderRadius="md"
          overflow="hidden"
          borderWidth={1}
          borderColor={borderColor}
          bg="gray.50"
        >
          <Image
            src={displayUrl}
            alt={documentData?.fileName || 'Document preview'}
            objectFit="contain"
            width="100%"
            height="100%"
            fallback={
              <Flex justify="center" align="center" height="100%">
                <Spinner />
              </Flex>
            }
            onError={() => {
              setError('Failed to load image preview');
            }}
          />
          
          {/* Fullscreen button */}
          <IconButton 
            icon={<MdFullscreen />}
            position="absolute"
            top={2}
            right={2}
            colorScheme="brand"
            onClick={onOpen}
            aria-label="View fullscreen"
            size="sm"
          />
        </Box>
      );
    }
    
    // Non-image document preview
    return (
      <Flex
        width="100%"
        height={{ base: "200px", md: "300px" }}
        borderRadius="md"
        borderWidth={1}
        borderColor={borderColor}
        bg="gray.50"
        justifyContent="center"
        alignItems="center"
        direction="column"
      >
        <Box fontSize="5xl" mb={4}>
          {documentData?.fileType?.includes('pdf') ? <FaFilePdf color="#D14836" /> : <FaFileAlt color="#2B6CB0" />}
        </Box>
        <Text fontWeight="medium">{documentData?.fileName || 'Document'}</Text>
        
        <Button
          mt={4}
          leftIcon={<FaEye />}
          onClick={handleDownload}
          size="sm"
          colorScheme="blue"
        >
          Download to View
        </Button>
      </Flex>
    );
  };
  
  if (!documentData) {
    return (
      <Box p={6} textAlign="center">
        <Text>No document selected.</Text>
      </Box>
    );
  }
  
  return (
    <>
      <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="sm" width="100%">
        <VStack spacing={6} align="stretch">
          <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Heading size="md">{documentData.documentType?.name || 'Document'}</Heading>
            <Badge colorScheme={statusDisplay.color} px={2} py={1} borderRadius="full">
              {statusDisplay.text}
            </Badge>
          </Flex>
          
          <Divider />
          
          <Box>
            <Text fontSize="sm" color="gray.500" mb={1}>
              File Name
            </Text>
            <Text fontWeight="medium">{documentData.fileName || 'No file name'}</Text>
          </Box>
          
          <HStack>
            <Box flex="1">
              <Text fontSize="sm" color="gray.500" mb={1}>
                Uploaded
              </Text>
              <Text>{formatDate(documentData.uploadedAt || documentData.createdAt)}</Text>
            </Box>
            
            {documentData.status === 'approved' && documentData.approvedAt && (
              <Box flex="1">
                <Text fontSize="sm" color="gray.500" mb={1}>
                  Approved
                </Text>
                <Text>{formatDate(documentData.approvedAt)}</Text>
              </Box>
            )}
          </HStack>
          
          {documentData.status === 'rejected' && documentData.notes && (
            <Alert status="error" variant="left-accent" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Rejection Reason:</Text>
                <Text>{documentData.notes}</Text>
              </Box>
            </Alert>
          )}
          
          {/* Document Preview */}
          {renderPreview()}
          
          {/* Actions */}
          <HStack spacing={4} justify="space-between">
            <Button 
              leftIcon={<FaDownload />}
              variant="outline" 
              size="sm"
              onClick={handleDownload}
            >
              Download
            </Button>
            
            <HStack>
              {documentData.status === 'rejected' && (
                <Button 
                  leftIcon={<FaUpload />}
                  colorScheme="brand" 
                  size="sm"
                  onClick={handleReplace}
                >
                  Replace
                </Button>
              )}
              
              <Button 
                leftIcon={<FaTrash />}
                colorScheme="red" 
                variant="ghost" 
                size="sm"
                onClick={handleDelete}
                isLoading={loading}
              >
                Delete
              </Button>
            </HStack>
          </HStack>
        </VStack>
      </Box>
      
      {/* Fullscreen modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{documentData.documentType?.name || 'Document'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isViewable && displayUrl ? (
              <Image
                src={displayUrl}
                alt={documentData.fileName || 'Document preview'}
                objectFit="contain"
                width="100%"
                maxHeight="70vh"
              />
            ) : (
              <Box textAlign="center" p={6}>
                <Text>Preview not available for this document type.</Text>
                <Button
                  mt={4}
                  onClick={handleDownload}
                  colorScheme="brand"
                >
                  Download to View
                </Button>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DocumentViewer;
