import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // FIX: proxy ALL /api requests (including file downloads) to Flask.
      // This means the browser never makes a cross-origin request —
      // it always talks to localhost:3000, and Vite forwards to :5000
      // behind the scenes. This eliminates CORS as a source of failure
      // entirely, including for blob/file downloads.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Important for binary file streaming (PDFs, DOCX):
        // don't buffer/transform the response body
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Ensure Content-Disposition and Content-Type pass through untouched
            delete proxyRes.headers['content-encoding']
          })
        },
      },
    },
  },
})