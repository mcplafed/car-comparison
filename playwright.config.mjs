import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './browser-tests',
  use: {baseURL: 'http://127.0.0.1:8765', headless: true},
  webServer: {command: 'python3 -m http.server 8765 --bind 127.0.0.1', port: 8765, reuseExistingServer: false},
});
