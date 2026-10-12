import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths({ projects: ['./tsconfig.app.json', './tsconfig.json'] }),
    checker({
      typescript: true,
      overlay: {
        initialIsOpen: 'error',
        position: 'bl',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      anonymous: path.resolve(__dirname, './src/anonymous'),
      auth: path.resolve(__dirname, './src/auth'),
      shared: path.resolve(__dirname, './src/shared'),
      config: path.resolve(__dirname, './src/config'),
      apis: path.resolve(__dirname, './src/apis'),
      services: path.resolve(__dirname, './src/services'),
      types: path.resolve(__dirname, './src/types'),
      demo: path.resolve(__dirname, './src/demo'),
    },
  },
  server: {
    host: true,
    port: 3000,
    open: true,
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('primereact') || id.includes('primeicons')) {
              return 'vendor-primereact';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            if (id.includes('@tanstack')) {
              return 'vendor-tanstack';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor-core';
          }
        },
      },
    },
  },
});
