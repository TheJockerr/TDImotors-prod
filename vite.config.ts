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
        manualChunks: {
          // Vendor chunk: React + React DOM
          'vendor-react': ['react', 'react-dom'],
          // Router en chunk separado
          'vendor-router': ['react-router-dom'],
          // Supabase en chunk separado (carga en inicio)
          'vendor-supabase': ['@supabase/supabase-js'],
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
