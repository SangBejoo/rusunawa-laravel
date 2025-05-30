@extends('layouts.app')

@section('title', 'Issue Details')

@section('content')
<div class="container">
    <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('tenant.dashboard') }}">Dashboard</a></li>
            <li class="breadcrumb-item"><a href="{{ route('tenant.issues') }}">Issues</a></li>
            <li class="breadcrumb-item active" aria-current="page">Issue #{{ $issue['issue_id'] }}</li>
        </ol>
    </nav>
    
    <div class="row">
        <div class="col-md-8">
            <div class="card shadow mb-4">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        <i class="fas fa-exclamation-circle me-2"></i> Issue Report #{{ $issue['issue_id'] }}
                    </h5>
                    <span class="badge fs-6 
                        @if($issue['status'] == 'open') bg-warning 
                        @elseif($issue['status'] == 'in_progress') bg-info 
                        @elseif($issue['status'] == 'resolved') bg-success 
                        @elseif($issue['status'] == 'closed') bg-secondary 
                        @else bg-primary @endif">
                        {{ ucfirst(str_replace('_', ' ', $issue['status'])) }}
                    </span>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <p><strong>Reported Date:</strong> {{ date('d F Y', strtotime($issue['reported_at'])) }}</p>
                            <p><strong>Room:</strong> {{ $issue['booking']['room']['name'] ?? 'Unknown' }}</p>
                            <p><strong>Reported By:</strong> {{ $issue['reporter']['full_name'] ?? $tenant['user']['full_name'] }}</p>
                        </div>
                        <div class="col-md-6">
                            <p>
                                <strong>Status:</strong> 
                                <span class="badge 
                                    @if($issue['status'] == 'open') bg-warning 
                                    @elseif($issue['status'] == 'in_progress') bg-info 
                                    @elseif($issue['status'] == 'resolved') bg-success 
                                    @elseif($issue['status'] == 'closed') bg-secondary 
                                    @else bg-primary @endif">
                                    {{ ucfirst(str_replace('_', ' ', $issue['status'])) }}
                                </span>
                            </p>
                            @if($issue['status'] == 'resolved' || $issue['status'] == 'closed')
                                <p><strong>Resolved Date:</strong> {{ date('d F Y', strtotime($issue['resolved_at'])) }}</p>
                            @endif
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <h5>Issue Description</h5>
                        <div class="p-3 bg-light rounded">
                            <p>{{ $issue['description'] }}</p>
                        </div>
                    </div>
                    
                    <!-- Status Timeline -->
                    <div class="mb-4">
                        <h5>Status Timeline</h5>
                        <ul class="timeline">
                            <li class="timeline-item">
                                <div class="timeline-marker bg-primary"></div>
                                <div class="timeline-content">
                                    <h6 class="timeline-title">Issue Reported</h6>
                                    <p class="timeline-date">{{ date('d F Y, h:i A', strtotime($issue['reported_at'])) }}</p>
                                    <p>Your issue has been received and logged in our system.</p>
                                </div>
                            </li>
                            
                            @if($issue['status'] != 'open')
                                <li class="timeline-item">
                                    <div class="timeline-marker bg-info"></div>
                                    <div class="timeline-content">
                                        <h6 class="timeline-title">In Progress</h6>
                                        <p class="timeline-date">{{ date('d F Y', strtotime($issue['reported_at'] . ' +1 day')) }}</p>
                                        <p>Our maintenance team has been assigned to your issue and is working on it.</p>
                                    </div>
                                </li>
                            @endif
                            
                            @if($issue['status'] == 'resolved' || $issue['status'] == 'closed')
                                <li class="timeline-item">
                                    <div class="timeline-marker bg-success"></div>
                                    <div class="timeline-content">
                                        <h6 class="timeline-title">Issue Resolved</h6>
                                        <p class="timeline-date">{{ date('d F Y', strtotime($issue['resolved_at'])) }}</p>
                                        <p>The reported issue has been fixed by our maintenance team.</p>
                                    </div>
                                </li>
                            @endif
                            
                            @if($issue['status'] == 'closed')
                                <li class="timeline-item">
                                    <div class="timeline-marker bg-secondary"></div>
                                    <div class="timeline-content">
                                        <h6 class="timeline-title">Case Closed</h6>
                                        <p class="timeline-date">{{ date('d F Y', strtotime($issue['resolved_at'] . ' +1 day')) }}</p>
                                        <p>The case has been closed. If you're still experiencing issues, please submit a new report.</p>
                                    </div>
                                </li>
                            @endif
                        </ul>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="mt-4">
                        @if($issue['status'] == 'open' || $issue['status'] == 'in_progress')
                            <a href="{{ route('tenant.issues') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-1"></i> Back to Issues
                            </a>
                        @elseif($issue['status'] == 'resolved')
                            <div class="alert alert-success">
                                <div class="d-flex">
                                    <div class="me-3">
                                        <i class="fas fa-check-circle fa-2x"></i>
                                    </div>
                                    <div>
                                        <h5 class="alert-heading">Issue Resolved</h5>
                                        <p>The issue has been marked as resolved by our maintenance team. If you're satisfied with the resolution, no further action is needed.</p>
                                        <p>If you're still experiencing the same issue, please submit a new report with additional details.</p>
                                    </div>
                                </div>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-4">
            <!-- Maintenance Contact -->
            <div class="card shadow mb-4">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-phone-alt me-2"></i> Maintenance Contact
                    </h5>
                </div>
                <div class="card-body">
                    <p>If you need to provide additional information or have questions about your maintenance request:</p>
                    <ul class="list-unstyled">
                        <li class="mb-2">
                            <i class="fas fa-phone-alt me-2 text-success"></i> +62 123 4567 890
                        </li>
                        <li class="mb-2">
                            <i class="fas fa-envelope me-2 text-success"></i> maintenance@rusunawa.ac.id
                        </li>
                        <li>
                            <i class="fas fa-clock me-2 text-success"></i> Available: 8:00 AM - 10:00 PM, Daily
                        </li>
                    </ul>
                    <div class="alert alert-info mt-3 mb-0">
                        <i class="fas fa-info-circle me-1"></i>
                        When contacting, please reference Issue #{{ $issue['issue_id'] }}
                    </div>
                </div>
            </div>
            
            <!-- Related Issues -->
            <div class="card shadow">
                <div class="card-header bg-secondary text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-tools me-2"></i> Maintenance Tips
                    </h5>
                </div>
                <div class="card-body">
                    <h6>Common Troubleshooting:</h6>
                    <ul>
                        <li><strong>Electrical issues:</strong> Check circuit breakers first</li>
                        <li><strong>No hot water:</strong> Check if other rooms have the same issue</li>
                        <li><strong>Clogged sink/toilet:</strong> Try using a plunger before reporting</li>
                        <li><strong>HVAC problems:</strong> Check thermostat settings first</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('styles')
<style>
    .timeline {
        list-style-type: none;
        position: relative;
        padding-left: 30px;
        margin: 0;
    }
    
    .timeline:before {
        content: ' ';
        background: #dee2e6;
        display: inline-block;
        position: absolute;
        left: 9px;
        width: 2px;
        height: 100%;
        z-index: 1;
    }
    
    .timeline-item {
        margin: 2em 0;
        position: relative;
    }
    
    .timeline-marker {
        position: absolute;
        top: 5px;
        left: -30px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        z-index: 2;
    }
    
    .timeline-title {
        margin-top: 0;
        margin-bottom: 5px;
    }
    
    .timeline-date {
        color: #6c757d;
        font-size: 0.9em;
        margin-bottom: 10px;
    }
</style>
@endsection
