/**
 * vite.config.ts - Vite Build Configuration
 * 
 * Configures the build process for optimal performance
 * and developer experience.
 * 
 * Key features:
 * - Path aliases for clean imports
 * - PWA plugin for offline support
 * - Bundle analysis
 * - Optimized chunking
 * - Environment variable handling
 * 
 * Related files:
 * - tsconfig.json: TypeScript paths
 * - package.json: Build scripts
 * - index.html: Entry point
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isAnalyze = mode === 'analyze'
  
  return {
    plugins: [
      react({
        // Enable React Refresh
        fastRefresh: true,
        // Emotion babel plugin for CSS-in-JS
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
      
      // PWA Configuration
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'upVoice - AI Discussion Platform',
          short_name: 'upVoice',
          description: 'Transform group discussions into AI-powered insights',
          theme_color: '#2E90FA',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Cache strategies
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'firestore-cache',
                networkTimeoutSeconds: 10,
              },
            },
          ],
        },
      }),
      
      // Bundle analyzer
      isAnalyze && visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    
    // Path aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@services': path.resolve(__dirname, './src/services'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@types': path.resolve(__dirname, './src/types'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@config': path.resolve(__dirname, './src/config'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@pages': path.resolve(__dirname, './src/pages'),
      },
    },
    
    // Development server
    server: {
      port: 3000,
      open: true,
      host: true, // Listen on all addresses
    },
    
    // Build optimization
    build: {
      target: 'es2020',
      sourcemap: mode === 'development',
      
      // Chunking strategy
      rollupOptions: {
        output: {
          manualChunks: {
            // React core
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            
            // Firebase SDK
            'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions'],
            
            // UI libraries
            'ui-vendor': ['@untitled-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
            
            // Utilities
            'utils-vendor': ['date-fns', 'uuid', 'zustand'],
          },
        },
      },
      
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
    },
    
    // Environment variables
    envPrefix: 'VITE_',
  }
})