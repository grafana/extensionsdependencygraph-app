import * as semver from 'semver';
import { EXPECTED_COUNTS, waitForUrlParam, waitForUrlParamRemoved } from './helpers';
import { clickSvg, expect, test } from './fixtures';
import { dependencyGraphTestIdPrefixes, dependencyGraphTestIds } from '../src/components/testIds';

test.describe('Extension Point View', () => {
  test.beforeEach(async ({ depGraphPageWithMockApps }) => {
    await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=extensionpoint' });
  });

  test('shows all required selectors', async ({ depGraphPageWithMockApps, grafanaVersion }) => {
    const { page } = depGraphPageWithMockApps.ctx;
    test.skip(semver.lt(grafanaVersion, '12.2.0'), 'Combobox not reliably testable before Grafana 12.2');

    await expect(page.getByTestId(dependencyGraphTestIds.visualizationModeSelector)).toBeVisible();
    await expect(page.getByTestId(dependencyGraphTestIds.contentProviderSelector)).toBeVisible();
    await expect(page.getByTestId(dependencyGraphTestIds.contentConsumerSelector)).toBeVisible();
    await expect(page.getByTestId(dependencyGraphTestIds.extensionPointSelector)).toBeVisible();
  });

  test('displays expected number of provider and consumer boxes', async ({ depGraphPageWithMockApps }) => {
    const { page } = depGraphPageWithMockApps.ctx;
    const providerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`));
    const consumerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`));

    await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.extensionPoint.providers);
    await expect(consumerBoxes).toHaveCount(EXPECTED_COUNTS.extensionPoint.consumers);
  });

  test.describe('filtering', () => {
    test('filters content providers via URL parameter', async ({ depGraphPageWithMockApps }) => {
      const providerId = 'grafana-lokiexplore-app';
      await depGraphPageWithMockApps.goto({
        path: `dependency-graph?view=extensionpoint&contentProviders=${providerId}`,
      });
      const { page } = depGraphPageWithMockApps.ctx;

      const providerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`));
      await expect(providerBoxes).toHaveCount(1);
      await expect(providerBoxes).toHaveAttribute('data-testid', dependencyGraphTestIds.contentProviderBox(providerId));
    });

    test('filters extension points using context menu', async ({ depGraphPageWithMockApps }) => {
      const { page } = depGraphPageWithMockApps.ctx;
      const extensionPointId = 'grafana-metricsdrilldown-app/open-in-logs-drilldown/v1';

      // Wait for the specific extension point to be visible
      const specificExtensionPoint = page.getByTestId(dependencyGraphTestIds.extensionPointBox(extensionPointId));
      await expect(specificExtensionPoint).toBeVisible();

      // Open context menu and apply filter
      await clickSvg(specificExtensionPoint);
      await page.getByRole('menuitem').getByText('Filter by this extension point').click();

      // Verify URL is updated and only filtered extension point is visible
      await waitForUrlParam(page, 'extensionPoints', extensionPointId);
      const filteredBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.extensionPointBox}`));
      await expect(filteredBoxes).toHaveCount(1);
      await expect(filteredBoxes).toHaveAttribute(
        'data-testid',
        dependencyGraphTestIds.extensionPointBox(extensionPointId)
      );
    });

    test('removes extension point filter via context menu', async ({ depGraphPageWithMockApps }) => {
      const extensionPointId = 'grafana-exploremetrics-app/investigation/v1';
      await depGraphPageWithMockApps.goto({
        path: `dependency-graph?view=extensionpoint&extensionPoints=${extensionPointId}`,
      });
      const { page } = depGraphPageWithMockApps.ctx;

      // Remove filter via context menu
      await clickSvg(page.getByTestId(dependencyGraphTestIds.extensionPointBox(extensionPointId)));
      await page.getByRole('menuitem').getByText('Remove filter').click();

      // Verify URL parameter is removed and all extension points are restored
      await waitForUrlParamRemoved(page, 'extensionPoints');
      const extensionPointBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.extensionPointBox}`));
      await expect(extensionPointBoxes).toHaveCount(EXPECTED_COUNTS.extensionPoint.extensionPoints);
    });
  });
});
