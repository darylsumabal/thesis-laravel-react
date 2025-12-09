import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from './components/ui/sonner';
import { ContextProvider } from './context/ContesxtProvider';
import { initializeTheme } from './hooks/use-appearance';

configureEcho({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
});

// const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute
            refetchOnWindowFocus: false,
        },
    },
});
createInertiaApp({
    // title: (title) => `${title} - ${appName}`,
    title: (title) => `${title} - Judging Tabulation`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <QueryClientProvider client={queryClient}>
                <Toaster richColors closeButton position="top-center" />
                <ContextProvider>
                    <App {...props} />
                </ContextProvider>
            </QueryClientProvider>,
        );
    },
    progress: {
        color: '#45226b',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// "dev": "npx concurrently -c \"#93c5fd,#c4b5fd,#fdba74\" \"php artisan serve --host=192.168.1.38 --port=8000\" \"php artisan queue:listen --tries=1\" \"npm run dev\" --names='server,queue,vite'"
// }

// "Composer\\Config::disableProcessTimeout",
//             "npx concurrently -c \"#93c5fd,#c4b5fd,#fdba74\" \"php artisan serve\" \"php artisan queue:listen --tries=1\" \"npm run dev\" --names='server,queue,vite'"
