import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;
const PORT = 3000;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI ? [['html', { open: 'never' }], ['github']] : [['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  // Anchored testMatch per project: no open pattern (spec §5.2).
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts$/ },
    {
      name: 'public',
      testMatch: /e2e\/public\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
    { name: 'api', testMatch: /api\/contract\.spec\.ts$/ },
    {
      name: 'client',
      testMatch: /e2e\/client\.spec\.ts$/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: '.auth/client.json' },
    },
  ],
  // E2E always run against the deterministic mock (decision D4).
  webServer: {
    command: 'npm start',
    url: `http://localhost:${PORT}`,
    env: { MODE: 'mock', PORT: String(PORT) },
    reuseExistingServer: !CI,
  },
});
