import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// base relativa: el mismo build sirve para Electron, GitHub Pages y cualquier servidor estático
export default defineConfig({
  base: './',
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'pdf/*.pdf'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,png}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024
      },
      manifest: {
        name: 'Curso ML: redes neuronales, deep learning, CNN y PINNs',
        short_name: 'Curso ML',
        description: 'Curso interactivo de machine learning y redes neuronales',
        lang: 'es',
        display: 'standalone',
        background_color: '#f3f5f8',
        theme_color: '#2f5bea',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }
        ]
      }
    })
  ]
});
