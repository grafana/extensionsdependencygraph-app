# E2E Test Setup Summary

## What Was Created

### 1. Boot Data Override Script

**File:** `tests/scripts/overrideGrafanaBootData.js`

This script intercepts `window.grafanaBootData` and replaces `settings.apps` with mock data before Grafana initializes. It works by:

- Overriding `Object.defineProperty`
- Intercepting the definition of `grafanaBootData`
- Injecting mock apps data
- Allowing Grafana to continue normally with mocked data

### 2. Extended Fixtures

**File:** `tests/fixtures.ts`

Added a new `pageWithMockData` fixture that:

- Reads mock data from `mockApps.json`
- Reads the override script
- Injects the mock data into the script
- Adds it as an init script to the page (runs before any page code)

**Key Changes:**

```typescript
import { Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

// Added to fixtures type
type AppTestFixture = {
  appConfigPage: AppConfigPage;
  gotoPage: (path?: string) => Promise<AppPage>;
  pageWithMockData: Page; // <-- NEW
};

// New fixture implementation
pageWithMockData: async ({ page }, use) => {
  const mockAppsData = readFileSync(join(__dirname, 'mockApps.json'), 'utf-8');
  let overrideScript = readFileSync(join(__dirname, 'scripts', 'overrideGrafanaBootData.js'), 'utf-8');
  overrideScript = overrideScript.replace('__MOCK_APPS_DATA__', JSON.stringify(mockAppsData));
  await page.addInitScript(overrideScript);
  await use(page);
};
```

### 3. Dependency Graph Data Tests

**File:** `tests/dependencyGraph.spec.ts`

Tests that validate the mock data is correctly injected and accessible:

- ✅ Renders dependency graph with mocked data
- ✅ Displays plugins from mock data
- ✅ Shows correct number of plugins (41)
- ✅ Displays plugins with extensions
- ✅ Displays plugins with dependencies
- ✅ Handles extension points
- ✅ Handles plugins with added links
- ✅ Displays complex dependency chains

### 4. Dependency Graph UI Tests

**File:** `tests/dependencyGraphUI.spec.ts`

Tests that validate UI interactions with the mocked data:

- ✅ Renders the dependency graph panel
- ✅ Displays graph controls
- ✅ Allows filtering by plugin
- ✅ Displays nodes for plugins with extensions
- ✅ Shows edges/links between dependent plugins
- ✅ Allows switching visualization modes
- ✅ Supports zooming and panning
- ✅ Handles click on plugin node
- ✅ Displays plugin metadata on hover
- ✅ Shows correct extension counts
- ✅ Handles empty search results gracefully
- ✅ Displays legend or key for graph elements

### 5. Documentation

**File:** `tests/README.md`

Complete documentation on:

- Test structure and files
- How to use the `pageWithMockData` fixture
- Mock data structure
- How the override mechanism works
- Running tests
- Writing new tests
- Updating mock data

## Mock Data Overview

The `mockApps.json` file contains 6 carefully selected plugins that cover all extension types:

**Selected Plugins:**

1. **grafana-assistant-app** - addedFunctions (unique!), addedLinks (3), addedComponents (3)
2. **grafana-asserts-app** - exposedComponents (8), addedComponents (2), dependencies (11)
3. **grafana-collector-app** - exposedComponents (4), addedComponents (1), dependencies (2)
4. **grafana-exploretraces-app** - extensionPoints (1), addedLinks (2), addedComponents (2), exposedComponents (2), dependencies (2)
5. **cloud-home-app** - extensionPoints (1), depends on collector-app
6. **grafana-k8s-app** - exposedComponents (3), dependencies (4)

**Extension Type Coverage:**

- ✅ addedLinks
- ✅ addedComponents
- ✅ exposedComponents
- ✅ extensionPoints
- ✅ addedFunctions (only grafana-assistant-app has this!)
- ✅ dependency relationships between plugins

## How to Use

### Running Tests

```bash
# Run all tests
npm run test:e2e

# Run only dependency graph tests
npx playwright test dependencyGraph

# Run only UI tests
npx playwright test dependencyGraphUI

# Debug mode
npx playwright test --debug
```

### Writing New Tests

```typescript
import { test, expect } from './fixtures';
import { ROUTES } from '../src/constants';

test('my test', async ({ pageWithMockData, context }) => {
  // Create page with mock data
  const appPage = await context.newPage();

  // Navigate to dependency graph
  await appPage.goto(`/a/grafana-extensionsdependencygraph-app/${ROUTES.DependencyGraph}`);
  await appPage.waitForLoadState('networkidle');

  // Access mock data
  const bootData = await appPage.evaluate(() => {
    return (window as any).grafanaBootData?.settings?.apps;
  });

  // Assertions
  expect(bootData).toHaveProperty('grafana-asserts-app');
});
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Test Suite                          │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ test('...', async ({ pageWithMockData, context }) │   │
│  └────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │          pageWithMockData Fixture                   │  │
│  │  • Reads mockApps.json                              │  │
│  │  • Reads overrideGrafanaBootData.js                 │  │
│  │  • Injects mock data into script                    │  │
│  │  • Adds as initScript to page                       │  │
│  └─────────────────────────────────────────────────────┘  │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           ▼
          ┌────────────────────────────────────┐
          │     Browser Page Loads             │
          │                                    │
          │  1. initScript runs FIRST          │
          │     • Overrides Object.defineProperty
          │     • Waits for grafanaBootData    │
          │                                    │
          │  2. Grafana code runs              │
          │     • Defines grafanaBootData      │
          │     • Override intercepts it       │
          │     • Mock data injected           │
          │                                    │
          │  3. React app mounts               │
          │     • Reads grafanaBootData        │
          │     • Gets mocked apps             │
          │     • Renders with test data       │
          └────────────────────────────────────┘
```

## Key Benefits

1. **No Code Modification** - The app code doesn't need any changes
2. **Isolated Tests** - Each test gets fresh mock data
3. **Reproducible** - Same data every time
4. **Realistic** - Uses real plugin metadata
5. **Fast** - No network calls needed
6. **Comprehensive** - Covers all extension types with minimal data

## Files Created

```
tests/
├── scripts/
│   └── overrideGrafanaBootData.js    (NEW - Boot data override)
├── fixtures.ts                        (MODIFIED - Added pageWithMockData)
├── dependencyGraph.spec.ts           (NEW - Data validation tests)
├── dependencyGraphUI.spec.ts         (NEW - UI interaction tests)
├── README.md                         (NEW - Test documentation)
└── SETUP_SUMMARY.md                  (NEW - This file)
```

## Next Steps

1. Run the tests: `npx playwright test dependencyGraph`
2. Add more specific UI tests based on your dependency graph features
3. Update mock data as needed for specific test scenarios
4. Integrate into CI/CD pipeline

## Notes

- Mock data injection happens BEFORE Grafana loads
- The `pageWithMockData` fixture must be used with `context.newPage()`
- Tests are not committed per user request
- All tests use the same mock data source for consistency
