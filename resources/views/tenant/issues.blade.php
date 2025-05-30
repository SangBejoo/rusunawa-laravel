@extends('layouts.app')

@section('title', 'Issues & Maintenance')

@section('content')
<div class="container">
    <h1 class="mb-4">
        <i class="fas fa-exclamation-circle me-2"></i> Issues & Maintenance
    </h1>
    
    <div class="row">
        <div class="col-lg-8">
            <div class="card shadow mb-4">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        <i class="fas fa-clipboard-list me-2"></i> Reported Issues
                    </h5>
                    <button type="button" class="btn btn-sm btn-light" data-bs-toggle="modal" data-bs-target="#reportIssueModal">
                        <i class="fas fa-plus-circle me-1"></i> Report Issue
                    </button>
                </div>
                <div class="card-body">
                    @if(count($issues) > 0)
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th width="15%">Date</th>
                                        <th width="15%">Room</th>
                                        <th width="40%">Description</th>
                                        <th width="15%">Status</th>
                                        <th width="15%">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($issues as $issue)
                                        <tr>
                                            <td>{{ date('d M Y', strtotime($issue['reported_at'])) }}</td>
                                            <td>{{ $issue['booking']['room']['name'] ?? 'Unknown' }}</td>
                                            <td>{{ \Illuminate\Support\Str::limit($issue['description'], 100) }}</td>
                                            <td>
                                                @if($issue['status'] == 'open')
                                                    <span class="badge bg-warning">Open</span>
                                                @elseif($issue['status'] == 'in_progress')
                                                    <span class="badge bg-info">In Progress</span>
                                                @elseif($issue['status'] == 'resolved')
                                                    <span class="badge bg-success">Resolved</span>
                                                @elseif($issue['status'] == 'closed')
                                                    <span class="badge bg-secondary">Closed</span>
                                                @else
                                                    <span class="badge bg-primary">{{ ucfirst(str_replace('_', ' ', $issue['status'])) }}</span>
                                                @endif
                                            </td>
                                            <td>
                                                <a href="{{ route('tenant.issue.show', $issue['issue_id']) }}" 
                                                   class="btn btn-sm btn-info">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <div class="text-center py-4">
                            <i class="fas fa-clipboard-check fa-3x text-muted mb-3"></i>
                            <p class="mb-0">You haven't reported any issues yet.</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
        
        <div class="col-lg-4">
            <div class="card shadow mb-4">
                <div class="card-header bg-info text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-info-circle me-2"></i> Issue Reporting Guide
                    </h5>
                </div>
                <div class="card-body">
                    <h6>When to report an issue:</h6>
                    <ul>
                        <li>Plumbing or water problems</li>
                        <li>Electrical issues</li>
                        <li>Broken furniture or appliances</li>
                        <li>HVAC (heating/cooling) failures</li>
                        <li>Security concerns</li>
                        <li>Structural damage</li>
                    </ul>
                    
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        For emergencies like fire, gas leak, or serious flooding, please contact emergency services immediately at <strong>112</strong> and then notify building management.
                    </div>
                </div>
            </div>
            
            <div class="card shadow">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-phone-alt me-2"></i> Contact Information
                    </h5>
                </div>
                <div class="card-body">
                    <p>For urgent maintenance issues that require immediate attention:</p>
                    <p class="mb-1">
                        <i class="fas fa-phone-alt me-2"></i> <strong>Maintenance:</strong> +62 123 4567 890
                    </p>
                    <p class="mb-1">
                        <i class="fas fa-envelope me-2"></i> <strong>Email:</strong> maintenance@rusunawa.ac.id
                    </p>
                    <p>
                        <i class="fas fa-clock me-2"></i> <strong>Hours:</strong> 8:00 AM - 10:00 PM, Daily
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Report Issue Modal -->
<div class="modal fade" id="reportIssueModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="{{ route('tenant.issue.create') }}" method="POST">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Report New Issue</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="booking_id" class="form-label">Select Room</label>
                        <select class="form-select @error('booking_id') is-invalid @enderror" id="booking_id" name="booking_id" required>
                            <option value="" selected disabled>Choose your booking</option>
                            @foreach($bookings as $booking)
                                <option value="{{ $booking['booking_id'] }}">
                                    {{ $booking['room']['name'] }} ({{ date('d M Y', strtotime($booking['start_date'])) }} - {{ date('d M Y', strtotime($booking['end_date'])) }})
                                </option>
                            @endforeach
                        </select>
                        @error('booking_id')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        
                        @if(count($bookings) == 0)
                            <div class="form-text text-danger">
                                You need an active room booking to report an issue.
                            </div>
                        @endif
                    </div>
                    
                    <div class="mb-3">
                        <label for="description" class="form-label">Description</label>
                        <textarea class="form-control @error('description') is-invalid @enderror" 
                                  id="description" name="description" rows="4" 
                                  placeholder="Please describe the issue in detail" required></textarea>
                        @error('description')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <div class="form-text">
                            Include details like: location in the room, when it started, any troubleshooting you've tried
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary" @if(count($bookings) == 0) disabled @endif>
                        <i class="fas fa-paper-plane me-1"></i> Submit Report
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
