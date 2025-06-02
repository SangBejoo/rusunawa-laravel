import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'public/js/register-app.jsx',
                'public/js/DistancePicker.jsx'
            ],
            refresh: true,
        }),
        react(),
    ],
});
