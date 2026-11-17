import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const apiPort = Number(process.env.TRIPMATE_API_PORT || 4011);
const apiProxy = { '/api': `http://127.0.0.1:${apiPort}` };
const inlineApiApp = process.env.TRIPMATE_INLINE_API === '1'
  ? (await import('../server/server.js')).app
  : null;
const inlineApi = {
  name: 'tripmate-inline-preview-api',
  configurePreviewServer(server) {
    if (!inlineApiApp) return;
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api' || req.url?.startsWith('/api/')) return inlineApiApp(req, res, next);
      next();
    });
    console.log('TripMate API is mounted in the preview server.');
  },
};

export default defineConfig({
  plugins: [react(), inlineApi],
  server: { port: 5173, proxy: apiProxy },
  preview: { port: 5173, host: '0.0.0.0', proxy: apiProxy },
});
