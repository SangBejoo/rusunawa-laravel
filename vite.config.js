import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                // CSS
                'public/css/app.css',
                
                // Main entry points
                'public/js/register-app.jsx',
                'public/js/login-app.jsx',
                'public/js/landing-app.jsx',
                'public/js/rooms-list-app.jsx',
                'public/js/room-detail-app.jsx',
               
                // Pages
                'public/js/LoginPage.jsx',
                'public/js/RegisterPage.jsx',
                'public/js/LandingPage.jsx',
                'public/js/RoomDetailPage.jsx',
                'public/js/NotFoundPage.jsx',
                'public/js/UnderDevelopmentPage.jsx',
                
                // Components
                'public/js/components/Navbar.jsx',
                'public/js/components/Footer.jsx',
                'public/js/components/HeroSection.jsx',
                'public/js/components/SearchPanel.jsx',
                'public/js/components/RoomList.jsx',
                'public/js/components/FeaturesSection.jsx',
                'public/js/components/ApiStatusAlert.jsx',
                'public/js/components/map/LocationPicker.jsx',
                
                // Utils
                'public/js/api.js',
                'public/js/app.js',
                'public/js/auth-sync.js',
      
            ],
            refresh: true,
        }),
        react(),
    ],
    build: {
        outDir: 'public/build',
        assetsDir: 'assets',
        manifest: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', '@chakra-ui/react', 'axios', 'react-icons'],
                    map: ['leaflet', 'react-leaflet'],
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'public/js'),
            '@components': resolve(__dirname, 'public/js/components'),
            '@pages': resolve(__dirname, 'public/js/pages'),
        }
    },
    server: {
        proxy: {
            // Proxy API requests to Golang backend - update to include all v1 routes
            '^/v1/': {
                target: 'http://localhost:8001',
                changeOrigin: true,
                secure: false
            },
            // Login endpoint specific proxy
            '/v1/tenant/auth/login': {
                target: 'http://localhost:8001',
                changeOrigin: true,
                secure: false
            },
            // Keep existing proxies
            '/login': 'http://localhost:8000',
            '/register': 'http://localhost:8000'
        },
        cors: true // Enable CORS for development
    }
});
