import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import federation from '@originjs/vite-plugin-federation'; 
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8082,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 8082,
    strictPort: true,
  },
  plugins: [
    react(),
    federation({
      name: 'bybit-explorer',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
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
    outDir: '../cross-finance/public/bybit-explorer-mfe',
    // rollupOptions: {
    //   output: {
    //     manualChunks: undefined, // Disable manual chunks to avoid issues with top-level await
    //   },
    // },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext', // Ensure esbuild targets esnext
    },
  },
}));
