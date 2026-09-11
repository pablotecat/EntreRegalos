import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'api', testDir: './tests/api', use: { baseURL: 'http://127.0.0.1:3101' } },
    { name: 'ui', testDir: './tests/ui', use: { ...devices['Desktop Chrome'] } },
    { name: 'e2e', testDir: './tests/e2e', use: { ...devices['Desktop Chrome'] } },
    { name: 'e2e-mobile', testDir: './tests/e2e', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      command: 'node tests/start-backend.cjs',
      url: 'http://127.0.0.1:3101/api/v1/health',
      timeout: 120_000,
      env: {
        DATABASE_URL: process.env.E2E_DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:55432/entreregalos_e2e',
        JWT_ACCESS_SECRET: 'e2e-only-access-secret',
        JWT_REFRESH_SECRET: 'e2e-only-refresh-secret',
        JWT_ACCESS_EXPIRES_IN: '15m',
        NODE_ENV: 'test',
        PASSENGER: 'false',
        PORT: '3101',
        FRONTEND_URL: 'http://127.0.0.1:3100',
        ADMIN_USERNAME: 'e2e_admin',
        ADMIN_PASSWORD: 'E2eAdminPassword123!',
      },
    },
    {
      command: 'npm --prefix frontend run build && npm --prefix frontend run preview -- --host 127.0.0.1 --port 3100 --strictPort',
      url: 'http://127.0.0.1:3100',
      timeout: 120_000,
      env: { VITE_API_URL: '/api/v1', API_PROXY_TARGET: 'http://127.0.0.1:3101' },
    },
  ],
});
