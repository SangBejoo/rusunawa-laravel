<?php

namespace App\Http\Controllers;

use App\Services\PaymentService;
use App\Services\TenantAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    protected $paymentService;
    protected $authService;

    public function __construct(PaymentService $paymentService, TenantAuthService $authService)
    {
        $this->paymentService = $paymentService;
        $this->authService = $authService;
        $this->middleware('tenant.auth');
    }

    /**
     * Display a listing of tenant invoices
     */
    public function invoices(Request $request)
    {
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }
        
        $status = $request->get('status', '');
        $page = max(1, $request->get('page', 1));
        $limit = 10;
        
        $response = $this->paymentService->getTenantInvoices(
            $tenant['tenant_id'], 
            [
                'status' => $status,
                'page' => $page,
                'limit' => $limit
            ]
        );
        
        return view('tenant.invoices', [
            'invoices' => $response['success'] ? $response['body']['invoices'] : [],
            'totalCount' => $response['success'] ? $response['body']['total_count'] : 0,
            'currentPage' => $page,
            'perPage' => $limit,
            'status' => $status,
            'tenant' => $tenant
        ]);
    }

    /**
     * Show specific invoice details
     */
    public function showInvoice($invoiceId)
    {
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }
        
        $invoiceResponse = $this->paymentService->getInvoiceDetails($invoiceId);
        
        if (!$invoiceResponse['success']) {
            return back()->with('error', $invoiceResponse['body']['message'] ?? 'Invoice not found.');
        }
        
        $invoice = $invoiceResponse['body']['invoice'];
        
        // Get payment details if any
        $paymentResponse = $this->paymentService->getPaymentByInvoice($invoiceId);
        $payment = $paymentResponse['success'] ? $paymentResponse['body']['payment'] : null;
        
        return view('tenant.invoice-detail', [
            'invoice' => $invoice,
            'payment' => $payment,
            'tenant' => $tenant
        ]);
    }

    /**
     * Display a listing of tenant payments
     */
    public function payments(Request $request)
    {
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }
        
        $status = $request->get('status', '');
        $page = max(1, $request->get('page', 1));
        $limit = 10;
        
        $response = $this->paymentService->getTenantPayments(
            $tenant['tenant_id'], 
            [
                'status' => $status,
                'page' => $page,
                'limit' => $limit
            ]
        );
        
        return view('tenant.payments', [
            'payments' => $response['success'] ? $response['body']['payments'] : [],
            'totalCount' => $response['success'] ? $response['body']['total_count'] : 0,
            'currentPage' => $page,
            'perPage' => $limit,
            'status' => $status,
            'tenant' => $tenant
        ]);
    }

    /**
     * Show payment details
     */
    public function showPayment($paymentId)
    {
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }
        
        $response = $this->paymentService->getPayment($paymentId);
        
        if (!$response['success']) {
            return back()->with('error', $response['body']['message'] ?? 'Payment not found.');
        }
        
        return view('tenant.payment-detail', [
            'payment' => $response['body']['payment'],
            'tenant' => $tenant
        ]);
    }

    /**
     * Create a new payment for an invoice
     */
    public function createPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'invoice_id' => 'required|numeric',
            'payment_method' => 'required|string|in:bank_transfer,e_wallet,credit_card',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }
        
        $response = $this->paymentService->createPayment(
            $request->invoice_id,
            $request->payment_method
        );
        
        if (!$response['success']) {
            return back()->with('error', $response['body']['message'] ?? 'Failed to create payment.');
        }
        
        $payment = $response['body']['payment'];
        
        // If payment has a redirect URL, redirect the user there
        if (!empty($payment['payment_url'])) {
            return redirect()->away($payment['payment_url']);
        }
        
        return redirect()->route('tenant.payment.show', $payment['payment_id'])
            ->with('status', 'Payment initiated successfully.');
    }

    /**
     * Upload a payment receipt for manual payments
     */
    public function uploadReceipt(Request $request, $paymentId)
    {
        $validator = Validator::make($request->all(), [
            'receipt' => 'required|file|max:5120|mimes:jpeg,png,jpg,pdf', // 5MB max
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }
        
        $file = $request->file('receipt');
        
        $response = $this->paymentService->uploadPaymentReceipt(
            $paymentId,
            $file
        );
        
        if (!$response['success']) {
            return back()->with('error', $response['body']['message'] ?? 'Failed to upload receipt.');
        }
        
        return redirect()->route('tenant.payment.show', $paymentId)
            ->with('status', 'Receipt uploaded successfully. It will be reviewed by our team.');
    }

    /**
     * Check payment status from Midtrans
     */
    public function checkStatus($paymentId)
    {
        $tenant = $this->authService->getTenantData();
        
        if (!$tenant) {
            return redirect()->route('tenant.login')
                ->with('error', 'Your session has expired. Please login again.');
        }
        
        $response = $this->paymentService->checkPaymentStatus($paymentId);
        
        if (!$response['success']) {
            return back()->with('error', $response['body']['message'] ?? 'Failed to check payment status.');
        }
        
        $payment = $response['body']['payment'];
        
        return redirect()->route('tenant.payment.show', $paymentId)
            ->with('status', 'Payment status updated: ' . ucfirst($payment['status']));
    }
}
