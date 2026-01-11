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
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        // Allow eval for Lottie (it's safe in this context)
        mangle: {
          safari10: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-radix': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast', '@radix-ui/react-select'],
            'charts': ['recharts'],
            'lottie': ['@lottiefiles/react-lottie-player'],
            'motion': ['framer-motion'],
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
        // Suppress eval warnings for Lottie
        onwarn(warning, warn) {
          if (warning.code === 'EVAL' && warning.id?.includes('lottie')) {
            return
          }
          warn(warning)
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  }
})
