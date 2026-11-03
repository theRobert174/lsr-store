import { defineConfig } from '@playwright/test';
import config from './playwright.config';

export default defineConfig({
  ...config,
  use: { ...config.use, baseURL: 'http://127.0.0.1:4301' },
  webServer: {
    command: 'node scripts/preview.mjs --port 4301',
    url: 'http://127.0.0.1:4301',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
