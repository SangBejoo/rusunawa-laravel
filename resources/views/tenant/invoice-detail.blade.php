@extends('layouts.app')

@section('title', 'Invoice Details')

@section('content')
<div class="container">
    <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('tenant.dashboard') }}">Dashboard</a></li>
            <li class="breadcrumb-item"><a href="{{ route('tenant.invoices') }}">Invoices</a></li>
            <li class="breadcrumb-item active" aria-current="page">{{ $invoice['invoice_no'] }}</li>
        </ol>
    </nav>
    
    <div class="row">
        <div class="col-md-8">
            <!-- Invoice Details -->
            <div class="card shadow mb-4">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        <i class="fas fa-file-invoice-dollar me-2"></i> Invoice #{{ $invoice['invoice_no'] }}
                    </h5>
                    <span class="badge fs-6 
                        @if($invoice['status'] == 'pending') bg-warning 
                        @elseif($invoice['status'] == 'paid') bg-success 
                        @elseif($invoice['status'] == 'cancelled') bg-secondary 
                        @elseif($invoice['status'] == 'failed') bg-danger 
                        @else bg-info @endif">
                        {{ ucfirst($invoice['status']) }}
                    </span>
                </div>
                <div class="card-body">
                    <!-- Invoice Content -->
                    <div class="row mb-4">
                        <div class="col-sm-6">
                            <h6 class="mb-3">From:</h6>
                            <div><strong>Rusunawa Management</strong></div>
                            <div>123 Campus Street</div>
                            <div>City, Province 12345</div>
                            <div>Indonesia</div>
                            <div>Email: admin@rusunawa.ac.id</div>
                            <div>Phone: +62 123 4567 890</div>
                        </div>
                        
                        <div class="col-sm-6">
                            <h6 class="mb-3">To:</h6>
                            <div><strong>{{ $tenant['user']['full_name'] }}</strong></div>
                            <div>{{ $tenant['address'] }}</div>
                            <div>Email: {{ $tenant['user']['email'] }}</div>
                            <div>Phone: {{ $tenant['phone'] }}</div>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Period</th>
                                    <th class="text-end">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- We'll assume this is a booking invoice -->
                                <tr>
                                    <td>
                                        Room Rental: {{ $invoice['booking']['room']['name'] ?? 'Room' }}
                                        <br>
                                        <small class="text-muted">{{ $invoice['booking']['room']['classification']['name'] ?? 'Standard Room' }}</small>
                                    </td>
                                    <td>
                                        {{ date('d M Y', strtotime($invoice['booking']['start_date'] ?? $invoice['issued_at'])) }} - 
                                        {{ date('d M Y', strtotime($invoice['booking']['end_date'] ?? $invoice['due_date'])) }}
                                    </td>
                                    <td class="text-end">Rp {{ number_format($invoice['amount'], 0, ',', '.') }}</td>
                                </tr>
                                
                                <!-- Include any other charges if available -->
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th colspan="2" class="text-end">Total:</th>
                                    <th class="text-end">Rp {{ number_format($invoice['amount'], 0, ',', '.') }}</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    
                    <!-- Invoice Information -->
                    <div class="row mt-4">
                        <div class="col-lg-4 col-sm-5">
                            <div class="mb-2"><strong>Invoice Date:</strong></div>
                            <div class="mb-2"><strong>Due Date:</strong></div>
                            <div class="mb-2"><strong>Status:</strong></div>
                            @if($invoice['status'] == 'paid')
                                <div class="mb-2"><strong>Payment Date:</strong></div>
                                <div class="mb-2"><strong>Payment Method:</strong></div>
                            @endif
                        </div>
                        <div class="col-lg-8 col-sm-7">
                            <div class="mb-2">{{ date('d F Y', strtotime($invoice['issued_at'])) }}</div>
                            <div class="mb-2">{{ date('d F Y', strtotime($invoice['due_date'])) }}</div>
                            <div class="mb-2">
                                <span class="badge 
                                    @if($invoice['status'] == 'pending') bg-warning 
                                    @elseif($invoice['status'] == 'paid') bg-success 
                                    @elseif($invoice['status'] == 'cancelled') bg-secondary 
                                    @elseif($invoice['status'] == 'failed') bg-danger 
                                    @else bg-info @endif">
                                    {{ ucfirst($invoice['status']) }}
                                </span>
                            </div>
                            @if($invoice['status'] == 'paid')
                                <div class="mb-2">{{ date('d F Y', strtotime($invoice['paid_at'])) }}</div>
                                <div class="mb-2">{{ ucfirst(str_replace('_', ' ', $invoice['payment_method'])) }}</div>
                            @endif
                        </div>
                    </div>
                    
                    <!-- Payment Actions -->
                    <div class="mt-4">
                        @if($invoice['status'] == 'pending')
                            <div id="pay" class="alert alert-warning">
                                <div class="d-flex">
                                    <div class="me-3">
                                        <i class="fas fa-exclamation-triangle fa-2x"></i>
                                    </div>
                                    <div>
                                        <h5 class="alert-heading">Payment Required</h5>
                                        <p>This invoice is due on {{ date('d F Y', strtotime($invoice['due_date'])) }}. Please make your payment soon to avoid any service interruption.</p>
                                    </div>
                                </div>
                            </div>
                        @elseif($invoice['status'] == 'paid')
                            <div class="alert alert-success">
                                <div class="d-flex">
                                    <div class="me-3">
                                        <i class="fas fa-check-circle fa-2x"></i>
                                    </div>
                                    <div>
                                        <h5 class="alert-heading">Payment Received</h5>
                                        <p>Thank you for your payment. Your transaction has been completed successfully.</p>
                                        <hr>
                                        <a href="#" class="btn btn-sm btn-outline-success" onclick="window.print()">
                                            <i class="fas fa-print me-1"></i> Print Receipt
                                        </a>
                                    </div>
                                </div>
                            </div>
                        @elseif($invoice['status'] == 'failed')
                            <div class="alert alert-danger">
                                <div class="d-flex">
                                    <div class="me-3">
                                        <i class="fas fa-times-circle fa-2x"></i>
                                    </div>
                                    <div>
                                        <h5 class="alert-heading">Payment Failed</h5>
                                        <p>There was an issue with your last payment attempt. Please try again or contact support if you need assistance.</p>
                                    </div>
                                </div>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-4">
            <!-- Payment Options -->
            @if($invoice['status'] == 'pending')
                <div class="card shadow mb-4">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-credit-card me-2"></i> Payment Options
                        </h5>
                    </div>
                    <div class="card-body">
                        <form action="{{ route('tenant.payment.create') }}" method="POST">
                            @csrf
                            <input type="hidden" name="invoice_id" value="{{ $invoice['invoice_id'] }}">
                            
                            <div class="mb-3">
                                <label class="form-label">Select Payment Method</label>
                                
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="payment_method" id="bank_transfer" value="bank_transfer" checked>
                                    <label class="form-check-label" for="bank_transfer">
                                        <i class="fas fa-university me-1"></i> Bank Transfer
                                    </label>
                                </div>
                                
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="payment_method" id="e_wallet" value="e_wallet">
                                    <label class="form-check-label" for="e_wallet">
                                        <i class="fas fa-wallet me-1"></i> E-Wallet
                                    </label>
                                </div>
                                
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="payment_method" id="credit_card" value="credit_card">
                                    <label class="form-check-label" for="credit_card">
                                        <i class="fas fa-credit-card me-1"></i> Credit Card
                                    </label>
                                </div>
                            </div>
                            
                            <div class="d-grid">
                                <button type="submit" class="btn btn-success btn-lg">
                                    <i class="fas fa-money-bill-wave me-1"></i> Pay Now
                                </button>
                            </div>
                            
                            <div class="text-center mt-3 small text-muted">
                                <i class="fas fa-lock me-1"></i> Secured by Midtrans
                            </div>
                        </form>
                    </div>
                </div>
            @endif
            
            <!-- Payment Detail (if payment exists) -->
            @if($payment && $invoice['status'] != 'pending')
                <div class="card shadow mb-4">
                    <div class="card-header bg-info text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-info-circle me-2"></i> Payment Details
                        </h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush mb-3">
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Method:</span>
                                <span class="fw-bold">{{ ucfirst(str_replace('_', ' ', $payment['payment_method'])) }}</span>
                            </li>
                            @if($payment['payment_channel'])
                                <li class="list-group-item d-flex justify-content-between">
                                    <span>Channel:</span>
                                    <span>{{ ucfirst($payment['payment_channel']) }}</span>
                                </li>
                            @endif
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Status:</span>
                                <span class="badge 
                                    @if($payment['status'] == 'pending') bg-warning 
                                    @elseif($payment['status'] == 'success') bg-success 
                                    @elseif($payment['status'] == 'failed') bg-danger 
                                    @else bg-info @endif">
                                    {{ ucfirst($payment['status']) }}
                                </span>
                            </li>
                            @if($payment['transaction_id'])
                                <li class="list-group-item d-flex justify-content-between">
                                    <span>Transaction ID:</span>
                                    <span class="text-break">{{ $payment['transaction_id'] }}</span>
                                </li>
                            @endif
                            @if($payment['virtual_account'])
                                <li class="list-group-item d-flex justify-content-between">
                                    <span>Virtual Account:</span>
                                    <span>{{ $payment['virtual_account'] }}</span>
                                </li>
                            @endif
                            @if($payment['paid_at'])
                                <li class="list-group-item d-flex justify-content-between">
                                    <span>Paid at:</span>
                                    <span>{{ date('d M Y H:i', strtotime($payment['paid_at'])) }}</span>
                                </li>
                            @endif
                        </ul>
                        
                        @if($payment['status'] == 'pending' && $payment['payment_method'] == 'bank_transfer')
                            <div class="alert alert-info mb-3 small">
                                <i class="fas fa-info-circle me-1"></i> Please complete your payment before it expires.
                                @if($payment['expiry_time'])
                                    <br>Expires: {{ date('d M Y H:i', strtotime($payment['expiry_time'])) }}
                                @endif
                            </div>
                            <div class="d-grid gap-2">
                                @if($payment['qr_code_url'])
                                    <button class="btn btn-outline-primary" type="button" data-bs-toggle="modal" data-bs-target="#qrCodeModal">
                                        <i class="fas fa-qrcode me-1"></i> Show QR Code
                                    </button>
                                @endif
                                
                                <form action="{{ route('tenant.payment.status', $payment['payment_id']) }}" method="GET">
                                    <button type="submit" class="btn btn-outline-info w-100">
                                        <i class="fas fa-sync-alt me-1"></i> Check Payment Status
                                    </button>
                                </form>
                            </div>
                        @elseif($payment['status'] == 'pending' && $payment['payment_url'])
                            <div class="d-grid">
                                <a href="{{ $payment['payment_url'] }}" class="btn btn-primary" target="_blank">
                                    <i class="fas fa-external-link-alt me-1"></i> Complete Payment
                                </a>
                            </div>
                        @endif
                        
                        @if($payment['status'] == 'pending' && $payment['payment_method'] == 'bank_transfer')
                            <div class="mt-3 small">
                                <div class="fw-bold mb-1">How to pay:</div>
                                <ol class="ps-3">
                                    <li>Log in to your bank's mobile banking app or ATM</li>
                                    <li>Select transfer to virtual account</li>
                                    <li>Enter the virtual account number shown above</li>
                                    <li>Confirm the amount and complete the payment</li>
                                    <li>Keep your receipt for reference</li>
                                </ol>
                            </div>
                        @endif
                    </div>
                </div>
            @endif
            
            <!-- Contact Support -->
            <div class="card shadow">
                <div class="card-header bg-secondary text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-headset me-2"></i> Need Help?
                    </h5>
                </div>
                <div class="card-body">
                    <p>If you have any questions about this invoice or need assistance with payment, please contact our support team.</p>
                    <div class="d-grid">
                        <a href="#" class="btn btn-outline-secondary">
                            <i class="fas fa-envelope me-1"></i> Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- QR Code Modal -->
@if(isset($payment) && $payment['qr_code_url'])
<div class="modal fade" id="qrCodeModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Scan QR Code to Pay</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
                <img src="{{ $payment['qr_code_url'] }}" alt="Payment QR Code" class="img-fluid mb-3">
                <p>Scan this QR code using your banking app to complete the payment.</p>
                <div class="alert alert-warning small">
                    <i class="fas fa-info-circle me-1"></i> 
                    This payment will expire on {{ date('d M Y H:i', strtotime($payment['expiry_time'])) }}.
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
@endif
@endsection

@section('styles')
<style>
    @media print {
        header, footer, .breadcrumb, .col-md-4, .no-print {
            display: none !important;
        }
        .card {
            box-shadow: none !important;
            border: none !important;
        }
        .card-header {
            background-color: white !important;
            color: black !important;
        }
    }
</style>
@endsection
