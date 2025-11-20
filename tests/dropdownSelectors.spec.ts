import { EXPECTED_COUNTS, waitForUrlParam } from './helpers';
import { expect, test } from './fixtures';

import { dependencyGraphTestIds } from '../src/components/testIds';

/**
 * Tests for dropdown selector interactions
 *
 * Note: These tests focus on verifying the selectors are present and functional.
 * The Grafana MultiCombobox component has complex behavior that makes some
 * interactions difficult to test reliably in E2E tests.
 */
test.describe('Dropdown Selector Interactions', () => {
  test.describe('Content Provider Selector', () => {
    test.describe('in Added Links view', () => {
      test.beforeEach(async ({ depGraphPageWithMockApps }) => {
        await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=addedlinks' });
      });

      test('is visible and interactive', async ({ depGraphPageWithMockApps }) => {
        const { page } = depGraphPageWithMockApps.ctx;
        const selector = page.getByTestId(dependencyGraphTestIds.contentProviderSelector);

        await expect(selector).toBeVisible();
        await expect(selector).toBeEnabled();
      });

      test('shows dropdown options when clicked', async ({ depGraphPageWithMockApps }) => {
        const { page } = depGraphPageWithMockApps.ctx;
        const selector = page.getByTestId(dependencyGraphTestIds.contentProviderSelector);

        await selector.click();

        // Verify options appear (including "All" option, so count is providers + 1)
        const options = page.getByRole('option');
        await expect(options).toHaveCount(EXPECTED_COUNTS.addedLinks.providers + 1);
      });

      test('filters graph via URL parameter', async ({ depGraphPageWithMockApps }) => {
        await depGraphPageWithMockApps.goto({
          path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app',
        });
        const { page } = depGraphPageWithMockApps.ctx;

        // Verify URL parameter is set
        await waitForUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');

        // Verify only the filtered provider box is shown
        const providerBoxes = page.getByTestId(/^content-provider-box-/);
        await expect(providerBoxes).toHaveCount(1);
      });

      test('filters graph with multiple providers via URL', async ({ depGraphPageWithMockApps }) => {
        await depGraphPageWithMockApps.goto({
          path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app,grafana-assistant-app',
        });
        const { page } = depGraphPageWithMockApps.ctx;

        // Verify URL parameter contains both providers
        await page.waitForFunction(() => {
          const params = new URL(window.location.href).searchParams.get('contentProviders');
          return params?.includes('grafana-lokiexplore-app') && params?.includes('grafana-assistant-app');
        });

        // Verify both boxes are shown
        const providerBoxes = page.getByTestId(/^content-provider-box-/);
        await expect(providerBoxes).toHaveCount(2);
      });
    });

    test.describe('in Exposed Components view', () => {
      test.beforeEach(async ({ depGraphPageWithMockApps }) => {
        await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=exposedComponents' });
      });

      test('is visible', async ({ depGraphPageWithMockApps }) => {
        const { page } = depGraphPageWithMockApps.ctx;
        const selector = page.getByTestId(dependencyGraphTestIds.contentProviderSelector);

        await expect(selector).toBeVisible();
      });

      test('shows correct number of provider options', async ({ depGraphPageWithMockApps }) => {
        const { page } = depGraphPageWithMockApps.ctx;
        const selector = page.getByTestId(dependencyGraphTestIds.contentProviderSelector);

        await selector.click();

        // Providers + "All" option
        const options = page.getByRole('option');
        await expect(options).toHaveCount(EXPECTED_COUNTS.exposedComponents.providers + 1);
      });

      test('filters graph via URL parameter', async ({ depGraphPageWithMockApps }) => {
        await depGraphPageWithMockApps.goto({
          path: 'dependency-graph?view=exposedComponents&contentProviders=grafana-lokiexplore-app',
        });
        const { page } = depGraphPageWithMockApps.ctx;

        // Verify only one provider box is shown
        const providerBoxes = page.getByTestId(/^content-provider-box-/);
        await expect(providerBoxes).toHaveCount(1);
      });
    });
  });

  test.describe('Content Consumer Selector', () => {
    test.beforeEach(async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=addedlinks' });
    });

    test('is visible and interactive', async ({ depGraphPageWithMockApps }) => {
      const { page } = depGraphPageWithMockApps.ctx;
      const selector = page.getByTestId(dependencyGraphTestIds.contentConsumerSelector);

      await expect(selector).toBeVisible();
      await expect(selector).toBeEnabled();
    });

    test('shows dropdown options when clicked', async ({ depGraphPageWithMockApps }) => {
      const { page } = depGraphPageWithMockApps.ctx;
      const selector = page.getByTestId(dependencyGraphTestIds.contentConsumerSelector);

      await selector.click();

      // Verify options appear
      const options = page.getByRole('option');
      const count = await options.count();
      // Should have at least the expected consumers
      expect(count).toBeGreaterThanOrEqual(EXPECTED_COUNTS.addedLinks.consumers);
    });

    test('filters graph via URL parameter', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentConsumers=grafana-metricsdrilldown-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify URL parameter is set
      await waitForUrlParam(page, 'contentConsumers', 'grafana-metricsdrilldown-app');

      // Verify only the filtered consumer box is shown
      const consumerBoxes = page.getByTestId(/^content-consumer-box-/);
      await expect(consumerBoxes).toHaveCount(1);
    });
  });

  test.describe('Extension Point Selector', () => {
    test.beforeEach(async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=extensionpoint' });
    });

    test('is visible in extension point view', async ({ depGraphPageWithMockApps }) => {
      const { page } = depGraphPageWithMockApps.ctx;
      const selector = page.getByTestId(dependencyGraphTestIds.extensionPointSelector);

      await expect(selector).toBeVisible();
      await expect(selector).toBeEnabled();
    });

    test('shows many extension point options', async ({ depGraphPageWithMockApps }) => {
      const { page } = depGraphPageWithMockApps.ctx;
      const selector = page.getByTestId(dependencyGraphTestIds.extensionPointSelector);

      await selector.click();

      // Should have many extension points based on mock data
      const options = page.getByRole('option');
      const count = await options.count();
      expect(count).toBeGreaterThanOrEqual(10); // At least 10 options including "All"
    });

    test('filters extension points via URL parameter', async ({ depGraphPageWithMockApps }) => {
      const extensionPointId = 'grafana-lokiexplore-app/investigation/v1';
      await depGraphPageWithMockApps.goto({
        path: `dependency-graph?view=extensionpoint&extensionPoints=${extensionPointId}`,
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify URL parameter is set
      await waitForUrlParam(page, 'extensionPoints', extensionPointId);

      // Verify only filtered extension point is shown
      const extensionPointBoxes = page.getByTestId(/^extension-point-box-/);
      await expect(extensionPointBoxes).toHaveCount(1);
    });
  });

  test.describe('Visualization Mode Selector', () => {
    test.beforeEach(async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=addedlinks' });
    });

    test('is always visible', async ({ depGraphPageWithMockApps }) => {
      const { page } = depGraphPageWithMockApps.ctx;
      const selector = page.getByTestId(dependencyGraphTestIds.visualizationModeSelector);

      await expect(selector).toBeVisible();
      await expect(selector).toBeEnabled();
    });

    test('shows all visualization mode options when clicked', async ({ depGraphPageWithMockApps }) => {
      const { page } = depGraphPageWithMockApps.ctx;
      const selector = page.getByTestId(dependencyGraphTestIds.visualizationModeSelector);

      await selector.click();

      // Verify all modes are available
      await expect(page.getByRole('option').filter({ hasText: /exposed components/i })).toBeVisible();
      await expect(page.getByRole('option').filter({ hasText: /added links/i })).toBeVisible();
      await expect(page.getByRole('option').filter({ hasText: /added components/i })).toBeVisible();
      await expect(page.getByRole('option').filter({ hasText: /added functions/i })).toBeVisible();
      await expect(page.getByRole('option').filter({ hasText: /extension point/i })).toBeVisible();
    });

    test('changes view when different option is selected', async ({ depGraphPageWithMockApps }) => {
      const { page } = depGraphPageWithMockApps.ctx;
      const selector = page.getByTestId(dependencyGraphTestIds.visualizationModeSelector);

      await selector.click();
      await page
        .getByRole('option')
        .filter({ hasText: /exposed components/i })
        .click();

      // Verify URL changed
      await expect(page).toHaveURL(/view=exposedComponents/);

      // Verify correct number of boxes for new view
      const providerBoxes = page.getByTestId(/^content-provider-box-/);
      await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.exposedComponents.providers);
    });

    test('maintains current view when same option is selected', async ({ depGraphPageWithMockApps }) => {
      const { page } = depGraphPageWithMockApps.ctx;
      const initialUrl = page.url();

      const selector = page.getByTestId(dependencyGraphTestIds.visualizationModeSelector);
      await selector.click();
      await page
        .getByRole('option')
        .filter({ hasText: /added links/i })
        .click();

      // URL should not change significantly (might have minor params)
      await expect(page).toHaveURL(/view=addedlinks/);
    });
  });

  test.describe('Multiple Selectors Together', () => {
    test('both provider and consumer selectors are visible together', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=addedlinks' });
      const { page } = depGraphPageWithMockApps.ctx;

      const providerSelector = page.getByTestId(dependencyGraphTestIds.contentProviderSelector);
      const consumerSelector = page.getByTestId(dependencyGraphTestIds.contentConsumerSelector);

      await expect(providerSelector).toBeVisible();
      await expect(consumerSelector).toBeVisible();
    });

    test('works with combined provider and consumer filters via URL', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app&contentConsumers=grafana-metricsdrilldown-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify both filters are active
      await waitForUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');
      await waitForUrlParam(page, 'contentConsumers', 'grafana-metricsdrilldown-app');

      // Verify filtered results
      const providerBoxes = page.getByTestId(/^content-provider-box-/);
      const consumerBoxes = page.getByTestId(/^content-consumer-box-/);
      await expect(providerBoxes).toHaveCount(1);
      await expect(consumerBoxes).toHaveCount(1);
    });

    test('extension point selector only visible in extension point view', async ({ depGraphPageWithMockApps }) => {
      // In added links view
      await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=addedlinks' });
      const { page } = depGraphPageWithMockApps.ctx;
      await expect(page.getByTestId(dependencyGraphTestIds.extensionPointSelector)).toHaveCount(0);

      // In extension point view
      await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=extensionpoint' });
      await expect(page.getByTestId(dependencyGraphTestIds.extensionPointSelector)).toBeVisible();
    });
  });
});
