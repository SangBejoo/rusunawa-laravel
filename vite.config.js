import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.jsx', 'resources/css/app.css'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources'),
            '@components': path.resolve(__dirname, './resources/components'),
            '@pages': path.resolve(__dirname, './resources/pages'),
            '@hooks': path.resolve(__dirname, './resources/hooks'),
            '@services': path.resolve(__dirname, './resources/services'),
            '@utils': path.resolve(__dirname, './resources/utils'),
            '@assets': path.resolve(__dirname, './resources/assets'),
            '@context': path.resolve(__dirname, './resources/context'),
        }
    },
    server: {
        hmr: {
            host: 'localhost',
        },
        proxy: {
            '/api': {
                target: process.env.VITE_API_BASE_URL || 'http://localhost:8001/v1',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
});
