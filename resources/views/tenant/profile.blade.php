@extends('layouts.app')

@section('title', 'My Profile')

@section('content')
<div class="container">
    <h1 class="mb-4">
        <i class="fas fa-user-circle me-2"></i> My Profile
    </h1>
    
    <div class="row">
        <div class="col-md-4">
            <div class="card shadow mb-4">
                <div class="card-body text-center">
                    <div class="profile-image mb-3">
                        @if($tenant['gender'] == 'L')
                            <i class="fas fa-user-circle fa-6x text-primary"></i>
                        @else
                            <i class="fas fa-user-circle fa-6x text-danger"></i>
                        @endif
                    </div>
                    <h4>{{ $tenant['user']['full_name'] }}</h4>
                    <p class="text-muted">
                        {{ ucfirst(str_replace('_', ' ', $tenant['tenant_type']['name'])) }}
                    </p>
                    
                    @if(!empty($tenant['nim']))
                        <div class="text-muted mb-3">
                            <i class="fas fa-id-card me-2"></i> NIM: {{ $tenant['nim'] }}
                        </div>
                    @endif
                    
                    <div class="d-grid">
                        <button type="button" class="btn btn-outline-primary mb-2" data-bs-toggle="modal" data-bs-target="#editProfileModal">
                            <i class="fas fa-edit me-2"></i> Edit Profile
                        </button>
                        <button type="button" class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#changePasswordModal">
                            <i class="fas fa-key me-2"></i> Change Password
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="card shadow mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-info-circle me-2"></i> Profile Status
                    </h5>
                </div>
                <div class="card-body p-0">
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span>Profile Completion</span>
                            <span class="badge bg-success rounded-pill">100%</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span>Email Verified</span>
                            <span class="badge bg-success rounded-pill"><i class="fas fa-check"></i></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span>Phone Verified</span>
                            <span class="badge bg-warning rounded-pill"><i class="fas fa-times"></i></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span>Documents Verified</span>
                            @php
                                $documentsVerified = true; // Replace with actual logic based on document verification status
                            @endphp
                            @if($documentsVerified)
                                <span class="badge bg-success rounded-pill"><i class="fas fa-check"></i></span>
                            @else
                                <span class="badge bg-warning rounded-pill"><i class="fas fa-times"></i></span>
                            @endif
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="col-md-8">
            <div class="card shadow mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-user me-2"></i> Personal Information
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Full Name</div>
                        <div class="col-md-8">{{ $tenant['user']['full_name'] }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Email</div>
                        <div class="col-md-8">{{ $tenant['user']['email'] }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Phone</div>
                        <div class="col-md-8">{{ $tenant['phone'] }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Address</div>
                        <div class="col-md-8">{{ $tenant['address'] }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Gender</div>
                        <div class="col-md-8">{{ $tenant['gender'] == 'L' ? 'Laki-laki' : 'Perempuan' }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Tenant Type</div>
                        <div class="col-md-8">{{ ucfirst(str_replace('_', ' ', $tenant['tenant_type']['name'])) }}</div>
                    </div>
                    @if($tenant['tenant_type']['name'] === 'mahasiswa_putra' || $tenant['tenant_type']['name'] === 'mahasiswa_putri')
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Student ID (NIM)</div>
                        <div class="col-md-8">
                            {{ $tenant['nim'] ?? 'Not provided' }}
                            @if(empty($tenant['nim']))
                                <button type="button" class="btn btn-sm btn-outline-primary ms-2" data-bs-toggle="modal" data-bs-target="#updateNimModal">
                                    <i class="fas fa-plus-circle"></i> Add
                                </button>
                            @else
                                <button type="button" class="btn btn-sm btn-outline-primary ms-2" data-bs-toggle="modal" data-bs-target="#updateNimModal">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                            @endif
                        </div>
                    </div>
                    @endif
                    <div class="row">
                        <div class="col-md-4 fw-bold">Account Created</div>
                        <div class="col-md-8">{{ date('d F Y', strtotime($tenant['created_at'])) }}</div>
                    </div>
                </div>
            </div>
            
            <div class="card shadow mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-map-marker-alt me-2"></i> Home Location
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Coordinates</div>
                        <div class="col-md-8">
                            {{ $tenant['home_latitude'] }}, {{ $tenant['home_longitude'] }}
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Distance to Campus</div>
                        <div class="col-md-8">
                            {{ number_format($tenant['distance_to_campus'], 2) }} km
                        </div>
                    </div>
                    
                    <div id="location-map" class="border rounded" style="height: 300px;"></div>
                    
                    <div class="d-grid mt-3">
                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#updateLocationModal">
                            <i class="fas fa-edit me-2"></i> Update Home Location
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Edit Profile Modal -->
<div class="modal fade" id="editProfileModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="{{ route('tenant.profile.update') }}" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-header">
                    <h5 class="modal-title">Edit Profile</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="full_name" class="form-label">Full Name</label>
                        <input type="text" class="form-control @error('full_name') is-invalid @enderror" 
                               id="full_name" name="full_name" value="{{ old('full_name', $tenant['user']['full_name']) }}" 
                               required>
                        @error('full_name')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control @error('email') is-invalid @enderror" 
                               id="email" name="email" value="{{ old('email', $tenant['user']['email']) }}" 
                               required>
                        @error('email')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label for="phone" class="form-label">Phone</label>
                        <input type="text" class="form-control @error('phone') is-invalid @enderror" 
                               id="phone" name="phone" value="{{ old('phone', $tenant['phone']) }}" 
                               required>
                        @error('phone')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label for="address" class="form-label">Address</label>
                        <textarea class="form-control @error('address') is-invalid @enderror" 
                                  id="address" name="address" rows="2" required>{{ old('address', $tenant['address']) }}</textarea>
                        @error('address')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i> Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Change Password Modal -->
<div class="modal fade" id="changePasswordModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="{{ route('tenant.profile.update') }}" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-header">
                    <h5 class="modal-title">Change Password</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="current_password" class="form-label">Current Password</label>
                        <input type="password" class="form-control @error('current_password') is-invalid @enderror" 
                               id="current_password" name="current_password" required>
                        @error('current_password')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label for="password" class="form-label">New Password</label>
                        <input type="password" class="form-control @error('password') is-invalid @enderror" 
                               id="password" name="password" required>
                        @error('password')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <div class="form-text">Password must be at least 8 characters long.</div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="password_confirmation" class="form-label">Confirm New Password</label>
                        <input type="password" class="form-control" 
                               id="password_confirmation" name="password_confirmation" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-key me-1"></i> Change Password
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Update NIM Modal -->
<div class="modal fade" id="updateNimModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="{{ route('tenant.profile.nim') }}" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-header">
                    <h5 class="modal-title">Update Student ID (NIM)</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="nim" class="form-label">Student ID (NIM)</label>
                        <input type="text" class="form-control @error('nim') is-invalid @enderror" 
                               id="nim" name="nim" value="{{ old('nim', $tenant['nim']) }}" required>
                        @error('nim')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <div class="form-text">Enter your valid student identification number.</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i> Update NIM
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Update Location Modal -->
<div class="modal fade" id="updateLocationModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form action="{{ route('tenant.profile.location') }}" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-header">
                    <h5 class="modal-title">Update Home Location</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p class="mb-3">Click on the map to set your home location:</p>
                    <div id="modal-location-map" class="border rounded" style="height: 400px;"></div>
                    
                    <div class="row mt-3">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="home_latitude" class="form-label">Latitude</label>
                                <input type="text" class="form-control @error('home_latitude') is-invalid @enderror" 
                                       id="home_latitude" name="home_latitude" 
                                       value="{{ old('home_latitude', $tenant['home_latitude']) }}" required readonly>
                                @error('home_latitude')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="home_longitude" class="form-label">Longitude</label>
                                <input type="text" class="form-control @error('home_longitude') is-invalid @enderror" 
                                       id="home_longitude" name="home_longitude" 
                                       value="{{ old('home_longitude', $tenant['home_longitude']) }}" required readonly>
                                @error('home_longitude')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-map-marker-alt me-1"></i> Update Location
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize profile page map (read-only)
        const homeLatitude = {{ $tenant['home_latitude'] }};
        const homeLongitude = {{ $tenant['home_longitude'] }};
        
        const map = new google.maps.Map(document.getElementById('location-map'), {
            center: { lat: homeLatitude, lng: homeLongitude },
            zoom: 14,
        });
        
        new google.maps.Marker({
            position: { lat: homeLatitude, lng: homeLongitude },
            map: map,
            title: 'Your Home'
        });
        
        // Initialize modal map (editable)
        let modalMap;
        let modalMarker;
        
        const updateLocationModal = document.getElementById('updateLocationModal');
        updateLocationModal.addEventListener('shown.bs.modal', function () {
            modalMap = new google.maps.Map(document.getElementById('modal-location-map'), {
                center: { lat: homeLatitude, lng: homeLongitude },
                zoom: 14,
            });
            
            modalMarker = new google.maps.Marker({
                position: { lat: homeLatitude, lng: homeLongitude },
                map: modalMap,
                draggable: true,
                title: 'Your Home'
            });
            
            // Update coordinates when marker is dragged
            google.maps.event.addListener(modalMarker, 'dragend', function() {
                document.getElementById('home_latitude').value = modalMarker.getPosition().lat();
                document.getElementById('home_longitude').value = modalMarker.getPosition().lng();
            });
            
            // Add marker on click
            google.maps.event.addListener(modalMap, 'click', function(event) {
                modalMarker.setPosition(event.latLng);
                document.getElementById('home_latitude').value = event.latLng.lat();
                document.getElementById('home_longitude').value = event.latLng.lng();
            });
        });
    });
</script>
@endsection
