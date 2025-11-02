/**
 * So, this is where we'll keep the URLs for all the different environments (in case there were any).
 * This way, we can point our tests to different environments by just changing the environment variable.
 * Super useful so we don't have to hardcode URLs everywhere.
 */

/**
 * @typedef {'local' | 'staging' | 'production'} Environment
 */

/**
 * @type {Record<Environment, string>}
 */
const ENV_URLS = {
  // For this project, we're just running against our local Docker setup.
  local: 'http://localhost:3000',
  
  // But in a real project, we'd add the other environments here, something like this:
  // staging: 'https://staging.sekoia.io',
  // production: 'https://www.sekoia.io',
};

/**
 * This figures out which environment we're targeting. It defaults to 'local'.
 * We can override it from the command line like this:
 * `PW_ENV=staging npx playwright test`
 * @type {Environment}
 */
const env = process.env.PW_ENV || 'local';

/**
 * This is the base URL that playwright.config.js will use.
 * It just grabs the right URL from our list based on the 'env' variable.
 */
const baseURL = ENV_URLS[env];

module.exports = {
    baseURL,
};
