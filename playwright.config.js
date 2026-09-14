import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {},
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [{
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 60_000,
    env: { VITE_SUPABASE_URL: 'https://education-test.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'test-public-key' },
  }, {
    command: 'node tests/production-server.js',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: false,
    timeout: 90_000,
    env: { VITE_SUPABASE_URL: 'https://education-test.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'test-public-key' },
  }],
})
