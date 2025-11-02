// @ts-check
import { PageBase } from './PageBase';

/**
 * Represents a single event card component on the dashboard.
 * This class encapsulates all locators and actions related to one event card.
 */
class EventCard {
    /**
     * @param {import('@playwright/test').Locator} rootLocator The locator for the card's root element.
     */
    constructor(rootLocator) {
        this.root = rootLocator;
    }

    // --- Getters for internal elements ---

    get description() {
        return this.root.locator("[data-testid='event-description']");
    }

    get source() {
        return this.root.locator("[data-testid='event-source']");
    }

    get severity() {
        return this.root.locator("[data-testid='event-severity']");
    }

    get type() {
        return this.root.locator("[data-testid='event-type']");
    }

    get deleteButton() {
        return this.root.locator("[data-testid='delete-event-btn']");
    }

    get viewButton() {
        return this.root.locator("[data-testid='view-event-btn']");
    }

    // --- Action Methods ---

    /**
     * Clicks the delete button on this specific card.
     */
    async delete() {
        await this.deleteButton.click();
    }

    /**
     * Clicks the view button on this specific card.
     */
    async viewDetails() {
        await this.viewButton.click();
    }
}

/**
 * Represents the Delete Confirmation modal dialog.
 */
class DeleteModal {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
    }

    get root() { return this.page.locator('.modal-content', { hasText: 'Confirmer la suppression' }); }
    get title() { return this.root.locator('h2'); }
    get body() { return this.root.locator('[data-testid="delete-modal-body"]'); }
    get eventTitle() { return this.root.locator('[data-testid="delete-modal-event-title"]'); }
    get cancelButton() { return this.root.locator('[data-testid="delete-modal-cancel-btn"]'); }
    get confirmButton() { return this.root.locator('[data-testid="delete-modal-confirm-btn"]'); }

    async confirmDeletion() {
        await this.confirmButton.click();
    }
}

/**
 * Represents the View Details modal dialog.
 */
class ViewModal {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
    }

    get root() { return this.page.locator('.modal-content', { hasText: 'Détails de l\'événement' }); }
    get title() { return this.root.locator('[data-testid="view-modal-title"]'); }
    get type() { return this.root.locator('[data-testid="view-modal-type"]'); }
    get source() { return this.root.locator('[data-testid="view-modal-source"]'); }
    get severity() { return this.root.locator('[data-testid="view-modal-severity"]'); }
    get date() { return this.root.locator('[data-testid="view-modal-date"]'); }
    get description() { return this.root.locator('[data-testid="view-modal-description"]'); }
    get closeButton() { return this.root.locator('[data-testid="view-modal-close-btn"]'); }
    get xCloseButton() { return this.root.locator('[data-testid="view-modal-close"]'); }

    async close() {
        await this.closeButton.click();
    }
}


export class EventDashboardPage extends PageBase {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        super(page);
        this.deleteConfirmationModal = new DeleteModal(page);
        this.viewDetailsModal = new ViewModal(page);
    }

    // --- Getters for Locators ---

    // Stats
    get totalEventsCounter() { return this.page.locator("[data-testid='total-events']"); }
    get criticalEventsCounter() { return this.page.locator("[data-testid='critical-events']"); }
    get todayEventsCounter() { return this.page.locator("[data-testid='today-events']"); }

    // Create event form
    get eventTitleInput() { return this.page.locator("[data-testid='event-title-input']"); }
    get eventTypeSelect() { return this.page.locator("[data-testid='event-type-select']"); }
    get eventSourceInput() { return this.page.locator("[data-testid='event-source-input']"); }
    get eventSeveritySelect() { return this.page.locator("[data-testid='event-severity-select']"); }
    get eventDescriptionInput() { return this.page.locator("[data-testid='event-description-input']"); }
    get submitEventButton() { return this.page.locator("[data-testid='submit-event-btn']"); }

    // Event list and controls
    get allFilterButton() { return this.page.locator("[data-testid='filter-all']"); }
    get searchInput() { return this.page.locator("[data-testid='search-input']"); }
    
    // Event card
    get eventCards() { return this.page.locator("[data-testid='event-card']"); }

    // Toast message
    get successToast() { return this.page.locator('[data-testid="toast"]'); }


    
    // --- Action Methods ---

    /**
     * Creates a new event using the form.
     * @param {{title: string, type: string, source: string, severity: string, description: string}} eventDetails
     */
    async createEvent(eventDetails) {
        await this.eventTitleInput.fill(eventDetails.title);
        await this.eventTypeSelect.selectOption(eventDetails.type);
        await this.eventSourceInput.fill(eventDetails.source);
        await this.eventSeveritySelect.selectOption(eventDetails.severity);
        await this.eventDescriptionInput.fill(eventDetails.description);
        await this.submitEventButton.click();
    }

    /**
     * Filters events by type using the filter buttons.
     * @param {import('../utils/enums').FilterType} filterType
     */
    async filterByType(filterType) {
        await this.page.locator(`[data-testid='filter-${filterType.toLowerCase()}']`).click();
    }

    /**
     * Searches for an event by typing in the search bar.
     * @param {string} searchTerm
     */
    async search(searchTerm) {
        await this.searchInput.fill(searchTerm);
    }

    /**
     * Finds a specific event card by its title and returns an EventCard component instance.
     * @param {string} eventTitle
     * @returns {EventCard}
     */
    getEventCardByTitle(eventTitle) {
        const rootLocator = this.eventCards.filter({ has: this.page.locator(`text="${eventTitle}"`) });
        return new EventCard(rootLocator);
    }

    /**
     * Deletes an event by its title using the EventCard component.
     * @param {string} eventTitle
     */
    async deleteEvent(eventTitle) {
        const eventCard = this.getEventCardByTitle(eventTitle);
        await eventCard.delete();
    }
}
