import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5175,
    proxy: {
      '/api/connpass': {
        target: 'https://connpass.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/connpass/, '/api/v2/events/'),
      },
    },
  },
})
