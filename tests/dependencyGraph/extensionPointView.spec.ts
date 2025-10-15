import { clickSvg, expect, test } from '../fixtures';
import { dependencyGraphTestIdPrefixes, dependencyGraphTestIds } from '../../src/dependency-graph/testIds';

// Extension Point View E2E tests

test.describe('Extension Point View', () => {
  test.beforeEach(async ({ depGraphPageWithMockApps }) => {
    await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=extensionpoint' });
  });

  test('shows view, content provider, content consumer, and extension point selectors', async ({
    depGraphPageWithMockApps,
  }) => {
    const page = depGraphPageWithMockApps.ctx.page;
    const vizSelector = page.getByTestId(dependencyGraphTestIds.visualizationModeSelector);
    const providerSelector = page.getByTestId(dependencyGraphTestIds.contentProviderSelector);
    const consumerSelector = page.getByTestId(dependencyGraphTestIds.contentConsumerSelector);
    const extensionPointSelector = page.getByTestId(dependencyGraphTestIds.extensionPointSelector);

    await expect(vizSelector).toBeVisible();
    await expect(providerSelector).toHaveAttribute('data-testid', dependencyGraphTestIds.contentProviderSelector);
    await expect(consumerSelector).toHaveAttribute('data-testid', dependencyGraphTestIds.contentConsumerSelector);
    await expect(extensionPointSelector).toHaveAttribute('data-testid', dependencyGraphTestIds.extensionPointSelector);
    await expect(extensionPointSelector).toBeVisible();
  });

  test('displays 5 content provider boxes and 5 content consumer boxes', async ({ depGraphPageWithMockApps }) => {
    const page = depGraphPageWithMockApps.ctx.page;
    const providerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`));
    const consumerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`));
    await expect(providerBoxes).toHaveCount(5);
    await expect(consumerBoxes).toHaveCount(5);
  });

  test.describe('filtering', () => {
    test('filters content providers by id', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=extensionpoint&contentProviders=grafana-lokiexplore-app',
      });
      const page = depGraphPageWithMockApps.ctx.page;
      const providerBoxesAfterFilter = page.getByTestId(
        new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`)
      );
      await expect(providerBoxesAfterFilter).toHaveCount(1);
      await expect(providerBoxesAfterFilter.first()).toHaveAttribute(
        'data-testid',
        dependencyGraphTestIds.contentProviderBox('grafana-lokiexplore-app')
      );
    });

    test('filters extension points using context menu', async ({ depGraphPageWithMockApps }) => {
      const page = depGraphPageWithMockApps.ctx.page;

      // Wait for extension point boxes to be rendered
      const extensionPointId = 'grafana-metricsdrilldown-app/open-in-logs-drilldown/v1';
      const specificExtensionPoint = page.getByTestId(dependencyGraphTestIds.extensionPointBox(extensionPointId));
      await expect(specificExtensionPoint).toBeVisible();

      await clickSvg(specificExtensionPoint);

      // Click "Filter by this extension point" option in the context menu
      await page.getByRole('menuitem').getByText('Filter by this extension point').click();

      // Wait for URL to be updated with the extensionPoints filter
      await page.waitForFunction(
        (epId) => new URL(window.location.href).searchParams.get('extensionPoints') === epId,
        extensionPointId
      );

      // Verify that only the filtered extension point is visible
      const filteredExtensionPointBoxes = page.getByTestId(
        new RegExp(`^${dependencyGraphTestIdPrefixes.extensionPointBox}`)
      );
      await expect(filteredExtensionPointBoxes).toHaveCount(1);
      await expect(filteredExtensionPointBoxes.first()).toHaveAttribute(
        'data-testid',
        dependencyGraphTestIds.extensionPointBox(extensionPointId)
      );
    });

    test('can remove extension point filter and restore extension points', async ({ depGraphPageWithMockApps }) => {
      await depGraphPageWithMockApps.goto({
        path: 'dependency-graph?view=extensionpoint&extensionPoints=grafana-exploremetrics-app/investigation/v1',
      });
      const page = depGraphPageWithMockApps.ctx.page;
      await clickSvg(
        page.getByTestId(dependencyGraphTestIds.extensionPointBox('grafana-exploremetrics-app/investigation/v1'))
      );
      await page.getByRole('menuitem').getByText('Remove filter').click();

      // Wait for the URL param to be removed
      await page.waitForFunction(() => !new URL(window.location.href).searchParams.get('extensionPoints'));

      const extensionPointBoxesAfterRemove = page.getByTestId(new RegExp('^extension-point-box-'));
      await expect(extensionPointBoxesAfterRemove).toHaveCount(26);
    });
  });
});
