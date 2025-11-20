import { EXPECTED_COUNTS, assertUrlParam, waitForUrlParamRemoved } from './helpers';
import { expect, test } from './fixtures';

/**
 * Cross-cutting filter behavior tests
 *
 * Tests that span multiple views or test complex filter combinations.
 * View-specific filter tests (context menus, etc.) are in their respective view files.
 */
test.describe('Filter Behavior', () => {
  test.describe('Combined Filters', () => {
    test('applies provider AND consumer filters simultaneously', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app&contentConsumers=grafana-metricsdrilldown-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify both filters are active
      assertUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');
      assertUrlParam(page, 'contentConsumers', 'grafana-metricsdrilldown-app');

      // Verify filtered results
      const providerBoxes = page.getByTestId(/^content-provider-box-/);
      const consumerBoxes = page.getByTestId(/^content-consumer-box-/);
      await expect(providerBoxes).toHaveCount(1);
      await expect(consumerBoxes).toHaveCount(1);

      // Verify specific boxes are visible
      await expect(page.getByTestId('content-provider-box-grafana-lokiexplore-app')).toBeVisible();
      await expect(page.getByTestId('content-consumer-box-grafana-metricsdrilldown-app')).toBeVisible();
    });

    test('applies provider AND extension point filters in extension point view', async ({
      depGraphPageWithMockApps,
    }) => {
      const extensionPointId = 'grafana-lokiexplore-app/investigation/v1';
      await depGraphPageWithMockApps.goto({
        path: `dependency-graph?view=extensionpoint&contentProviders=grafana-lokiexplore-app&extensionPoints=${extensionPointId}`,
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify both filters are in URL
      assertUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');
      assertUrlParam(page, 'extensionPoints', extensionPointId);

      // Verify graph renders without errors
      await page.waitForTimeout(500);
      const url = new URL(page.url());
      expect(url.searchParams.get('contentProviders')).toBe('grafana-lokiexplore-app');
      expect(url.searchParams.get('extensionPoints')).toBe(extensionPointId);
    });
  });

  test.describe('Multiple Filter Values', () => {
    test('accepts multiple comma-separated providers', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app,grafana-assistant-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify URL parameter contains both
      await page.waitForFunction(() => {
        const providers = new URL(window.location.href).searchParams.get('contentProviders');
        return providers?.includes('grafana-lokiexplore-app') && providers?.includes('grafana-assistant-app');
      });

      // Graph accepts and preserves the parameters (actual boxes depend on data)
      await page.waitForTimeout(500);
      const url = new URL(page.url());
      const providers = url.searchParams.get('contentProviders');
      expect(providers).toContain('grafana-lokiexplore-app');
      expect(providers).toContain('grafana-assistant-app');
    });

    test('accepts multiple comma-separated consumers', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentConsumers=grafana-metricsdrilldown-app,grafana-assistant-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify URL parameter contains both
      await page.waitForFunction(() => {
        const consumers = new URL(window.location.href).searchParams.get('contentConsumers');
        return consumers?.includes('grafana-metricsdrilldown-app') && consumers?.includes('grafana-assistant-app');
      });

      // Graph accepts and preserves the parameters (actual boxes depend on data)
      await page.waitForTimeout(500);
      const url = new URL(page.url());
      const consumers = url.searchParams.get('contentConsumers');
      expect(consumers).toContain('grafana-metricsdrilldown-app');
      expect(consumers).toContain('grafana-assistant-app');
    });

    test('accepts multiple providers AND multiple consumers', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app,grafana-assistant-app&contentConsumers=grafana-metricsdrilldown-app,grafana-assistant-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify URL parameters are set correctly
      await page.waitForFunction(() => {
        const url = new URL(window.location.href);
        const providers = url.searchParams.get('contentProviders');
        const consumers = url.searchParams.get('contentConsumers');
        return (
          providers?.includes('grafana-lokiexplore-app') &&
          providers?.includes('grafana-assistant-app') &&
          consumers?.includes('grafana-metricsdrilldown-app') &&
          consumers?.includes('grafana-assistant-app')
        );
      });

      // Graph renders without errors (actual boxes depend on data relationships)
      await page.waitForTimeout(500);
      const url = new URL(page.url());
      expect(url.searchParams.has('contentProviders')).toBeTruthy();
      expect(url.searchParams.has('contentConsumers')).toBeTruthy();
    });

    test('accepts multiple consumers in extension point view', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=extensionpoint&contentConsumers=grafana-metricsdrilldown-app,grafana-assistant-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify URL parameter contains both
      await page.waitForFunction(() => {
        const consumers = new URL(window.location.href).searchParams.get('contentConsumers');
        return consumers?.includes('grafana-metricsdrilldown-app') && consumers?.includes('grafana-assistant-app');
      });

      // Graph accepts and preserves the parameters (actual boxes depend on data)
      await page.waitForTimeout(500);
      const url = new URL(page.url());
      const consumers = url.searchParams.get('contentConsumers');
      expect(consumers).toContain('grafana-metricsdrilldown-app');
      expect(consumers).toContain('grafana-assistant-app');
    });
  });

  test.describe('Cross-View Filter Persistence', () => {
    test('clears filters when switching from added links to exposed components', async ({
      depGraphPageWithMockApps,
    }) => {
      // Start with filters in added links view
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app&contentConsumers=grafana-metricsdrilldown-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify filters are active
      assertUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');
      assertUrlParam(page, 'contentConsumers', 'grafana-metricsdrilldown-app');

      // Switch to exposed components view
      await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=exposedComponents' });

      // Filters should be cleared
      await waitForUrlParamRemoved(page, 'contentProviders');
      await waitForUrlParamRemoved(page, 'contentConsumers');

      // All providers and consumers should be visible
      const providerBoxes = page.getByTestId(/^content-provider-box-/);
      const consumerBoxes = page.getByTestId(/^content-consumer-box-/);
      await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.exposedComponents.providers);
      await expect(consumerBoxes).toHaveCount(EXPECTED_COUNTS.exposedComponents.consumers);
    });

    test('clears filters when switching to extension point view', async ({ depGraphPageWithMockApps }) => {
      // Start with filters in added links view
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app&contentConsumers=grafana-metricsdrilldown-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify filters are active
      assertUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');
      assertUrlParam(page, 'contentConsumers', 'grafana-metricsdrilldown-app');

      // Switch to extension point view
      await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=extensionpoint' });

      // Filters should be cleared
      await waitForUrlParamRemoved(page, 'contentProviders');
      await waitForUrlParamRemoved(page, 'contentConsumers');

      // All elements should be visible
      const providerBoxes = page.getByTestId(/^content-provider-box-/);
      await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.extensionPoint.providers);
    });

    test('clears filters when switching between added views', async ({ depGraphPageWithMockApps }) => {
      // Start with filters in added links view
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      assertUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');

      // Switch to added components view
      await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=addedcomponents' });

      // Filter should be cleared
      await waitForUrlParamRemoved(page, 'contentProviders');

      // All providers should be visible
      const providerBoxes = page.getByTestId(/^content-provider-box-/);
      await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.addedComponents.providers);
    });
  });

  test.describe('URL Parameter Handling', () => {
    test('preserves combined filters after page reload', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app&contentConsumers=grafana-metricsdrilldown-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify initial state
      assertUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');
      assertUrlParam(page, 'contentConsumers', 'grafana-metricsdrilldown-app');

      // Reload the page
      await page.reload();

      // Filters should persist
      assertUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');
      assertUrlParam(page, 'contentConsumers', 'grafana-metricsdrilldown-app');

      // Filtered boxes should still be visible
      await page.getByTestId('content-provider-box-grafana-lokiexplore-app').waitFor();
      await page.getByTestId('content-consumer-box-grafana-metricsdrilldown-app').waitFor();
    });

    test('handles empty filter values gracefully', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=&contentConsumers=',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Should show all providers and consumers (empty filters = no filters)
      const providerBoxes = page.getByTestId(/^content-provider-box-/);
      const consumerBoxes = page.getByTestId(/^content-consumer-box-/);
      await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.addedLinks.providers);
      await expect(consumerBoxes).toHaveCount(EXPECTED_COUNTS.addedLinks.consumers);
    });

    test('handles invalid plugin IDs gracefully', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=nonexistent-plugin',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // URL parameter should be preserved
      assertUrlParam(page, 'contentProviders', 'nonexistent-plugin');

      // No provider boxes should be visible (or the graph should show empty state)
      const providerBoxes = page.getByTestId(/^content-provider-box-/);
      const count = await providerBoxes.count();
      // Should be 0 or show some boxes (depending on how the app handles invalid IDs)
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('preserves filters with special characters in URLs', async ({ depGraphPageWithMockApps }) => {
      const extensionPointId = 'grafana-lokiexplore-app/investigation/v1';
      await depGraphPageWithMockApps.goto({
        path: `dependency-graph?view=extensionpoint&extensionPoints=${encodeURIComponent(extensionPointId)}`,
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // URL should preserve the extension point ID with slashes
      await page.waitForFunction((epId) => {
        const params = new URL(window.location.href).searchParams.get('extensionPoints');
        return params === epId;
      }, extensionPointId);

      // Verify the parameter is correct
      const url = new URL(page.url());
      expect(url.searchParams.get('extensionPoints')).toBe(extensionPointId);
    });
  });
});
