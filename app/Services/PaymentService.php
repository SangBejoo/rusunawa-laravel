<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class PaymentService extends ApiClient
{
    /**
     * Get tenant invoices
     */
    public function getTenantInvoices(int $tenantId, array $params = [])
    {
        return $this->get('/v1/tenants/' . $tenantId . '/invoices', $params);
    }

    /**
     * Get invoice details
     */
    public function getInvoiceDetails(int $invoiceId)
    {
        return $this->get('/v1/invoices/' . $invoiceId);
    }

    /**
     * Create a payment for an invoice
     */
    public function createPayment(int $invoiceId, string $paymentMethod)
    {
        return $this->post('/v1/payments', [
            'invoice_id' => $invoiceId,
            'payment_method' => $paymentMethod
        ]);
    }

    /**
     * Get payment details
     */
    public function getPayment(int $paymentId)
    {
        return $this->get('/v1/payments/' . $paymentId);
    }

    /**
     * Get payment by invoice
     */
    public function getPaymentByInvoice(int $invoiceId)
    {
        return $this->get('/v1/invoices/' . $invoiceId . '/payment');
    }

    /**
     * Upload manual payment receipt
     */
    public function uploadPaymentReceipt(int $paymentId, UploadedFile $file)
    {
        $content = base64_encode(file_get_contents($file->getRealPath()));
        
        return $this->post('/v1/payments/' . $paymentId . '/receipt', [
            'payment_id' => $paymentId,
            'receipt_image' => $content,
            'file_type' => $file->getMimeType()
        ]);
    }

    /**
     * Check payment status from Midtrans
     */
    public function checkPaymentStatus(int $paymentId)
    {
        return $this->get('/v1/payments/' . $paymentId . '/check-status');
    }

    /**
     * Get tenant payments
     */
    public function getTenantPayments(int $tenantId, array $params = [])
    {
        return $this->get('/v1/tenants/' . $tenantId . '/payments', $params);
    }
}
