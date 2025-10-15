import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const alias = {};

try {
  require.resolve('@clerk/clerk-react');
} catch (error) {
  console.warn('[vite] @clerk/clerk-react not found. Using mock bindings.');
  alias['@clerk/clerk-react'] = resolve(__dirname, './src/mocks/clerk-react.js');
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias,
  },
  server: {
    port: 4000,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
