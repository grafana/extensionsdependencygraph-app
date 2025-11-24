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

test.describe('Added Components View', () => {
  test.beforeEach(async ({ depGraphPageWithMockApps }) => {
    await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=addedcomponents' });
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

    await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.addedComponents.providers);
    await expect(consumerBoxes).toHaveCount(EXPECTED_COUNTS.addedComponents.consumers);
  });

  test.describe('filtering', () => {
    test.describe('providers', () => {
      test('filters provider via context menu', async ({ depGraphPageWithMockApps }) => {
        const { page } = depGraphPageWithMockApps.ctx;
        const providerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`));
        await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.addedComponents.providers);

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
        const { page } = depGraphPageWithMockApps.ctx;
        const providerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`));

        // Wait for boxes to be visible and get a valid provider ID
        await expect(providerBoxes.first()).toBeVisible();
        const firstProviderTestId = (await providerBoxes.first().getAttribute('data-testid'))!;
        const providerId = extractPluginIdFromTestId(
          firstProviderTestId,
          dependencyGraphTestIdPrefixes.contentProviderBox
        );

        // Navigate to filtered view with timeout and wait for load state
        await depGraphPageWithMockApps.goto({
          path: `dependency-graph?view=addedcomponents&contentProviders=${providerId}`,
        });

        // Wait for the page to be ready - check for a key element
        await expect(page.getByTestId(dependencyGraphTestIds.visualizationModeSelector)).toBeVisible();

        // Wait for the filtered provider box to be visible before proceeding
        await expect(page.getByTestId(dependencyGraphTestIds.contentProviderBox(providerId))).toBeVisible();

        // Remove filter
        await page.getByTestId(dependencyGraphTestIds.contentProviderBox(providerId)).click();
        await page.getByRole('menuitem').getByText('Remove filter').click();

        await waitForUrlParamRemoved(page, 'contentProviders');

        // Re-navigate to ensure proper view state
        await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=addedcomponents' });

        // Wait for all provider boxes to be visible
        await expect(providerBoxes.first()).toBeVisible();
        await expect(providerBoxes).toHaveCount(EXPECTED_COUNTS.addedComponents.providers);
      });
    });

    test.describe('consumers', () => {
      test('filters consumer via context menu', async ({ depGraphPageWithMockApps }) => {
        const { page } = depGraphPageWithMockApps.ctx;
        const consumerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`));
        await expect(consumerBoxes).toHaveCount(EXPECTED_COUNTS.addedComponents.consumers);

        // Click first consumer and apply filter
        const firstConsumer = consumerBoxes.first();
        const testId = (await firstConsumer.getAttribute('data-testid'))!;
        const consumerId = extractPluginIdFromTestId(testId, dependencyGraphTestIdPrefixes.contentConsumerBox);

        await clickSvg(firstConsumer);
        await page
          .getByRole('menuitem')
          .getByText(/Filter by/i)
          .click();

        // Navigate to the filtered view
        await depGraphPageWithMockApps.goto({
          path: `dependency-graph?view=addedcomponents&contentConsumers=${consumerId}`,
        });

        // Wait for the page to be ready
        await expect(page.getByTestId(dependencyGraphTestIds.visualizationModeSelector)).toBeVisible();
        await waitForUrlParam(page, 'contentConsumers', consumerId);

        // Verify filter is applied
        assertUrlParam(page, 'contentConsumers', consumerId);
        await expect(consumerBoxes).toHaveCount(1);
        await expect(consumerBoxes).toHaveAttribute('data-testid', testId);
      });

      test('removes consumer filter via context menu', async ({ depGraphPageWithMockApps }) => {
        const { page } = depGraphPageWithMockApps.ctx;
        const consumerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`));
        const firstConsumerTestId = (await consumerBoxes.first().getAttribute('data-testid'))!;
        const consumerId = extractPluginIdFromTestId(
          firstConsumerTestId,
          dependencyGraphTestIdPrefixes.contentConsumerBox
        );

        // Navigate to filtered view
        await depGraphPageWithMockApps.goto({
          path: `dependency-graph?view=addedcomponents&contentConsumers=${consumerId}`,
        });

        // Wait for the page to be ready
        await expect(page.getByTestId(dependencyGraphTestIds.visualizationModeSelector)).toBeVisible();
        await expect(page.getByTestId(dependencyGraphTestIds.contentConsumerBox(consumerId))).toBeVisible();

        // Remove filter
        await clickSvg(page.getByTestId(dependencyGraphTestIds.contentConsumerBox(consumerId)));
        await page.getByRole('menuitem').getByText('Remove filter').click();

        await waitForUrlParamRemoved(page, 'contentConsumers');

        // Re-navigate to ensure proper view state
        await depGraphPageWithMockApps.goto({ path: 'dependency-graph?view=addedcomponents' });
        await expect(consumerBoxes).toHaveCount(EXPECTED_COUNTS.addedComponents.consumers);
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
