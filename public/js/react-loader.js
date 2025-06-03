document.addEventListener('DOMContentLoaded', function() {
    // Check if the navbar root exists
    const navbarRoot = document.getElementById('navbar-root');
    if (navbarRoot) {
        // Import the React libraries and components dynamically
        Promise.all([
            import('/vendor/react/umd/react.development.js'),
            import('/vendor/react-dom/umd/react-dom.development.js'),
            import('/js/components/Navbar.jsx')
        ]).then(([React, ReactDOM, NavbarModule]) => {
            const Navbar = NavbarModule.default;
            ReactDOM.createRoot(navbarRoot).render(React.createElement(Navbar));
        }).catch(error => {
            console.error('Error loading React components:', error);
            navbarRoot.innerHTML = '<nav class="navbar navbar-dark bg-primary"><div class="container"><a class="navbar-brand" href="/">Rusunawa</a></div></nav>';
        });
    }
});
