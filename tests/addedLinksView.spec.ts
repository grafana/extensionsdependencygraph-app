import {
  EXPECTED_COUNTS,
  assertUrlParam,
  assertUrlParamAbsent,
  extractPluginIdFromTestId,
  waitForUrlParam,
  waitForUrlParamRemoved,
} from './helpers';
import { clickSvg, expect, test } from './fixtures';
import { dependencyGraphTestIdPrefixes, dependencyGraphTestIds } from '../src/components/testIds';

test.describe('Added Links View', () => {
  test.beforeEach(async ({ depGraphPageWithMockApps }) => {
    await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=addedlinks' });
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

    await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.addedLinks.providers);
    await expect(consumerBoxes).toHaveCount(EXPECTED_COUNTS.addedLinks.consumers);
  });

  test.describe('filtering', () => {
    test.describe('providers', () => {
      test('filters provider via context menu', async ({ depGraphPageWithMockApps }) => {
        const { page } = depGraphPageWithMockApps.ctx;
        const providerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`));
        await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.addedLinks.providers);

        // Click first provider and apply filter
        const firstProvider = providerBoxes.first();
        const testId = (await firstProvider.getAttribute('data-testid'))!;
        const providerId = extractPluginIdFromTestId(testId, dependencyGraphTestIdPrefixes.contentProviderBox);

        await firstProvider.click();
        await page
          .getByRole('menuitem')
          .getByText(/Filter by/i)
          .click();

        // Verify filter is applied
        await waitForUrlParam(page, 'contentProviders', providerId);
        assertUrlParam(page, 'contentProviders', providerId);
        await expect(providerBoxes).toHaveCount(1);
        await expect(providerBoxes).toHaveAttribute('data-testid', testId);
      });

      test('removes provider filter via context menu', async ({ depGraphPageWithMockApps }) => {
        const providerId = 'grafana-exploretraces-app';
        await depGraphPageWithMockApps.goto({
          path: `dependency-graph?view=addedlinks&contentProviders=${providerId}`,
        });
        const { page } = depGraphPageWithMockApps.ctx;

        await page.getByTestId(dependencyGraphTestIds.contentProviderBox(providerId)).click();
        await page.getByRole('menuitem').getByText('Remove filter').click();

        await waitForUrlParamRemoved(page, 'contentProviders');
        const providerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`));
        await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.addedLinks.providers);
      });
    });

    test.describe('consumers', () => {
      test('filters consumer via context menu', async ({ depGraphPageWithMockApps }) => {
        const { page } = depGraphPageWithMockApps.ctx;
        const consumerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`));
        await expect(consumerBoxes).toHaveCount(EXPECTED_COUNTS.addedLinks.consumers);

        // Click second consumer (first might have special behavior) and apply filter
        const targetConsumer = consumerBoxes.nth(1);
        const testId = (await targetConsumer.getAttribute('data-testid'))!;
        const consumerId = extractPluginIdFromTestId(testId, dependencyGraphTestIdPrefixes.contentConsumerBox);

        await clickSvg(targetConsumer);
        await page
          .getByRole('menuitem')
          .getByText(/Filter by/i)
          .click();

        // Navigate to the filtered view
        await depGraphPageWithMockApps.goto({
          path: `dependency-graph?view=addedlinks&contentConsumers=${consumerId}`,
        });
        await waitForUrlParam(page, 'contentConsumers', consumerId);

        // Verify filter is applied
        assertUrlParam(page, 'contentConsumers', consumerId);
        await expect(consumerBoxes).toHaveCount(1);
        await expect(consumerBoxes).toHaveAttribute('data-testid', testId);
      });

      test('removes consumer filter via context menu', async ({ depGraphPageWithMockApps }) => {
        const { page } = depGraphPageWithMockApps.ctx;
        const consumerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`));
        await expect(consumerBoxes).toHaveCount(EXPECTED_COUNTS.addedLinks.consumers);

        const targetConsumer = consumerBoxes.nth(1);
        const testId = (await targetConsumer.getAttribute('data-testid'))!;
        const consumerId = extractPluginIdFromTestId(testId, dependencyGraphTestIdPrefixes.contentConsumerBox);

        // Navigate to filtered view
        await page.goto(`${page.url()}&contentConsumers=${consumerId}`);
        await waitForUrlParam(page, 'contentConsumers', consumerId);

        // Remove filter
        await clickSvg(page.getByTestId(dependencyGraphTestIds.contentConsumerBox(consumerId)));
        await page.getByRole('menuitem').getByText('Remove filter').click();

        await waitForUrlParamRemoved(page, 'contentConsumers');
        await expect(consumerBoxes).toHaveCount(EXPECTED_COUNTS.addedLinks.consumers);
      });
    });

    test('clears filters when changing view', async ({ depGraphPageWithMockApps }) => {
      const { page } = depGraphPageWithMockApps.ctx;
      await page.goto(
        `${page.url()}&contentConsumers=grafana-metricsdrilldown-app&contentProviders=grafana-lokiexplore-app`
      );

      // Verify both params are present
      await waitForUrlParam(page, 'contentConsumers', 'grafana-metricsdrilldown-app');
      await waitForUrlParam(page, 'contentProviders', 'grafana-lokiexplore-app');

      // Change to Exposed components view
      await page.getByTestId(dependencyGraphTestIds.visualizationModeSelector).click();
      await page
        .getByRole('option')
        .getByText(/Exposed components/i)
        .click();

      // Verify filters are cleared (use toHaveURL which is faster than waitForFunction)
      await expect(page).toHaveURL(/view=exposedComponents/);
      assertUrlParamAbsent(page, 'contentConsumers');
      assertUrlParamAbsent(page, 'contentProviders');
    });
  });
});
