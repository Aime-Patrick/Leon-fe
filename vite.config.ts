import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
   server: {
    proxy: {
      '/api': {
        target: 'https://fa48-2c0f-eb68-64f-b100-6111-67b7-93f7-c8e4.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
