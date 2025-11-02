// @ts-check

/**
 * A base class for all page objects, containing common functionalities.
 */
export class PageBase {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
    }

    /**
     * Navigates to a specific URL (defaults to the base URL) and waits for the page to load.
     * @param {string} [url='/']
     */
    async goTo(url = '/') {
        await this.page.goto(url);
        await this.page.waitForLoadState('load');
    }
}
