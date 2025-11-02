const { defineConfig, devices } = require('@playwright/test');
const { baseURL } = require('./config');

module.exports = defineConfig({
  testDir: './tests/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: baseURL, // Use the baseURL from the config.js file
    trace: 'retain-on-failure', // Retain the trace on failure to help with debugging.
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // We could enable other browsers here if we wanted to test against them as well as mobile emulators.
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['iPhone 15'] },
    // },
  ],
});

