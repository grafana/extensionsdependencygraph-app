# E2E Tests for Extensions Dependency Graph App

## Overview

This directory contains end-to-end tests for the Extensions Dependency Graph App, with a focus on testing the dependency graph functionality using mocked data and Playwright.

## Test Files

### Dependency Graph Tests

- **extensionPointView.spec.ts** - Tests for Extension Point visualization mode
- **exposedComponents.spec.ts** - Tests for Exposed Components visualization mode
- **addedLinksView.spec.ts** - Tests for Added Links visualization mode
- **addedComponentsView.spec.ts** - Tests for Added Components visualization mode
- **addedFunctionsView.spec.ts** - Tests for Added Functions visualization mode
- **dropdownSelectors.spec.ts** - Tests for dropdown selector functionality
- **filterBehavior.spec.ts** - Tests for filtering behavior across views

### Test Infrastructure

- **fixtures.ts** - Extended Playwright fixtures including the `depGraphPageWithMockApps` fixture
- **helpers.ts** - Shared helper functions and constants
- **mockApps.json** - Mock data containing 6 carefully selected Grafana app plugins
- **scripts/overrideGrafanaBootData.js** - Script that overrides Grafana boot data with mock apps

## Test Structure

Each test file follows a consistent structure:

```typescript
test.describe('View Name', () => {
  test.beforeEach(async ({ depGraphPageWithMockApps }) => {
    // Navigate to the specific view
    await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=...' });
  });

  test('shows correct selectors', () => {
    // Verify the correct UI controls are visible
  });

  test('displays expected number of provider and consumer boxes', () => {
    // Verify the correct data is displayed
  });

  test.describe('filtering', () => {
    // Tests for filtering functionality
  });
});
```

## Using Mock Data in Tests

### The `depGraphPageWithMockApps` Fixture

The `depGraphPageWithMockApps` fixture automatically injects mock data into the page before it loads. This is done by:

1. Reading the mock data from `mockApps.json`
2. Adding an init script that overrides `window.grafanaBootData.settings.apps` with mock data
3. Navigating to the dependency graph page with the mock data already available

### Example Usage

```typescript
import { test, expect } from './fixtures';

test('should use mock data', async ({ depGraphPageWithMockApps }) => {
  await depGraphPageWithMockApps.goto({ path: 'dependency-graph' });

  // The page will now have access to mock apps data
  const bootData = await depGraphPageWithMockApps.ctx.page.evaluate(() => {
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

**Data Coverage:**

- Plugin metadata (ID, version, path)
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

## Helper Functions

### Navigation and Waiting

- `waitForUrlParam(page, paramName, expectedValue)` - Wait for a URL parameter to be set
- `waitForUrlParamRemoved(page, paramName)` - Wait for a URL parameter to be removed

### Assertions

- `assertUrlParam(page, paramName, expectedValue)` - Assert URL parameter value
- `assertUrlParamAbsent(page, paramName)` - Assert URL parameter is not present

### Utilities

- `extractPluginIdFromTestId(testId, prefix)` - Extract plugin ID from test ID
- `clickSvg(locator)` - Helper to reliably click SVG elements

### Constants

- `EXPECTED_COUNTS` - Expected box counts for each visualization mode based on mock data

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

## Writing New Tests

When writing new tests that need mock data:

1. Import the fixtures: `import { test, expect } from './fixtures';`
2. Use the `depGraphPageWithMockApps` fixture in your test
3. Navigate using `await depGraphPageWithMockApps.goto({ path: '...' });`
4. The mock data will automatically be available

Example:

```typescript
import { test, expect } from './fixtures';
import { dependencyGraphTestIds } from '../src/components/testIds';

test('my new test', async ({ depGraphPageWithMockApps }) => {
  await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=addedlinks' });
  const { page } = depGraphPageWithMockApps.ctx;

  await expect(page.getByTestId(dependencyGraphTestIds.visualizationModeSelector)).toBeVisible();
});
```

## Updating Mock Data

To update the mock data:

1. Open `mockApps.json`
2. Add, remove, or modify plugin entries
3. Ensure the structure matches the expected format
4. Update `EXPECTED_COUNTS` in `helpers.ts` if counts change
5. Run tests to verify the changes work
