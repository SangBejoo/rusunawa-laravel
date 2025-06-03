// This is a simple bridge script to load React with proper ESM imports
// We'll use dynamic imports to handle module loading
async function loadReactApp() {
  try {
    console.log('Loading React application with ESM imports...');
    
    // Check if we have the React and ReactDOM globals from CDN
    if (!window.React || !window.ReactDOM) {
      console.log('Loading React from CDN...');
      // Load React from CDN if not available
      await Promise.all([
        loadScript('https://unpkg.com/react@18/umd/react.development.js'),
        loadScript('https://unpkg.com/react-dom@18/umd/react-dom.development.js')
      ]);
    }
    
    // Check for auth token in multiple sources
    const token = localStorage.getItem('tenant_token') || 
                  sessionStorage.getItem('tenant_token') || 
                  (window.appConfig && window.appConfig.authToken);
                  
    const tenantData = localStorage.getItem('tenant_data') || 
                      sessionStorage.getItem('tenant_data') ||
                      (window.appConfig && window.appConfig.tenant);
    
    // Store auth data in multiple locations for resilience
    if (token) {
      localStorage.setItem('tenant_token', token);
      sessionStorage.setItem('tenant_token', token);
    }
    
    if (tenantData) {
      localStorage.setItem('tenant_data', typeof tenantData === 'string' ? tenantData : JSON.stringify(tenantData));
      sessionStorage.setItem('tenant_data', typeof tenantData === 'string' ? tenantData : JSON.stringify(tenantData));
    }
    
    // Determine which component to load based on the current route
    const path = window.location.pathname;
    let component = null;
    
    if (path.includes('/tenant/dashboard')) {
      const { default: DashboardPage } = await import('./DashboardPage.jsx');
      component = DashboardPage;
    } 
    else if (path.includes('/tenant/profile')) {
      const { default: ProfilePage } = await import('./ProfilePage.jsx');
      component = ProfilePage;
    }
    else if (path.includes('/tenant/bookings')) {
      const { default: BookingHistoryPage } = await import('./BookingHistoryPage.jsx');
      component = BookingHistoryPage;
    }
    else if (path.includes('/tenant/invoices') || path.includes('/tenant/payments')) {
      const { default: PaymentPage } = await import('./PaymentPage.jsx');
      component = PaymentPage;
    }
    else if (path.includes('/rooms/') && !path.endsWith('/rooms/')) {
      const { default: RoomDetailPage } = await import('./RoomDetailPage.jsx.new');
      component = RoomDetailPage;
    }
    else {
      // Default to dashboard or not found
      const { default: NotFoundPage } = await import('./NotFoundPage.jsx');
      component = NotFoundPage;
    }
    
    // Load ChakraProvider
    const { default: ChakraProvider } = await import('./ChakraProvider.jsx');
    
    // Root element to mount the React app
    const rootEl = document.getElementById('app-root');
    if (!rootEl) {
      console.error('Root element not found');
      return;
    }
    
    console.log('Mounting component:', component.name);
    
    // Create a wrapper component to provide Chakra UI
    const App = () => {
      return React.createElement(
        ChakraProvider, 
        null, 
        React.createElement(component, { 
          isAuthenticated: !!token,
          tenantData: tenantData ? (typeof tenantData === 'string' ? JSON.parse(tenantData) : tenantData) : null
        })
      );
    };
    
    // Render the app
    ReactDOM.createRoot(rootEl).render(React.createElement(App));
    
  } catch (error) {
    console.error('Error loading React application:', error);
    document.getElementById('app-root').innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Failed to load application</h2>
        <p>${error.message}</p>
        <a href="/tenant/login-simple" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Go to Simple Login
        </a>
      </div>
    `;
  }
}

// Helper function to load a script
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Start loading the app
loadReactApp();