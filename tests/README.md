# E2E Tests for Extensions Insights App

## Overview

This directory contains end-to-end tests for the Extensions Insights App, with a focus on testing the dependency graph functionality using mocked data.

## Test Structure

### Files

- **fixtures.ts** - Extended Playwright fixtures including the `pageWithMockData` fixture
- **mockApps.json** - Mock data containing 6 carefully selected Grafana app plugins that cover all extension types (addedLinks, addedComponents, exposedComponents, extensionPoints, addedFunctions, and dependencies)
- **scripts/overrideGrafanaBootData.js** - Script that waits for Grafana boot data and overrides `window.grafanaBootData.settings.apps` with mock data
- **dependencyGraph.spec.ts** - Tests for dependency graph data validation
- **dependencyGraphUI.spec.ts** - Tests for dependency graph UI interactions

## Using Mock Data in Tests

### The `pageWithMockData` Fixture

The `pageWithMockData` fixture automatically injects mock data into the page before it loads. This is done by:

1. Reading the mock data from `mockApps.json`
2. Reading the override script from `scripts/overrideGrafanaBootData.js`
3. Injecting the mock data into the script
4. Adding the script as an init script to the page (runs before any page scripts)

### Example Usage

```typescript
import { test, expect } from './fixtures';

test('should use mock data', async ({ pageWithMockData, context }) => {
  // Create a new page with mock data already injected
  const appPage = await context.newPage();
  await appPage.goto('/a/grafana-extensionsinsights-app/dependency-graph');

  // The page will now have access to mock apps data
  const bootData = await appPage.evaluate(() => {
    return (window as any).grafanaBootData?.settings?.apps;
  });

  expect(bootData).toBeDefined();
  expect(bootData).toHaveProperty('grafana-asserts-app');
});
```

## Mock Data Structure

The `mockApps.json` file contains 6 carefully selected plugins that cover all extension types:

**Selected Plugins:**

1. **grafana-assistant-app** - addedFunctions (unique!), addedLinks, addedComponents
2. **grafana-asserts-app** - exposedComponents (8), addedComponents, dependencies
3. **grafana-collector-app** - exposedComponents, dependencies
4. **grafana-exploretraces-app** - extensionPoints, all other types, depends on asserts
5. **cloud-home-app** - extensionPoints, depends on collector
6. **grafana-k8s-app** - exposedComponents, depended on by collector

**Data Structure:**

- Plugin ID, version, and path
- Angular detection status
- Loading strategy (script/fetch)
- Extensions:
  - `addedLinks` - Links added to extension points
  - `addedComponents` - Components added to extension points
  - `exposedComponents` - Components exposed by this plugin
  - `extensionPoints` - Extension points defined by this plugin
  - `addedFunctions` - Functions added to extension points
- Dependencies:
  - Grafana version requirements
  - Plugin dependencies
  - Required exposed components from other plugins

## How the Override Works

The override script follows the same pattern as `@grafana/plugin-e2e`, using a polling mechanism:

1. The script is injected as an init script before the page loads
2. It polls (every 1ms) waiting for `window.grafanaBootData.user` to exist
3. Once Grafana has initialized the boot data structure, the callback fires
4. The script then overrides `window.grafanaBootData.settings.apps` with our mock data
5. Grafana's React app mounts and reads the mocked apps data

This approach ensures:

- No modification to the original codebase
- Tests are isolated and reproducible
- Follows Grafana's official e2e testing patterns
- The mock data is available before any React components use it

## Running the Tests

```bash
# Run all tests
npm run test:e2e

# Run only dependency graph tests
npx playwright test dependencyGraph

# Run only UI tests
npx playwright test dependencyGraphUI

# Run in headed mode (see the browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug
```

## Writing New Tests

When writing new tests that need mock data:

1. Import the fixtures: `import { test, expect } from './fixtures';`
2. Use the `pageWithMockData` fixture in your test
3. Create a new page from the context: `const appPage = await context.newPage();`
4. Navigate to your route: `await appPage.goto('/a/grafana-extensionsinsights-app/...');`
5. The mock data will automatically be available

## Updating Mock Data

To update the mock data:

1. Open `mockApps.json`
2. Add, remove, or modify plugin entries
3. Ensure the structure matches the expected format
4. Run tests to verify the changes work

## Notes

- The mock data includes 6 carefully selected plugins that cover all extension types
- All extension relationship patterns are represented (dependencies, exposed components, etc.)
- The override script uses the same polling pattern as `@grafana/plugin-e2e`
- The script is injected as an init script and runs before Grafana's React app mounts
- Tests should not be committed to the repository
