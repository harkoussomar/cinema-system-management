import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    base: '/',
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
        legalComments: 'none',
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    server: {
        hmr: {
            host: 'localhost',
        },
        cors: true,
        strictPort: true,
        port: 5173,
    },
    build: {
        cssCodeSplit: true,
        reportCompressedSize: false,
        chunkSizeWarningLimit: 1000,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // SSR build will handle this differently automatically
                    if (id.includes('node_modules')) {
                        if (id.includes('@inertiajs')) {
                            return 'vendor';
                        }
                        if (id.includes('framer-motion') || id.includes('@heroicons')) {
                            return 'ui';
                        }
                    }
                    return null;
                },
            },
        },
    },
});
