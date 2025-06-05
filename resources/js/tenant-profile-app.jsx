import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Define the theme with brand colors
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#badcfb',
      200: '#8fc5f5',
      300: '#62adf0',
      400: '#3f99eb',
      500: '#1c85e8', // Primary brand color
      600: '#0e6cc5',
      700: '#0052a2',
      800: '#003a7d',
      900: '#00235b',
    },
  },
  fonts: {
    heading: '"Nunito", sans-serif',
    body: '"Nunito", sans-serif',
  },
});

// Simple Profile Component
function TenantProfile() {
    const [tenant, setTenant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load tenant data from localStorage
        try {
            const tenantDataStr = localStorage.getItem('tenant_data');
            if (tenantDataStr) {
                const data = JSON.parse(tenantDataStr);
                setTenant(data);
                setIsLoading(false);
            }
        } catch (e) {
            console.error("Error loading tenant data:", e);
        }

        // Fetch from API
        const token = localStorage.getItem('tenant_token');
        if (!token) {
            setError("Authentication required. Please log in.");
            setIsLoading(false);
            return;
        }

        axios.get('http://localhost:8003/v1/tenant/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.data && response.data.tenant) {
                setTenant(response.data.tenant);
                localStorage.setItem('tenant_data', JSON.stringify(response.data.tenant));
            }
        })
        .catch(err => {
            console.error("API error:", err);
            setError("Failed to load profile data. Please try again.");
            
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('tenant_token');
                localStorage.removeItem('tenant_data');
                
                setTimeout(() => {
                    window.location.href = '/tenant/login?redirect=/tenant/profile';
                }, 1500);
            }
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
            <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading your profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-warning">
                <h5>Error</h5>
                <p>{error}</p>
                <div className="mt-3">
                    <a href="/tenant/login?redirect=/tenant/profile" className="btn btn-primary">Log In</a>
                    <a href="/" className="btn btn-outline-secondary ms-2">Back to Home</a>
                </div>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="alert alert-warning">
                <h5>No Profile Data</h5>
                <p>Unable to find your profile information.</p>
                <div className="mt-3">
                    <a href="/tenant/login?redirect=/tenant/profile" className="btn btn-primary">Log In</a>
                    <a href="/" className="btn btn-outline-secondary ms-2">Back to Home</a>
                </div>
            </div>
        );
    }

    // Format functions
    const formatGender = (code) => {
        if (code === 'L') return 'Male';
        if (code === 'P') return 'Female';
        return code || 'Unknown';
    };
    
    const formatTenantType = (type) => {
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
    };

    return (
        <div className="container my-5">
            <div className="card shadow mb-4">
                <div className="card-header bg-primary text-white">
                    <h3>Tenant Profile</h3>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-12">
                            <h4>{tenant.name}</h4>
                            <div className="d-flex flex-wrap">
                                <span className="badge bg-success me-2">{formatTenantType(tenant.tenant?.tenantType || tenant.tenantType)}</span>
                                <span className={`badge ${tenant.gender === 'L' ? 'bg-primary' : 'bg-danger'} me-2`}>{formatGender(tenant.gender)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="row mt-4">
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <h5>Contact Information</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong>Email:</strong> {tenant.email || '-'}
                                    </div>
                                    <div className="mb-3">
                                        <strong>Phone:</strong> {tenant.phone || '-'}
                                    </div>
                                    <div>
                                        <strong>Address:</strong> {tenant.address || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <h5>Academic Information</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong>Type:</strong> {formatTenantType(tenant.tenant?.tenantType || tenant.tenantType)}
                                    </div>
                                    {(tenant.nim || tenant.tenant?.nim) && (
                                        <div className="mb-3">
                                            <strong>NIM:</strong> {tenant.nim || tenant.tenant?.nim || '-'}
                                        </div>
                                    )}
                                    <div>
                                        <strong>Joined:</strong> {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-4">
                <a href="/" className="btn btn-outline-secondary">Back to Home</a>
            </div>
        </div>
    );
}

// App component with authentication redirect
const TenantProfileApp = () => {
  // Store authentication status in state
  const [authChecked, setAuthChecked] = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    // Check authentication on load
    const authStatus = isAuthenticated();
    setAuthenticated(authStatus);
    setAuthChecked(true);

    // If not authenticated, redirect to login
    if (!authStatus) {
      console.log("Not authenticated, redirecting to login...");
      setTimeout(() => {
        window.location.href = '/tenant/login?redirect=/tenant/profile';
      }, 500); // Small delay to allow rendering of message
    }
  }, []);

  // Show loading state until auth check completes
  if (!authChecked) {
    return <div className="text-center p-5">Checking authentication...</div>;
  }

  // Show not authenticated message briefly before redirect
  if (!authenticated) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning">
          <h4>Authentication Required</h4>
          <p>Please log in to view your profile.</p>
          <p>Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  // Show the actual profile if authenticated
  return (
    <>
      <Navbar />
      <TenantProfile />
      <Footer />
    </>
  );
};

// Initialize the app when the DOM is loaded
const initializeProfileApp = () => {
  const profileRoot = document.getElementById('profile-root');
  
  if (!profileRoot) {
    console.error('Profile root element not found! App cannot be mounted.');
    return;
  }
  
  try {
    console.log('Mounting React tenant profile component...');
    createRoot(profileRoot).render(
      <ChakraProvider theme={theme}>
        <TenantProfileApp />
      </ChakraProvider>
    );
    console.log('React tenant profile component mounted successfully');
  } catch (error) {
    console.error('Error mounting React component:', error);
  }
};

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProfileApp);
} else {
  initializeProfileApp();
}
