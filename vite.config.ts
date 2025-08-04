import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
        tailwindcss(),
        sentryVitePlugin({
            org: 'andy-williams',
            project: 'next-departures',
        }),
    ],
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
        // this is where your static files will go
        outDir: 'dist/client',

        emptyOutDir: true,
        sourcemap: true,
    },
});
