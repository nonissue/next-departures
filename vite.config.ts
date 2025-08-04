import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [react(), tsconfigPaths(), tailwindcss()],
    server: {
        proxy: {
            '/api': 'http://localhost:3000',
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: 'dist/client', // this is where your static files will go
        emptyOutDir: true,
    },
});
