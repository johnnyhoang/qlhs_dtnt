import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Strict check for production build
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
    }
  }
})
