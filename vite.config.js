import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'public/js/register-app.jsx',
                'public/js/DistancePicker.jsx',
                'public/js/landing-app.jsx',
                'public/js/LandingPage.jsx',
                'public/js/RoomListPage.jsx',
                'public/js/NotFoundPage.jsx',
                'public/js/UnderDevelopmentPage.jsx',
                'public/js/components/Navbar.jsx',
                'public/js/components/Footer.jsx',
                'public/js/ChakraProvider.jsx'
            ],
            refresh: true,
        }),
        react(),
    ],
});
