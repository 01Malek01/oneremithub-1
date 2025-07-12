import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import federation from '@originjs/vite-plugin-federation'; // Import the plugin

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    proxy: {
      '/api/pesa': {
        target: 'https://api.pesapeer.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pesa/, ''),
      }
    },
    host: "::",
    port: 5001,
    allowedHosts: ['plankton-app-gd57a.ondigitalocean.app'] //added this    
  },
  plugins: [
    react(),
    federation({
      name: 'fx_compass_mfe', 
      filename: 'remoteEntry.js', 
      exposes: {
        './App': './src/App.tsx', 
      },
      shared: ['react', 'react-dom'], // Share common dependencies
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext', // Important for Module Federation
    minify: false, // Easier for debugging initially
    cssCodeSplit: false, // Helps manage CSS if needed
    outDir:'../cross-finance/public/fx-compass-mfe'
  },
}));

