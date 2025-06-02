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
                
                // Pages
                'public/js/LoginPage.jsx',
                'public/js/RegisterPage.jsx',
                'public/js/LandingPage.jsx',
                'public/js/RoomListPage.jsx',
                'public/js/RoomDetailPage.jsx',
                'public/js/DashboardPage.jsx',
                'public/js/BookingHistoryPage.jsx',
                'public/js/DocumentUploadPage.jsx',
                'public/js/PaymentPage.jsx',
                'public/js/NotFoundPage.jsx',
                'public/js/UnderDevelopmentPage.jsx',
                
                // Components
                'public/js/components/Navbar.jsx',
                'public/js/components/Footer.jsx',
                'public/js/components/ApiStatusAlert.jsx',
                'public/js/components/map/LocationPicker.jsx',
                
                // Utils
                'public/js/api.js',
                'public/js/app.js',
                'public/js/ChakraProvider.jsx',
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
            // Proxy API requests to Golang backend
            '^/v1/tenant/.*': {
                target: 'http://localhost:8001',
                changeOrigin: true
            },
            '/login': 'http://localhost:8000',
            '/register': 'http://localhost:8000'
        }
    }
});
