import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '言語解析AI',
        short_name: '言語解析AI',
        description: '独自絵文字言語をカメラで撮影し、その場で日本語に変換するPWA',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,onnx,wasm}'],
        maximumFileSizeToCacheInBytes: 16 * 1024 * 1024,
      },
    }),
  ],
})
