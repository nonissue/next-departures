/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        coverage: { enabled: true },
        open: true,
        ui: true,
    },
});
