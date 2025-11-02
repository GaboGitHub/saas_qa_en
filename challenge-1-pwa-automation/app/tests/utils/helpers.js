/**
 * A place to store any reusable functions we might need across different tests.
 * For a small app like this, the main thing is a helper to nuke localStorage
 * so that every test starts from a clean slate.
 *
 * In a bigger project, this file would be full of useful stuff like:
 * - API helpers to create or delete users/data before a test runs.
 * - Functions for complex UI stuff that we have to do all the time.
 */

/**
 * Wipes the events from localStorage. Runs before each test to ensure a clean state.
 * @param {import('@play-playwright/test').Page} page
 */
export async function clearEvents(page) {
    await page.evaluate(() => {
        // The app uses the key 'sekios-events' to store everything in localStorage.
        localStorage.removeItem('sekios-events');
    });
}

/**
 * Simple regex check to make sure the date string from the modal looks right.
 * Format is DD/MM/YYYY HH:MM:SS.
 * @param {string | null} dateTimeString The string we get from the UI.
 * @returns {boolean}
 */
export function validateDateTimeFormat(dateTimeString) {
    if (!dateTimeString) return false;
    const regex = /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/;
    return regex.test(dateTimeString);
}
