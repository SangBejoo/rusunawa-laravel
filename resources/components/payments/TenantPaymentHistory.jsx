import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Input,
  Select,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
} from '@chakra-ui/react';
import { FaEye, FaDownload, FaFilter, FaSearch } from 'react-icons/fa';
import * as paymentService from '../../services/paymentService';

const TenantPaymentHistory = ({ tenantId }) => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 10,
  });
  
  const { isOpen: isImageOpen, onOpen: onImageOpen, onClose: onImageClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchPaymentHistory();
  }, [tenantId, filters]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getTenantPaymentsWithProof(tenantId, {
        ...filters,
        includeProofMetadata: true,
        includeInvoiceDetails: true,
      });
      
      setPayments(response.payments || []);
      setSummary(response.summary || {});
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch payment history',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewPaymentProof = async (payment) => {
    try {
      if (!payment.hasImageProof) {
        toast({
          title: 'No Image',
          description: 'This payment has no proof image',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const imageData = await paymentService.getPaymentProofImage(payment.payment.id, {
        format: 'jpeg',
        encoding: 'base64',
        maxWidth: 800,
        maxHeight: 600,
      });

      setImagePreview({
        src: `data:${imageData.fileType};base64,${imageData.base64Content}`,
        payment: payment,
      });
      onImageOpen();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load payment proof image',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const downloadPaymentProof = async (payment) => {
    try {
      const imageData = await paymentService.getPaymentProofImage(payment.payment.id, {
        format: 'jpeg',
        encoding: 'binary',
      });

      // Create download link
      const blob = new Blob([imageData.imageContent], { type: imageData.fileType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_proof_${payment.payment.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download payment proof',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    onDetailOpen();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'green';
      case 'pending': return 'yellow';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getMethodBadge = (method) => {
    return method === 'manual' ? 'Manual Transfer' : 'Midtrans';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading payment history...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Text fontSize="2xl" fontWeight="bold">Payment History</Text>

        {/* Summary Statistics */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Payments</StatLabel>
                <StatNumber>{summary.totalPayments || 0}</StatNumber>
                <StatHelpText>{formatCurrency(summary.totalAmount || 0)}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Successful</StatLabel>
                <StatNumber>{summary.successfulPayments || 0}</StatNumber>
                <StatHelpText>{formatCurrency(summary.paidAmount || 0)}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pending</StatLabel>
                <StatNumber>{summary.pendingPayments || 0}</StatNumber>
                <StatHelpText>{formatCurrency(summary.pendingAmount || 0)}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Filters */}
        <Card>
          <CardHeader>
            <HStack>
              <FaFilter />
              <Text fontWeight="bold">Filters</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              <Select
                placeholder="All Status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              >
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </Select>
              <Select
                placeholder="All Methods"
                value={filters.paymentMethod}
                onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value, page: 1 })}
              >
                <option value="manual">Manual Transfer</option>
                <option value="midtrans">Midtrans</option>
              </Select>
              <Input
                type="date"
                placeholder="From Date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
              />
              <Input
                type="date"
                placeholder="To Date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
              />
            </Grid>
          </CardBody>
        </Card>

        {/* Payment List */}
        <VStack spacing={4} align="stretch">
          {payments.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              No payment history found
            </Alert>
          ) : (
            payments.map((paymentItem) => (
              <Card key={paymentItem.payment.id}>
                <CardBody>
                  <Grid templateColumns="1fr auto" gap={4}>
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Badge colorScheme={getStatusColor(paymentItem.payment.status)}>
                          {paymentItem.payment.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {getMethodBadge(paymentItem.payment.paymentMethod)}
                        </Badge>
                        <Text fontSize="sm" color="gray.500">
                          #{paymentItem.payment.id}
                        </Text>
                      </HStack>
                      
                      <Text fontWeight="bold" fontSize="lg">
                        {formatCurrency(paymentItem.payment.amount)}
                      </Text>
                      
                      <Text fontSize="sm" color="gray.600">
                        {formatDate(paymentItem.payment.createdAt)}
                      </Text>
                      
                      {paymentItem.relatedInvoice && (
                        <Text fontSize="sm">
                          Invoice: #{paymentItem.relatedInvoice.invoiceNumber}
                        </Text>
                      )}
                      
                      {paymentItem.payment.notes && (
                        <Text fontSize="sm" fontStyle="italic">
                          {paymentItem.payment.notes}
                        </Text>
                      )}
                    </VStack>
                    
                    <VStack spacing={2}>
                      <Button
                        size="sm"
                        leftIcon={<FaEye />}
                        onClick={() => viewPaymentDetails(paymentItem)}
                      >
                        Details
                      </Button>
                      
                      {paymentItem.hasImageProof && (
                        <>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            leftIcon={<FaEye />}
                            onClick={() => viewPaymentProof(paymentItem)}
                          >
                            View Proof
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<FaDownload />}
                            onClick={() => downloadPaymentProof(paymentItem)}
                          >
                            Download
                          </Button>
                        </>
                      )}
                    </VStack>
                  </Grid>
                </CardBody>
              </Card>
            ))
          )}
        </VStack>
      </VStack>

      {/* Image Preview Modal */}
      <Modal isOpen={isImageOpen} onClose={onImageClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Payment Proof - #{imagePreview?.payment?.payment?.id}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {imagePreview && (
              <VStack spacing={4}>
                <Image
                  src={imagePreview.src}
                  alt="Payment Proof"
                  maxH="500px"
                  objectFit="contain"
                />
                {imagePreview.payment.proofMetadata && (
                  <Box w="100%">
                    <Text fontWeight="bold">File Information:</Text>
                    <Text fontSize="sm">
                      Name: {imagePreview.payment.proofMetadata.fileName}
                    </Text>
                    <Text fontSize="sm">
                      Size: {(imagePreview.payment.proofMetadata.fileSize / 1024).toFixed(1)} KB
                    </Text>
                    <Text fontSize="sm">
                      Uploaded: {formatDate(imagePreview.payment.proofMetadata.uploadedAt)}
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Payment Details Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Payment Details - #{selectedPayment?.payment?.id}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedPayment && (
              <VStack spacing={4} align="stretch">
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <Text fontWeight="bold">Amount:</Text>
                    <Text>{formatCurrency(selectedPayment.payment.amount)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Status:</Text>
                    <Badge colorScheme={getStatusColor(selectedPayment.payment.status)}>
                      {selectedPayment.payment.status.toUpperCase()}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Method:</Text>
                    <Text>{getMethodBadge(selectedPayment.payment.paymentMethod)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Channel:</Text>
                    <Text>{selectedPayment.payment.paymentChannel || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Created:</Text>
                    <Text>{formatDate(selectedPayment.payment.createdAt)}</Text>
                  </Box>
                  {selectedPayment.payment.paymentDate && (
                    <Box>
                      <Text fontWeight="bold">Paid Date:</Text>
                      <Text>{formatDate(selectedPayment.payment.paymentDate)}</Text>
                    </Box>
                  )}
                </Grid>
                
                {selectedPayment.payment.transactionId && (
                  <Box>
                    <Text fontWeight="bold">Transaction ID:</Text>
                    <Text>{selectedPayment.payment.transactionId}</Text>
                  </Box>
                )}
                
                {selectedPayment.payment.notes && (
                  <Box>
                    <Text fontWeight="bold">Notes:</Text>
                    <Text>{selectedPayment.payment.notes}</Text>
                  </Box>
                )}
                
                {selectedPayment.relatedInvoice && (
                  <>
                    <Divider />
                    <Text fontWeight="bold">Related Invoice:</Text>
                    <Box pl={4}>
                      <Text>Invoice Number: #{selectedPayment.relatedInvoice.invoiceNumber}</Text>
                      <Text>Total Amount: {formatCurrency(selectedPayment.relatedInvoice.totalAmount)}</Text>
                      <Text>Due Date: {formatDate(selectedPayment.relatedInvoice.dueDate)}</Text>
                      <Badge colorScheme={selectedPayment.relatedInvoice.status === 'paid' ? 'green' : 'yellow'}>
                        {selectedPayment.relatedInvoice.status.toUpperCase()}
                      </Badge>
                    </Box>
                  </>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TenantPaymentHistory;
