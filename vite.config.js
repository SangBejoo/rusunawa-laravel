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
            '@config': path.resolve(__dirname, './src/config'),
        }
    },
    server: {
        hmr: {
            host: 'localhost',
        },
        proxy: {
            // Always use your dev tunnel for backend API
            '/api': {
                target: 'https://qtd9x9cp-8001.asse.devtunnels.ms/v1',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
});
