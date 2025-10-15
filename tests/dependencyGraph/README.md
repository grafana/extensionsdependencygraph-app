# Dependency Graph E2E Tests

This directory contains end-to-end tests for the Dependency Graph feature using Playwright.

## Test Files

- **extensionPointView.spec.ts** - Tests for Extension Point visualization mode
- **exposedComponents.spec.ts** - Tests for Exposed Components visualization mode
- **addedLinksView.spec.ts** - Tests for Added Links visualization mode
- **addedComponentsView.spec.ts** - Tests for Added Components visualization mode
- **addedFunctionsView.spec.ts** - Tests for Added Functions visualization mode
- **helpers.ts** - Shared helper functions and constants

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

## Best Practices Followed

### 1. **Consistent Navigation**

- All tests use `depGraphPageWithMockApps.goto()` for navigation
- No hardcoded URLs outside of test setup
- Clear path parameters in navigation calls

### 2. **Helper Functions**

- Common wait patterns extracted to `helpers.ts`
- Expected counts defined as constants (`EXPECTED_COUNTS`)
- Reusable assertion functions for URL parameters

### 3. **Clear Test Names**

- Descriptive test names that explain what is being tested
- Consistent naming conventions across all files
- Proper test grouping with `describe` blocks

### 4. **Proper Waiting Strategies**

- Use `waitForUrlParam()` instead of arbitrary timeouts
- Use `expect().toBeVisible()` for element visibility
- Use `page.waitForFunction()` for URL changes

### 5. **Type Safety**

- Non-null assertions (`!`) used where appropriate
- Proper typing for all helper functions
- No implicit `any` types

### 6. **Code Reusability**

- Common patterns extracted to helper functions
- Test data defined as constants
- Consistent page variable extraction pattern

### 7. **Test Independence**

- Each test is independent and can run in isolation
- Proper use of `beforeEach` for setup
- No test depends on the state from another test

### 8. **Clear Assertions**

- Use descriptive assertion methods
- Multiple assertions per test when appropriate
- Clear verification of expected behavior

## Helper Functions

### Navigation and Waiting

- `waitForUrlParam(page, paramName, expectedValue)` - Wait for a URL parameter to be set
- `waitForUrlParamRemoved(page, paramName)` - Wait for a URL parameter to be removed

### Assertions

- `assertUrlParam(page, paramName, expectedValue)` - Assert URL parameter value
- `assertUrlParamAbsent(page, paramName)` - Assert URL parameter is not present

### Utilities

- `extractPluginIdFromTestId(testId, prefix)` - Extract plugin ID from test ID

### Constants

- `EXPECTED_COUNTS` - Expected box counts for each visualization mode

## Running Tests

```bash
# Run all dependency graph tests
npx playwright test tests/dependencyGraph/

# Run a specific test file
npx playwright test tests/dependencyGraph/extensionPointView.spec.ts

# Run tests in headed mode
npx playwright test tests/dependencyGraph/ --headed

# Run tests with UI
npx playwright test tests/dependencyGraph/ --ui
```

## Mock Data

Tests use mock application data defined in `tests/mockApps.json`. This data includes:

- 5 content providers in various views
- Multiple extension points
- Exposed components
- Added links, components, and functions

## Refactoring History

The tests were refactored to follow Playwright best practices:

- ✅ Removed dead code and deprecated functions
- ✅ Extracted common patterns to helper functions
- ✅ Standardized navigation and waiting patterns
- ✅ Improved type safety
- ✅ Added expected count constants
- ✅ Improved test descriptions
- ✅ Consistent code style across all files
