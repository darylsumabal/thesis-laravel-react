import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import os from 'os';
import { defineConfig } from 'vite';

function getLocalIP() {
    const nets = os.networkInterfaces();
    let fallback = null;
    for (const iface of Object.values(nets)) {
        for (const net of iface) {
            if (net.family === 'IPv4' && !net.internal) {
                if (net.address.startsWith('192.')) {
                    return net.address;
                }
                fallback = net.address;
            }
        }
    }
    return 'localhost';
}

const localIP = getLocalIP();

export default defineConfig({
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
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    server: {
        host: '0.0.0.0',
        hmr: {
            host: localIP,
        },
    },
});
