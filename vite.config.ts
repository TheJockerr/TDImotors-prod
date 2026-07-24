import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    // Reducir el tamaño del bundle dividiendo en chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
        },
      },
    },
    // Alerta si un chunk supera 500KB
    chunkSizeWarningLimit: 500,
    // Minificación activa
    minify: 'esbuild',
    // Source maps en producción para debugging (Vercel los oculta)
    sourcemap: false,
  },

  // Optimizaciones de desarrollo
  server: {
    port: 5173,
  },
});
