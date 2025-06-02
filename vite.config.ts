import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      // Force HMR to work properly
      protocol: 'ws',
      host: 'localhost',
    },
    watch: {
      // Force file watching to work in Docker
      usePolling: true,
      interval: 500,
    },
  },
  plugins: [
    react(),
  ],
  css: {
    // Make CSS source maps visible
    devSourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Make sure Vite properly processes public assets
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
});
