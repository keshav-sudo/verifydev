import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_URL || env.VITE_GATEWAY_URL || 'http://localhost:80'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      port: 3000,
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false, // Disable sourcemaps for production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console logs
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // UI Components
            'ui-radix': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast', '@radix-ui/react-select'],
            // Charts (lazy load)
            'charts': ['recharts'],
            // Lottie (lazy load)
            'lottie': ['@lottiefiles/react-lottie-player'],
            // Framer Motion
            'motion': ['framer-motion'],
          },
          // Optimize chunk names
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },
  }
})
