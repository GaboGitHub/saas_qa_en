import { test as base } from '@playwright/test';
import { EventDashboardPage } from '../pages/EventDashboardPage';

/**
 * This file demonstrates how to extend the base Playwright `test` object with fixtures.
 * For this project, we are only adding a fixture for our single page object, `EventDashboardPage`.
 * 
 * In a larger, multi-page application, you would extend this file to include fixtures
 * for each page object. For example:
 *   loginPage: async ({ page }, use) => {
 *     await use(new LoginPage(page));
 *   },
 *   settingsPage: async ({ page }, use) => {
 *     await use(new SettingsPage(page));
 *   },
 * });
 * 
 * This allows any test file to easily access instances of page objects without needing to
 * instantiate them manually in every `test.describe` block.
 */

export const test = base.extend({
    eventDashboardPage: async ({ page }, use) => {
        await use(new EventDashboardPage(page));
    },
});

export { expect } from '@playwright/test';
