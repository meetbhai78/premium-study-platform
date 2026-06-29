import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Sourcemap off in production — security + smaller bundle
    sourcemap: false,
    // Inline assets under 4kb for faster first paint (Core Web Vitals)
    assetsInlineLimit: 4096,
    // Split vendor chunks for better caching — boosts Lighthouse performance score
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'ui-vendor';
          }
          if (id.includes('node_modules/react-helmet-async') || id.includes('node_modules/helmet')) {
            return 'helmet';
          }
        },
      },
    },
  },
})
