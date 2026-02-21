import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      headers: {
        'Content-Security-Policy':
          "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
          "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
          "style-src * 'unsafe-inline'; " +
          "img-src * data: blob:; " +
          "font-src * data:; " +
          "connect-src * ws: wss:;"
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GITHUB_USERNAME': JSON.stringify(env.GITHUB_USERNAME),
      'process.env.NOSTR_NPUB': JSON.stringify(env.NOSTR_NPUB)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
