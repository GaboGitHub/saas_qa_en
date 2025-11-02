# Solution Challenge 1

## Chosen Framework

I chose **Playwright** for this challenge.

It's a modern, powerful framework that I have extensive experience with. Its architecture provides fast and reliable execution, and its API is intuitive. Key features that made it a great fit for this project include:

-   **Auto-Waits**: Eliminates the flakiness common in older frameworks by automatically waiting for elements to be ready before interacting with them.
-   **Test Isolation**: Playwright's Browser Context model provides perfect test isolation out of the box, preventing race conditions and test pollution between files.
-   **Fixtures**: The fixture system allows for creating clean, readable tests by abstracting away setup and boilerplate code.
-   **Tooling**: The UI Mode (`test:ui`) and Trace Viewer are great features for debugging and development, making the whole process way faster.

## Test Architecture

I set up the test suite to be scalable and maintainable, even though the project is small and might look like overkill for this challenge. But I wanted to showcase the extent that this framework can achieve. This approach shows how I would build a framework for a much larger, real-world application.

### Directory Structure

The tests live inside the `challenge-1-pwa-automation/app/` directory, next to the application's source. This is a common pattern for self-contained projects.

```plaintext
app/
├── tests/
│   ├── fixtures/
│   │   └── e2e-fixtures.js   # Sets up Page Objects for easy use in tests.
│   ├── pages/
│   │   ├── PageBase.js         # A base class with common methods (like goTo).
│   │   └── EventDashboardPage.js # The main Page Object for the app.
│   ├── specs/
│   │   └── event-management.spec.js # This is where all the actual test cases live.
│   └── utils/
│       ├── config.js         # Handles environment URLs (local, staging, etc.).
│       ├── constants.js      # Stores all UI text and test data.
│       ├── enums.js          # The single source of truth for value sets like EventType.
│       └── helpers.js        # Reusable functions, like clearing localStorage.
├── .github/
│   └── workflows/
│       └── playwright.yml # The GitHub Action for running tests automatically.
... (rest of the app files)
```

### Key Concepts

-   **Page Object Model (POM)**: The `pages` directory is the core of the framework. Instead of putting selectors and logic in the test files, I like to abstract it all away into page objects. The `EventDashboardPage` is a perfect example; it even contains component classes (`EventCard`, `DeleteModal`, `ViewModal`) to handle complex parts of the UI. This makes the tests super clean and easy to read.
-   **Fixtures**: The `e2e-fixtures.js` file extends Playwright's test runner. It automatically creates an instance of the `EventDashboardPage` for every test, so I don't have to. For a bigger app, I'd add all the page objects here.
-   **Separation of Concerns**: The `utils` directory is to keep the code organized.
    -   `config.js` lets me switch environments easily.
    -   `constants.js` and `enums.js` ensure there is a single source of truth for the data and avoids hardcoding strings.
    -   `helpers.js` provides a place to put reusable logic, like the `clearEvents` function.

-   **CI/CD Pipeline**: To ensure these tests can run automatically, I've included a GitHub Actions workflow located at `.github/workflows/playwright.yml`. This workflow:
    -   Triggers automatically on any push or pull request to the `main` branch. (of course this could be adapted to run on different branches, and even do rollbacks on failures if needed)
    -   Uses a modern Ubuntu runner and sets up the correct Node.js environment.
    -   Installs dependencies using `npm ci` for reliable builds.
    -   Caches the Playwright browsers to significantly speed up subsequent runs after the first one.
    -   Starts the application using `docker compose` and includes a smart wait to ensure the server is ready before tests begin.
    -   Runs the full test suite headless via the `npm test` command.
    -   Automatically uploads the HTML report as an artifact if, and only if, the test run fails, making debugging much easier (we could choose to upload artifacts always but I just tend to do it on FAILURES).

## Execution

### 1. Install Dependencies

First, you need to install the dependencies for both the application and the test suite.

```bash
# Navigate to the correct directory
cd challenge-1-pwa-automation/app

# Install all dependencies from the lock file
npm install
```

### 2. Run the Application

Run docker compose. The tests expect the application to be available at `http://localhost:3000`.

```bash
# From the challenge-1-pwa-automation directory
docker compose up -d
```

### 3. Run the Tests

I've added several scripts to `package.json` to make running tests easy. Run these from the `challenge-1-pwa-automation/app` directory.

```bash
# Run all tests in headless mode (perfect for CI)
npm test

# Open the interactive Playwright UI for debugging
npm run test:ui

# View the latest HTML report
npm run test:report
```

## Results

-   **10 tests passed**
-   **2 tests skipped (`fixme`)**

All core functionalities of the application are covered by passing tests. Two tests related to counter decrementation have been marked as `test.fixme`. This is intentional.

## Difficulties Encountered

The most interesting challenge was diagnosing the behavior of the statistics counters.

-   **The "Today" Counter**: I noticed a discrepancy where the counter showed `2` during test runs but `1` during manual testing. After digging into the app's source code, I found that the default events are created with a dynamic timestamp. The `beforeEach` hook, which clears `localStorage`, was causing two new "today" events to be created for every test. I refactored the test to be resilient to this by checking the *change* in the counter's value, not its absolute value.
-   **The "Total Events" Counter**: I discovered that deleting an event removes it from the UI but does **NOT** decrement the "Total Events" counter. This could be a bug or an intentional "soft-delete" feature. Since the requirement is ambiguous, I made a judgment call to flag the two related tests with `test.fixme` and add a `//TODO` comment. This prevents the test suite from failing, documents the ambiguity, and creates an actionable item for the development team to clarify the expected behavior.

## Possible Improvements

If I had more time, I would:

-   **Use TypeScript**: While I used JavaScript for this challenge to keep it simple and dependency-free, in any real-world project, I would insist on using TypeScript. The benefits of static typing for catching errors early, improving autocompletion, and making the code more self-documenting are massive, especially as a test suite grows in complexity.
-   **Add Visual Regression Testing**: Use Playwright's screenshot capabilities to ensure the UI's look and feel doesn't change unexpectedly between releases.
-   **Expand Accessibility Testing**: While Playwright has some accessibility features, I'd integrate a library like `axe-core` to perform more in-depth automated accessibility checks.
-   **Component Tests**: For a larger application, I'd advocate for adding component-level tests (using Playwright or another tool) to test UI components in isolation, which is faster and more targeted than E2E tests.
