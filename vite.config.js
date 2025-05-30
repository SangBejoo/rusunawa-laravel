import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                'register-app': resolve(__dirname, 'public/js/register-app.jsx'),
                'DistancePicker': resolve(__dirname, 'public/js/DistancePicker.jsx'),
            },
            output: {
                entryFileNames: 'js/[name].js',
                chunkFileNames: 'js/[name].js',
                assetFileNames: 'css/[name].[ext]',
            },
        },
        outDir: 'public/build',
        emptyOutDir: true,
    },
    publicDir: false,
});
