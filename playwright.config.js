// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Les tests utilisent le Chrome installé sur le poste (channel « chrome »).
 * Aucun navigateur n'est téléchargé : pas de dépendance au CDN de Playwright derrière le proxy.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
