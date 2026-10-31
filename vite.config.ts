import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/sepay': {
        target: 'https://my.sepay.vn/userapi',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sepay/, ''),
      },
    },
  },
});
