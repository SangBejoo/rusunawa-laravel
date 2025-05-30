@extends('layouts.app')

@section('title', 'My Invoices')

@section('content')
<div class="container">
    <h1 class="mb-4">
        <i class="fas fa-file-invoice-dollar me-2"></i> My Invoices
    </h1>

    <!-- Filter Options -->
    <div class="card shadow mb-4">
        <div class="card-body">
            <form action="{{ route('tenant.invoices') }}" method="GET" class="row g-3 align-items-end">
                <div class="col-md-3">
                    <label for="status" class="form-label">Filter by Status</label>
                    <select class="form-select" id="status" name="status">
                        <option value="" @if($status == '') selected @endif>All Statuses</option>
                        <option value="pending" @if($status == 'pending') selected @endif>Pending</option>
                        <option value="paid" @if($status == 'paid') selected @endif>Paid</option>
                        <option value="cancelled" @if($status == 'cancelled') selected @endif>Cancelled</option>
                        <option value="failed" @if($status == 'failed') selected @endif>Failed</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-filter me-1"></i> Apply Filters
                    </button>
                    <a href="{{ route('tenant.invoices') }}" class="btn btn-outline-secondary">
                        <i class="fas fa-undo me-1"></i> Reset
                    </a>
                </div>
            </form>
        </div>
    </div>

    <!-- Invoices List -->
    <div class="card shadow">
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
                <i class="fas fa-list me-2"></i> Invoices
            </h5>
        </div>
        <div class="card-body">
            @if(count($invoices) > 0)
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Invoice No.</th>
                                <th>Amount</th>
                                <th>Issue Date</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($invoices as $invoice)
                                <tr>
                                    <td>{{ $invoice['invoice_no'] }}</td>
                                    <td>Rp {{ number_format($invoice['amount'], 0, ',', '.') }}</td>
                                    <td>{{ date('d M Y', strtotime($invoice['issued_at'])) }}</td>
                                    <td>{{ date('d M Y', strtotime($invoice['due_date'])) }}</td>
                                    <td>
                                        @if($invoice['status'] == 'pending')
                                            <span class="badge bg-warning">Pending</span>
                                        @elseif($invoice['status'] == 'paid')
                                            <span class="badge bg-success">Paid</span>
                                        @elseif($invoice['status'] == 'cancelled')
                                            <span class="badge bg-secondary">Cancelled</span>
                                        @elseif($invoice['status'] == 'failed')
                                            <span class="badge bg-danger">Failed</span>
                                        @else
                                            <span class="badge bg-info">{{ ucfirst($invoice['status']) }}</span>
                                        @endif
                                    </td>
                                    <td>
                                        <a href="{{ route('tenant.invoice.show', $invoice['invoice_id']) }}" 
                                           class="btn btn-sm btn-info">
                                            <i class="fas fa-eye me-1"></i> View
                                        </a>
                                        
                                        @if($invoice['status'] == 'pending')
                                            <a href="{{ route('tenant.invoice.show', $invoice['invoice_id']) }}#pay" 
                                               class="btn btn-sm btn-success">
                                                <i class="fas fa-credit-card me-1"></i> Pay
                                            </a>
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                @if($totalCount > $perPage)
                    <div class="d-flex justify-content-center mt-4">
                        <nav aria-label="Page navigation">
                            <ul class="pagination">
                                @php
                                    $totalPages = ceil($totalCount / $perPage);
                                @endphp

                                <!-- Previous Page Link -->
                                @if($currentPage > 1)
                                    <li class="page-item">
                                        <a class="page-link" href="{{ route('tenant.invoices', ['page' => $currentPage - 1, 'status' => $status]) }}" aria-label="Previous">
                                            <span aria-hidden="true">&laquo;</span>
                                        </a>
                                    </li>
                                @else
                                    <li class="page-item disabled">
                                        <a class="page-link" href="#" aria-label="Previous">
                                            <span aria-hidden="true">&laquo;</span>
                                        </a>
                                    </li>
                                @endif

                                <!-- Page Links -->
                                @for($i = 1; $i <= $totalPages; $i++)
                                    <li class="page-item {{ $i == $currentPage ? 'active' : '' }}">
                                        <a class="page-link" href="{{ route('tenant.invoices', ['page' => $i, 'status' => $status]) }}">
                                            {{ $i }}
                                        </a>
                                    </li>
                                @endfor

                                <!-- Next Page Link -->
                                @if($currentPage < $totalPages)
                                    <li class="page-item">
                                        <a class="page-link" href="{{ route('tenant.invoices', ['page' => $currentPage + 1, 'status' => $status]) }}" aria-label="Next">
                                            <span aria-hidden="true">&raquo;</span>
                                        </a>
                                    </li>
                                @else
                                    <li class="page-item disabled">
                                        <a class="page-link" href="#" aria-label="Next">
                                            <span aria-hidden="true">&raquo;</span>
                                        </a>
                                    </li>
                                @endif
                            </ul>
                        </nav>
                    </div>
                @endif
            @else
                <div class="text-center py-4">
                    <i class="fas fa-file-invoice fa-3x text-muted mb-3"></i>
                    <p class="mb-0">You don't have any invoices yet.</p>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
