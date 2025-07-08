import { defineConfig } from 'vite'

export default defineConfig({
  // Build optimizations
  build: {
    // Generate source maps for debugging in production
    sourcemap: true,
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Firebase into its own chunk
          firebase: ['firebase/app', 'firebase/firestore'],
        }
      }
    },
    
    // Minify for production
    minify: 'esbuild',
    
    // Target modern browsers for better optimization
    target: 'es2020'
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    open: true
  },
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  }
})
