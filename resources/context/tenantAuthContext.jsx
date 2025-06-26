import React, { createContext, useContext, useState, useEffect } from 'react';
import tenantAuthService from '../services/tenantAuthService';

// Create the context
const TenantAuthContext = createContext(null);

// Provider component
export const TenantAuthProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Get token from local storage
        const token = localStorage.getItem('tenant_token');
        
        if (!token) {
          setIsAuthenticated(false);
          setTenant(null);
          setIsLoading(false);
          return;
        }        // Verify token with backend
        const response = await tenantAuthService.verifyToken({ token });
        
        console.log('TenantAuth - Token verification response:', response);
        
        if (response.valid && response.tenant) {
          setIsAuthenticated(true);
          setTenant(response.tenant);
          console.log('TenantAuth - User authenticated:', response.tenant);
        } else {
          // Invalid token - clean up all auth-related localStorage
          setIsAuthenticated(false);
          setTenant(null);
          localStorage.removeItem('tenant_token');
          localStorage.removeItem('email_verified');
          console.log('TenantAuth - Invalid token, user logged out');
        }} catch (error) {
        console.error('Authentication error:', error);
        setError('Authentication failed. Please try again.');
        setIsAuthenticated(false);
        setTenant(null);
        localStorage.removeItem('tenant_token');
        localStorage.removeItem('email_verified');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Extract email and password from credentials
      const { email, password } = credentials;
      
      // Call the tenant auth service with credentials object
      const response = await tenantAuthService.login({ email, password });
        if (response.token && response.tenant) {
        localStorage.setItem('tenant_token', response.token);
        setIsAuthenticated(true);
        setTenant(response.tenant);
        console.log('TenantAuth - Login successful, user authenticated:', response.tenant);
        return { success: true, tenant: response.tenant };
      } else {
        setError('Login failed. Please check your credentials.');
        console.log('TenantAuth - Login failed, no token or tenant in response');
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      // Handle email verification error specifically
      if (error.message?.includes('not verified') || error.message?.includes('verification')) {
        const errorMessage = 'Email not verified. Please check your email for the verification link.';
        setError(errorMessage);
        return { success: false, error: errorMessage, needsVerification: true, email: credentials.email };
      }
      
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
    // Logout function
  const logout = () => {
    localStorage.removeItem('tenant_token');
    localStorage.removeItem('email_verified'); // Clear email verification status on logout
    setIsAuthenticated(false);
    setTenant(null);
  };
  
  // Register function
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await tenantAuthService.register(userData);
      
      if (response.tenant) {
        return { success: true, tenant: response.tenant };
      } else {
        setError('Registration failed.');
        return { success: false, error: 'Registration failed' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Provide all auth-related values to children
  const contextValue = {
    tenant,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register
  };

  return (
    <TenantAuthContext.Provider value={contextValue}>
      {children}
    </TenantAuthContext.Provider>
  );
};

// Create the hook to use the context
export const useTenantAuth = () => {
  const context = useContext(TenantAuthContext);
  
  if (!context) {
    throw new Error('useTenantAuth must be used within a TenantAuthProvider');
  }
  
  return context;
};
