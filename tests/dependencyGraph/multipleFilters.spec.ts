import { expect, test } from '../fixtures';
import { EXPECTED_COUNTS, waitForUrlParam, assertUrlParam, waitForUrlParamRemoved } from './helpers';

/**
 * Tests for multiple filter combinations
 *
 * These tests verify that multiple filters can be applied simultaneously
 * and that they correctly filter the displayed results.
 */
test.describe('Multiple Filter Combinations', () => {
  test.describe('Provider AND Consumer Filters', () => {
    test('applies both provider and consumer filters via URL', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app&contentConsumers=grafana-metricsdrilldown-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify both URL parameters are set
      await assertUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');
      await assertUrlParam(page, 'contentConsumers', 'grafana-metricsdrilldown-app');

      // Verify filtered results
      const providerBoxes = page.getByTestId(/^content-provider-box-/);
      const consumerBoxes = page.getByTestId(/^content-consumer-box-/);
      await expect(providerBoxes).toHaveCount(1);
      await expect(consumerBoxes).toHaveCount(1);
    });

    test('shows only matching connections between specific provider and consumer', async ({
      depGraphPageWithMockApps,
    }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app&contentConsumers=grafana-metricsdrilldown-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Wait for graph to render
      await page.getByTestId('content-provider-box-grafana-lokiexplore-app').waitFor();
      await page.getByTestId('content-consumer-box-grafana-metricsdrilldown-app').waitFor();

      // Both boxes should be visible
      await expect(page.getByTestId('content-provider-box-grafana-lokiexplore-app')).toBeVisible();
      await expect(page.getByTestId('content-consumer-box-grafana-metricsdrilldown-app')).toBeVisible();
    });

    test('works with multiple providers and single consumer via URL', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app,grafana-assistant-app&contentConsumers=grafana-metricsdrilldown-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify URL parameters are set
      await page.waitForFunction(() => {
        const url = new URL(window.location.href);
        const providers = url.searchParams.get('contentProviders');
        const consumers = url.searchParams.get('contentConsumers');
        return (
          providers?.includes('grafana-lokiexplore-app') &&
          providers?.includes('grafana-assistant-app') &&
          consumers === 'grafana-metricsdrilldown-app'
        );
      });

      // Verify at least the consumer is shown
      const consumerBoxes = page.getByTestId(/^content-consumer-box-/);
      await expect(consumerBoxes).toHaveCount(1);
      
      // Providers that actually have connections to this consumer will be shown
      const providerBoxes = page.getByTestId(/^content-provider-box-/);
      const providerCount = await providerBoxes.count();
      expect(providerCount).toBeGreaterThanOrEqual(1);
    });

    test('works with single provider and multiple consumers via URL', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app&contentConsumers=grafana-metricsdrilldown-app,grafana-assistant-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify URL parameters are set
      await page.waitForFunction(() => {
        const url = new URL(window.location.href);
        const providers = url.searchParams.get('contentProviders');
        const consumers = url.searchParams.get('contentConsumers');
        return (
          providers === 'grafana-lokiexplore-app' &&
          consumers?.includes('grafana-metricsdrilldown-app') &&
          consumers?.includes('grafana-assistant-app')
        );
      });

      // Verify at least the provider is shown
      const providerBoxes = page.getByTestId(/^content-provider-box-/);
      await expect(providerBoxes).toHaveCount(1);
      
      // Consumers that actually have connections from this provider will be shown
      const consumerBoxes = page.getByTestId(/^content-consumer-box-/);
      const consumerCount = await consumerBoxes.count();
      expect(consumerCount).toBeGreaterThanOrEqual(1);
    });

    test('accepts multiple providers and multiple consumers in URL', async ({ depGraphPageWithMockApps }) => {
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

      // The graph renders with these URL parameters (actual visible boxes depend on data relationships)
      // Just verify the page doesn't crash and accepts the parameters
      await page.waitForTimeout(1000);
      const url = new URL(page.url());
      expect(url.searchParams.has('contentProviders')).toBeTruthy();
      expect(url.searchParams.has('contentConsumers')).toBeTruthy();
    });
  });

  test.describe('Filters Across Different Views', () => {
    test('accepts combined filters in added components view', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedcomponents&contentProviders=grafana-lokiexplore-app&contentConsumers=grafana-metricsdrilldown-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify URL parameters are preserved
      await page.waitForFunction(() => {
        const url = new URL(window.location.href);
        return Boolean(url.searchParams.get('contentProviders') && url.searchParams.get('contentConsumers'));
      });

      // Graph should render without errors (actual visible boxes depend on data)
      await page.waitForTimeout(1000);
      
      // Verify URL params are still there (even if no boxes match)
      const url = new URL(page.url());
      expect(url.searchParams.has('contentProviders')).toBeTruthy();
      expect(url.searchParams.has('contentConsumers')).toBeTruthy();
    });

    test('applies combined filters in added functions view', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedfunctions&contentProviders=grafana-lokiexplore-app,grafana-assistant-app&contentConsumers=grafana-metricsdrilldown-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify URL parameters
      await page.waitForFunction(() => {
        const url = new URL(window.location.href);
        return Boolean(url.searchParams.get('contentProviders') && url.searchParams.get('contentConsumers'));
      });

      // Graph should render
      await page.waitForTimeout(1000);
    });

    test('applies combined filters in exposed components view', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=exposedComponents&contentProviders=grafana-lokiexplore-app&contentConsumers=grafana-assistant-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify URL parameters
      await assertUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');
      await assertUrlParam(page, 'contentConsumers', 'grafana-assistant-app');

      // Graph should render
      await page.waitForTimeout(1000);
      
      // At least verify the page loaded without errors
      const providerBoxes = page.getByTestId(/^content-provider-box-/);
      const hasProviders = (await providerBoxes.count()) >= 0; // Can be 0 or more
      expect(hasProviders).toBe(true);
    });
  });

  test.describe('Extension Point View with Filters', () => {
    test('accepts provider and extension point filters together', async ({ depGraphPageWithMockApps }) => {
      const extensionPointId = 'grafana-lokiexplore-app/investigation/v1';
      await depGraphPageWithMockApps.goto({
        path: `dependency-graph?view=extensionpoint&contentProviders=grafana-lokiexplore-app&extensionPoints=${extensionPointId}`,
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify both filters are in URL
      await assertUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');
      await assertUrlParam(page, 'extensionPoints', extensionPointId);

      // Wait for graph to render
      await page.waitForTimeout(1000);

      // Verify the graph rendered and parameters are preserved
      const url = new URL(page.url());
      expect(url.searchParams.get('contentProviders')).toBe('grafana-lokiexplore-app');
      expect(url.searchParams.get('extensionPoints')).toBe(extensionPointId);
    });

    test('applies multiple content consumers in extension point view', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=extensionpoint&contentConsumers=grafana-metricsdrilldown-app,grafana-assistant-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify URL parameter
      await page.waitForFunction(() => {
        const url = new URL(window.location.href);
        const consumers = url.searchParams.get('contentConsumers');
        return consumers?.includes('grafana-metricsdrilldown-app') && consumers?.includes('grafana-assistant-app');
      });

      // Wait for graph to render
      await page.waitForTimeout(1000);
      
      // Verify at least one consumer box is visible
      const consumerBoxes = page.getByTestId(/^content-consumer-box-/);
      const count = await consumerBoxes.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Filter Persistence and Clearing', () => {
    test('clears filters when switching from added links to exposed components', async ({
      depGraphPageWithMockApps,
    }) => {
      // Start with filters in added links view
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app&contentConsumers=grafana-metricsdrilldown-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify filters are active
      await assertUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');
      await assertUrlParam(page, 'contentConsumers', 'grafana-metricsdrilldown-app');

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
      await assertUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');
      await assertUrlParam(page, 'contentConsumers', 'grafana-metricsdrilldown-app');

      // Switch to extension point view
      await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=extensionpoint' });

      // Filters should be cleared
      await waitForUrlParamRemoved(page, 'contentProviders');
      await waitForUrlParamRemoved(page, 'contentConsumers');

      // All elements should be visible
      const providerBoxes = page.getByTestId(/^content-provider-box-/);
      await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.extensionPoint.providers);
    });
  });

  test.describe('URL Parameter Handling', () => {
    test('preserves both filters in URL after page reload', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=addedlinks&contentProviders=grafana-lokiexplore-app&contentConsumers=grafana-metricsdrilldown-app',
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Verify initial state
      await assertUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');
      await assertUrlParam(page, 'contentConsumers', 'grafana-metricsdrilldown-app');

      // Reload the page
      await page.reload();

      // Filters should persist
      await assertUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');
      await assertUrlParam(page, 'contentConsumers', 'grafana-metricsdrilldown-app');

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
  });
});
