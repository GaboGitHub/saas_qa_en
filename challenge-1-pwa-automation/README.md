# Challenge 1: PWA Test Automation 🤖

## 📖 Context

You need to validate a Progressive Web App (PWA) for security event management before delivering it to a client in a regulated environment. The application must be testable in an automated way.

## 🎯 Objectives

1. **Launch the application** in Docker
2. **Create an automated test suite** with the framework of your choice
3. **Validate the main functionalities**
4. **Document the execution** of tests

## 🚀 Quick Start

```bash
cd challenge-1-pwa-automation
docker-compose up -d
# The application is accessible at http://localhost:3000
```

## ✅ Features to Test

1. **Event Creation**

   - Create a new security event
   - Verify it appears in the list
   - Validate statistics (counters)

2. **Event Filtering**

   - Test filters by type (Info, Warning, Error, Success)
   - Verify that only events of the selected type are displayed

3. **Event Search**

   - Search by title, description, or source
   - Verify search results

4. **Event Deletion**

   - Delete an event
   - Verify it disappears from the list
   - Validate statistics update

5. **Data Persistence**

   - Create an event
   - Reload the page
   - Verify the event is still present (localStorage)

## 📦 Suggested Frameworks

Choose the one you master:

- **Playwright** (recommended)
- **Cypress**
- **Selenium**
- **Puppeteer**
- **Other** (justify your choice)

## 📤 Expected Deliverables

The complete solution allowing to reproduce the automated tests, including the `SOLUTION.md` file documenting your approach.

````

### Content of `SOLUTION.md`

```markdown
# Solution Challenge 1

## Chosen Framework

[Name and justification]

## Test Architecture

[Description of your approach]

## Execution

``bash

# Commands to run the tests

``

## Results

- X tests passed
- Y tests failed

## Possible Improvements

[If you had more time...]

## Difficulties Encountered

[If applicable]
````

## 🎓 Evaluation Criteria

| Criterion                            | Points |
| ------------------------------------ | ------ |
| Basic functional tests               | 50%    |
| Reproducibility (clear instructions) | 20%    |
| Test code quality                    | 20%    |
| Documentation                        | 10%    |

## 💡 Tips

- **Think CI/CD**: Your tests should be able to run in a pipeline
- **Use stable selectors**

## 🛠️ Bonus

- **Create a GitHub Action** to automatically run tests on every push

## 📋 Application Features

The **SekiOS Event Manager** application allows you to:

- ✅ Create security events with title, type, source, severity, and description
- ✅ Display real-time statistics (total, critical, today)
- ✅ Filter events by type
- ✅ Search through events
- ✅ Delete events
- ✅ View complete event details
- ✅ Save data locally (localStorage)

## Help

If the application doesn't start:

```bash
# Clean and restart
docker-compose down -v
docker-compose up -d --build
```

Good luck! 🚀
