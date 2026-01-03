import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from './components/ui/sonner';
import { ContextProvider } from './context/ContesxtProvider';
import { initializeTheme } from './hooks/use-appearance';
import { configureEcho } from '@laravel/echo-react';

// configureEcho({
//     broadcaster: 'reverb',
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     wsHost: import.meta.env.VITE_REVERB_HOST,
//     wsPort: import.meta.env.VITE_REVERB_PORT,
//     wssPort: import.meta.env.VITE_REVERB_PORT,
//     forceTLS: false,
//     enabledTransports: ['ws', 'wss'],
// });

// configureEcho({
//     broadcaster: 'reverb',
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     wsHost: import.meta.env.VITE_REVERB_HOST,
//     wsPort: import.meta.env.VITE_REVERB_PORT ?? 443,
//     wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
//     forceTLS: true,
//     enabledTransports: ['ws', 'wss'],
// });
// console.log('VITE_REVERB_APP_KEY:', import.meta.env.VITE_REVERB_APP_KEY);
// console.log('VITE_REVERB_HOST:', import.meta.env.VITE_REVERB_HOST);
// console.log('VITE_REVERB_PORT:', import.meta.env.VITE_REVERB_PORT);

// const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const appName = 'Judging Tabulation';

// const queryClient = new QueryClient({
//     defaultOptions: {
//         queries: {
//             staleTime: 1000 * 60, // 1 minute
//             refetchOnWindowFocus: false,
//         },
//     },
// });

configureEcho({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
});
createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <>
                <Toaster richColors closeButton position="top-center" />
                <ContextProvider>
                    <App {...props} />
                </ContextProvider>
            </>,
        );
    },
    progress: {
        color: '#45226b',
    },
});

initializeTheme();
