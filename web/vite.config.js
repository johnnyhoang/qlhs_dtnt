import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  if (mode === 'production') {
    if (!env.VITE_API_URL) {
      throw new Error('VITE_API_URL is missing in production build environment');
    }
    if (!env.VITE_GOOGLE_CLIENT_ID) {
      throw new Error('VITE_GOOGLE_CLIENT_ID is missing in production build environment');
    }
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined;
            }

            if (id.includes('@tanstack/react-query') || id.includes('axios')) {
              return 'vendor-data';
            }

            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }

            if (id.includes('@react-oauth/google')) {
              return 'vendor-google';
            }
            
            return undefined;
          },
        },
      },
    },
  };
});
