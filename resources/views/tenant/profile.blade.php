@extends('layouts.app')

@section('title', 'My Profile - Rusunawa Tenant Portal')

@section('meta')
<meta name="csrf-token" content="{{ csrf_token() }}">
@endsection

@section('content')
<div id="profile-root">
    <!-- Fallback content while React loads or if it fails -->
    <div class="container my-5">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h3>Tenant Profile</h3>
            </div>
            <div class="card-body">
                <div class="text-center mb-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading your profile...</p>
                </div>
                <div id="profile-data-container">
                    <!-- Profile data will be loaded here by JavaScript -->
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<!-- Use regular script tags instead of Vite -->
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Simple profile display without requiring React/Vite compilation
    const profileContainer = document.getElementById('profile-data-container');
    
    // Try to get tenant data from localStorage
    let tenant = null;
    try {
        const tenantData = localStorage.getItem('tenant_data');
        if (tenantData) {
            tenant = JSON.parse(tenantData);
            displayProfile(tenant);
        } else {
            showAuthError("No profile data found. Please log in again.");
        }
    } catch (e) {
        console.error("Error loading tenant data:", e);
        showAuthError("Error loading profile data. Please log in again.");
    }
    
    // Also try to fetch fresh data from API
    if (tenant) {
        fetchProfileFromApi();
    }
    
    function fetchProfileFromApi() {
        const token = localStorage.getItem('tenant_token');
        if (!token) return;
        
        axios.get('http://localhost:8001/v1/tenant/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.data && response.data.tenant) {
                const profileData = response.data.tenant;
                localStorage.setItem('tenant_data', JSON.stringify(profileData));
                displayProfile(profileData);
            }
        })
        .catch(error => {
            console.error("Error fetching profile:", error);
            if (error.response && error.response.status === 401) {
                showAuthError("Your session has expired. Please log in again.");
                
                // Clear invalid token and redirect to login
                localStorage.removeItem('tenant_token');
                localStorage.removeItem('tenant_data');
                
                setTimeout(() => {
                    window.location.href = '/tenant/login?redirect=/tenant/profile';
                }, 2000);
            }
        });
    }
    
    function displayProfile(data) {
        // Hide spinner
        document.querySelector('.spinner-border').style.display = 'none';
        document.querySelector('.spinner-border').nextElementSibling.style.display = 'none';
        
        // Render profile with Bootstrap
        profileContainer.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-12">
                    <h4>${data.name || 'Unnamed Tenant'}</h4>
                    <div class="d-flex flex-wrap">
                        <span class="badge bg-success me-2">${formatTenantType(data.tenant?.tenantType || data.tenantType)}</span>
                        <span class="badge ${data.gender === 'L' ? 'bg-primary' : 'bg-danger'} me-2">${formatGender(data.gender)}</span>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>Contact Information</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <strong>Email:</strong> ${data.email || '-'}
                            </div>
                            <div class="mb-3">
                                <strong>Phone:</strong> ${data.phone || '-'}
                            </div>
                            <div>
                                <strong>Address:</strong> ${data.address || '-'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>Academic Information</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <strong>Type:</strong> ${formatTenantType(data.tenant?.tenantType || data.tenantType)}
                            </div>
                            ${data.nim || (data.tenant?.nim) ? `
                            <div class="mb-3">
                                <strong>NIM:</strong> ${data.nim || data.tenant?.nim || '-'}
                            </div>
                            ` : ''}
                            <div>
                                <strong>Joined:</strong> ${data.created_at ? new Date(data.created_at).toLocaleDateString() : '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4">
                <a href="/" class="btn btn-outline-secondary">Back to Home</a>
            </div>
        `;
    }
    
    function showAuthError(message) {
        profileContainer.innerHTML = `
            <div class="alert alert-warning">
                <h5>Authentication Required</h5>
                <p>${message}</p>
                <div class="mt-3">
                    <a href="/tenant/login?redirect=/tenant/profile" class="btn btn-primary">Log In</a>
                    <a href="/" class="btn btn-outline-secondary ms-2">Back to Home</a>
                </div>
            </div>
        `;
    }
    
    function formatGender(code) {
        if (code === 'L') return 'Male';
        if (code === 'P') return 'Female';
        return code || 'Unknown';
    }
    
    function formatTenantType(type) {
        if (!type) return 'Unknown';
        
        if (typeof type === 'string') {
            if (type.toLowerCase() === 'mahasiswa') return 'Student';
            if (type.toLowerCase() === 'non_mahasiswa' || type.toLowerCase() === 'non-mahasiswa') return 'Non-Student';
            return type;
        }
        
        if (typeof type === 'object' && type !== null && type.name) {
            if (type.name.toLowerCase() === 'mahasiswa') return 'Student';
            if (type.name.toLowerCase() === 'non_mahasiswa' || type.name.toLowerCase() === 'non-mahasiswa') return 'Non-Student';
            return type.name;
        }
        
        return 'Unknown';
    }
});
</script>
@endsection
