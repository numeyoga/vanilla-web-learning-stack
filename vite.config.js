// @ts-check
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    // Cible : un Chrome récent uniquement (pas de transpilation vers d'anciens navigateurs).
    target: 'chrome130',
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
