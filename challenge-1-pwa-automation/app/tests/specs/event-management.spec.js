import { test, expect } from '../fixtures/e2e-fixtures';
import { pageCopy, buttonCopy, testEvents } from '../utils/constants';
import { FilterType } from '../utils/enums';
import { clearEvents, validateDateTimeFormat } from '../utils/helpers';

test.describe('SekiOS Event Manager', () => {

    //Navigate to the application and clear localStorage before each test
    test.beforeEach(async ({ page, eventDashboardPage }) => {
        await eventDashboardPage.goTo();
        await clearEvents(page);
    });

    test('should correctly display all UI elements on the main page', async ({ page, eventDashboardPage }) => {
        await expect(page.getByRole('heading', { name: pageCopy.appTitle })).toBeVisible();
        await expect(page.getByText(pageCopy.appSubtitle)).toBeVisible();
        await expect(page.getByRole('heading', { name: pageCopy.createEventHeading })).toBeVisible();
        await expect(page.getByRole('heading', { name: pageCopy.eventListHeading })).toBeVisible();
        
        //check for the visibility of all form and control elements using the getters
        await expect(eventDashboardPage.eventTitleInput).toBeVisible();
        await expect(eventDashboardPage.eventTypeSelect).toBeVisible();
        await expect(eventDashboardPage.eventSourceInput).toBeVisible();
        await expect(eventDashboardPage.eventSeveritySelect).toBeVisible();
        await expect(eventDashboardPage.eventDescriptionInput).toBeVisible();
        await expect(eventDashboardPage.submitEventButton).toBeVisible();
        await expect(eventDashboardPage.searchInput).toBeVisible();
    });

    test('should allow a user to create a new event and validate its content', async ({ eventDashboardPage }) => {
        const eventData = testEvents.successEvent;
        await eventDashboardPage.createEvent(eventData);

        await expect(eventDashboardPage.successToast).toBeVisible();
        await expect(eventDashboardPage.successToast).toContainText(pageCopy.successToast);

        const eventCard = eventDashboardPage.getEventCardByTitle(eventData.title);
        await expect(eventCard.root).toBeVisible();
        
        await expect(eventCard.description).toHaveText(eventData.description);
        await expect(eventCard.source).toContainText(eventData.source);
        await expect(eventCard.severity).toContainText(eventData.severity.toUpperCase());
        
        //validate the type using a case-insensitive regex to accommodate CSS text-transform
        await expect(eventCard.type).toHaveText(new RegExp(eventData.type, 'i'));
    });

    test('should correctly filter events by type', async ({ eventDashboardPage }) => {
        const eventsToCreate = [
            testEvents.successEvent,
            testEvents.warningEvent,
            testEvents.errorEvent,
            testEvents.infoEvent,
        ];

        // create one of each event type
        for (const event of eventsToCreate) {
            await eventDashboardPage.createEvent(event);
        }

        // Define which filters to test and which event should be visible for each
        const filtersToTest = [
            { filter: FilterType.SUCCESS, visibleEvent: testEvents.successEvent },
            { filter: FilterType.WARNING, visibleEvent: testEvents.warningEvent },
            { filter: FilterType.ERROR, visibleEvent: testEvents.errorEvent },
            { filter: FilterType.INFO, visibleEvent: testEvents.infoEvent },
        ];

        for (const { filter, visibleEvent } of filtersToTest) {
            await eventDashboardPage.filterByType(filter);

            // Verify that only the correct card is visible
            for (const event of eventsToCreate) {
                const card = eventDashboardPage.getEventCardByTitle(event.title);
                if (event.title === visibleEvent.title) {
                    await expect(card.root).toBeVisible({ timeout: 1000 });
                } else {
                    await expect(card.root).not.toBeVisible({ timeout: 1000 });
                }
            }
        }

        // Tous filter
        await eventDashboardPage.allFilterButton.click();
        await expect(eventDashboardPage.eventCards).toHaveCount(eventsToCreate.length + 2); // +2 for the default events
    });

    test('should search for events by title, description, and source', async ({ eventDashboardPage }) => {
        const eventsToCreate = [
            testEvents.successEvent,
            testEvents.warningEvent,
            testEvents.errorEvent,
        ];

        for (const event of eventsToCreate) {
            await eventDashboardPage.createEvent(event);
        }

        const searchScenarios = [
            { term: 'Successful Login', expected: testEvents.successEvent, reason: 'a unique title' },
            { term: 'unrecognized IP', expected: testEvents.warningEvent, reason: 'a unique description phrase' },
            { term: 'Kernel', expected: testEvents.criticalEvent, reason: 'a unique source' },
        ];

        for (const { term, expected, reason } of searchScenarios) {
            await eventDashboardPage.search(term);

            // Verify that only the expected card is visible
            for (const event of eventsToCreate) {
                const card = eventDashboardPage.getEventCardByTitle(event.title);
                if (event.title === expected.title) {
                    await expect(card.root, `Search by ${reason} failed`).toBeVisible();
                } else {
                    await expect(card.root, `Search by ${reason} showed incorrect card`).toHaveCount(0);
                }
            }
        }
    });

    test('should open a confirmation modal and delete an event', async ({ eventDashboardPage }) => {
        const eventData = testEvents.errorEvent;
        const deleteModal = eventDashboardPage.deleteConfirmationModal;
        await eventDashboardPage.createEvent(eventData);

        const eventCard = eventDashboardPage.getEventCardByTitle(eventData.title);
        await eventCard.delete();

        // Verify the delete confirmation modal content
        await expect(deleteModal.root).toBeVisible();
        await expect(deleteModal.title).toHaveText(pageCopy.deleteModalTitle);
        await expect(deleteModal.body).toContainText(pageCopy.deleteModalBodyText);
        await expect(deleteModal.eventTitle).toHaveText(eventData.title);

        // Confirm deletion and verify the card is removed
        await deleteModal.confirmDeletion();
        await expect(deleteModal.root).not.toBeVisible();
        
        // Verify the success toast for deletion
        await expect(eventDashboardPage.successToast).toBeVisible();
        await expect(eventDashboardPage.successToast).toContainText(pageCopy.deleteSuccessToast);
        
        await expect(eventCard.root).toHaveCount(0);
    });

    test('should open and validate the view details modal', async ({ eventDashboardPage }) => {
        const eventData = testEvents.infoEvent;
        const viewModal = eventDashboardPage.viewDetailsModal;
        await eventDashboardPage.createEvent(eventData);

        const eventCard = eventDashboardPage.getEventCardByTitle(eventData.title);
        await eventCard.viewDetails();
        
        // Verify the view details modal content
        await expect(viewModal.root).toBeVisible();
        await expect(viewModal.title).toHaveText(eventData.title);
        await expect(viewModal.type).toHaveText(new RegExp(eventData.type, 'i'));
        await expect(viewModal.source).toHaveText(eventData.source);
        await expect(viewModal.severity).toHaveText(eventData.severity.toUpperCase());
        await expect(viewModal.description).toHaveText(eventData.description);
        await expect(viewModal.xCloseButton).toBeVisible();
        
        // Verify the date is today and the time format is correct using the helper
        const today = new Date().toLocaleDateString('fr-FR');
        const modalDateText = await viewModal.date.textContent();
        expect(modalDateText).toContain(today);
        expect(validateDateTimeFormat(modalDateText)).toBe(true);

        // Close the modal and verify it's gone
        await viewModal.close();
        await expect(viewModal.root).not.toBeVisible();
    });

    test('should persist events after a page reload', async ({ page, eventDashboardPage }) => {
        const eventData = testEvents.infoEvent;
        await eventDashboardPage.createEvent(eventData);

        await page.reload();

        const eventCard = eventDashboardPage.getEventCardByTitle(eventData.title);
        await expect(eventCard.root).toBeVisible();
        await expect(eventCard.description).toHaveText(eventData.description);
    });

    test('should increment total and today counters when an event is created', async ({ eventDashboardPage }) => {
        // 1. Get the initial counter values
        const initialTotal = parseInt(await eventDashboardPage.totalEventsCounter.textContent() || '0');
        const initialToday = parseInt(await eventDashboardPage.todayEventsCounter.textContent() || '0');

        // 2. Perform the action
        await eventDashboardPage.createEvent(testEvents.infoEvent);

        // 3. Assert that the counters have incremented by 1
        await expect(eventDashboardPage.totalEventsCounter).toHaveText((initialTotal + 1).toString());
        await expect(eventDashboardPage.todayEventsCounter).toHaveText((initialToday + 1).toString());
    });

    test.fixme('should decrement total and today counters when an event is deleted', async ({ eventDashboardPage }) => {
        // TODO: Clarify requirements for counter behavior on deletion.
        // The current implementation does not decrement the "Total Events" counter when an event is removed from the UI.
        // This might be intentional (soft-delete?) or a bug.
        // We need to confirm if the counter should reflect the number of visible events or the total number of events ever created.
    });

    test.fixme('should correctly update the critical events counter', async ({ eventDashboardPage }) => {
        // TODO: Clarify requirements for counter behavior on deletion.
        // This test is linked to the ambiguity identified in the "should decrement total and today counters" test.
        // While the increment logic can be validated, the decrement logic is currently un-testable until the expected behavior is confirmed.
    });
});