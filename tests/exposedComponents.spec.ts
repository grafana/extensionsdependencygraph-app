import {
  EXPECTED_COUNTS,
  assertUrlParam,
  assertUrlParamAbsent,
  waitForUrlParam,
  waitForUrlParamRemoved,
} from './helpers';
import { clickSvg, expect, test } from './fixtures';
import { dependencyGraphTestIdPrefixes, dependencyGraphTestIds } from '../src/components/testIds';

test.describe('Exposed Components View', () => {
  test.beforeEach(async ({ depGraphPageWithMockApps }) => {
    await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=exposedComponents' });
  });

  test('shows correct selectors', async ({ depGraphPageWithMockApps }) => {
    const { page } = depGraphPageWithMockApps.ctx;

    await expect(page.getByTestId(dependencyGraphTestIds.visualizationModeSelector)).toBeVisible();
    await expect(page.getByTestId(dependencyGraphTestIds.contentProviderSelector)).toBeVisible();
    await expect(page.getByTestId(dependencyGraphTestIds.contentConsumerSelector)).toBeVisible();
    await expect(page.getByTestId(dependencyGraphTestIds.extensionPointSelector)).toHaveCount(0);
  });

  test('displays expected number of provider and consumer boxes', async ({ depGraphPageWithMockApps }) => {
    const { page } = depGraphPageWithMockApps.ctx;
    const providerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`));
    const consumerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`));

    await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.exposedComponents.providers);
    await expect(consumerBoxes).toHaveCount(EXPECTED_COUNTS.exposedComponents.consumers);
  });

  test.describe('filtering', () => {
    const testProviderId = 'grafana-lokiexplore-app';
    const testConsumerId = 'grafana-lokiexplore-app';

    test.describe('providers', () => {
      test.beforeEach(async ({ depGraphPageWithMockApps }) => {
        await depGraphPageWithMockApps.goto({
          path: `dependency-graph?view=exposedComponents&contentProviders=${testProviderId}`,
        });
      });

      test('URL parameter is set correctly', async ({ depGraphPageWithMockApps }) => {
        const { page } = depGraphPageWithMockApps.ctx;
        assertUrlParam(page, 'contentProviders', testProviderId);
      });

      test('displays only filtered provider', async ({ depGraphPageWithMockApps }) => {
        const { page } = depGraphPageWithMockApps.ctx;
        const providerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`));

        await expect(providerBoxes).toHaveCount(1);
        await expect(providerBoxes).toHaveAttribute(
          'data-testid',
          dependencyGraphTestIds.contentProviderBox(testProviderId)
        );
      });
    });

    test.describe('consumers', () => {
      test.beforeEach(async ({ depGraphPageWithMockApps }) => {
        await depGraphPageWithMockApps.goto({
          path: `dependency-graph?view=exposedComponents&contentConsumers=${testConsumerId}`,
        });
      });

      test('URL parameter is set correctly', async ({ depGraphPageWithMockApps }) => {
        const { page } = depGraphPageWithMockApps.ctx;
        assertUrlParam(page, 'contentConsumers', testConsumerId);
      });

      test('displays only filtered consumer', async ({ depGraphPageWithMockApps }) => {
        const { page } = depGraphPageWithMockApps.ctx;
        const consumerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`));

        await expect(consumerBoxes).toHaveCount(1);
        await expect(consumerBoxes).toHaveAttribute(
          'data-testid',
          dependencyGraphTestIds.contentConsumerBox(testConsumerId)
        );
      });
    });

    test.describe('remove filter', () => {
      test('removes provider filter via context menu', async ({ depGraphPageWithMockApps }) => {
        await depGraphPageWithMockApps.goto({
          path: `dependency-graph?view=exposedComponents&contentProviders=${testProviderId}`,
        });
        const { page } = depGraphPageWithMockApps.ctx;

        await clickSvg(page.getByTestId(dependencyGraphTestIds.contentProviderBox(testProviderId)));
        await page.getByRole('menuitem').getByText('Remove filter').click();

        await waitForUrlParamRemoved(page, 'contentProviders');
        const providerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`));
        await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.exposedComponents.providers);
      });

      test('removes consumer filter via context menu', async ({ depGraphPageWithMockApps }) => {
        await depGraphPageWithMockApps.goto({
          path: `dependency-graph?view=exposedComponents&contentConsumers=${testConsumerId}`,
        });
        const { page } = depGraphPageWithMockApps.ctx;

        await clickSvg(page.getByTestId(dependencyGraphTestIds.contentConsumerBox(testConsumerId)));
        await page.getByRole('menuitem').getByText('Remove filter').click();

        await waitForUrlParamRemoved(page, 'contentConsumers');
        const consumerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`));
        await expect(consumerBoxes).toHaveCount(EXPECTED_COUNTS.exposedComponents.consumers);
      });

      test('clears filters when changing view', async ({ depGraphPageWithMockApps }) => {
        await depGraphPageWithMockApps.goto({
          path: `dependency-graph?view=exposedComponents&contentProviders=${testProviderId}`,
        });
        const { page } = depGraphPageWithMockApps.ctx;

        // Change to Added links view
        await page.getByTestId(dependencyGraphTestIds.visualizationModeSelector).click();
        await page
          .getByRole('option')
          .getByText(/Added links/i)
          .click();

        // Verify filters are cleared
        await expect(page).toHaveURL(/view=addedlinks/);
        assertUrlParamAbsent(page, 'contentConsumers');
        assertUrlParamAbsent(page, 'contentProviders');
      });
    });
  });
});
