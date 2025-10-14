

import { dependencyGraphTestIdPrefixes, dependencyGraphTestIds } from '../../src/dependency-graph/testIds';
import { expect, test, clickSvg } from '../fixtures';
import { Page } from '@playwright/test';
import { ROUTES } from '../../src/constants';

const navigateToView = async (page: Page) => {
  const url = new URL(page.url());
  url.searchParams.set('view', 'addedfunctions');
  await page.goto(url.toString());
};

test.describe('Added Functions View', () => {
  test.beforeEach(async ({ depGraphPageWithMockApps }) => {
    await navigateToView(depGraphPageWithMockApps.ctx.page);
  });

  test('shows only view, content provider and content consumer selectors', async ({ depGraphPageWithMockApps }) => {
    const page = depGraphPageWithMockApps.ctx.page;
    const vizSelector = page.getByTestId(dependencyGraphTestIds.visualizationModeSelector);
    const providerSelector = page.getByTestId(dependencyGraphTestIds.contentProviderSelector);
    const consumerSelector = page.getByTestId(dependencyGraphTestIds.contentConsumerSelector);
    const extensionPointSelector = page.getByTestId(dependencyGraphTestIds.extensionPointSelector);

    await expect(vizSelector).toBeVisible();
    await expect(providerSelector).toBeVisible();
    await expect(consumerSelector).toBeVisible();
    await expect(extensionPointSelector).toHaveCount(0);
  });

  test('displays 1 content provider box and 1 content consumer box', async ({ depGraphPageWithMockApps }) => {
    const page = depGraphPageWithMockApps.ctx.page;
    const providerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`));
    const consumerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`));
    await expect(providerBoxes).toHaveCount(1);
    await expect(consumerBoxes).toHaveCount(1);
  });

  test.describe('filtering', () => {
    test.describe('providers', () => {
      let page: Page;
      let clickedTestId: string | null;
      let clickedProviderId: string | null;

      test.beforeEach(async ({ depGraphPageWithMockApps }) => {
        page = depGraphPageWithMockApps.ctx.page;
        await navigateToView(page);

        const providerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`));
        await expect(providerBoxes).toHaveCount(1);

        const firstProvider = providerBoxes.first();
        clickedTestId = await firstProvider.getAttribute('data-testid');
        await firstProvider.click();

        const filterMenuItem = page.getByRole('menuitem').getByText(/Filter by/i);
        await expect(filterMenuItem).toBeVisible();
        await filterMenuItem.click();

        clickedProviderId = clickedTestId!.replace(dependencyGraphTestIdPrefixes.contentProviderBox, '');
        await page.waitForFunction(
          (id) => new URL(window.location.href).searchParams.get('contentProviders') === id,
          clickedProviderId
        );
      });

      test('url params are updated', async () => {
        const urlProviderParam = new URL(page.url()).searchParams.get('contentProviders');
        expect(urlProviderParam).toBe(clickedProviderId);
      });

      test('remaining box is the clicked one', async () => {
        const providerBoxesAfterFilter = page.getByTestId(
          new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`)
        );
        await expect(providerBoxesAfterFilter).toHaveCount(1);

        const remainingTestId = await providerBoxesAfterFilter.first().getAttribute('data-testid');
        expect(remainingTestId).toBe(clickedTestId);
      });
    });

    test.describe('consumers', () => {
      let page: Page;
      let clickedConsumerTestId: string | null;
      let clickedConsumerId: string | null;

      test.beforeEach(async ({ depGraphPageWithMockApps }) => {
        page = depGraphPageWithMockApps.ctx.page;
        await navigateToView(page);

        const consumerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`));
        await expect(consumerBoxes).toHaveCount(1);

        const firstConsumer = consumerBoxes.first();
        clickedConsumerTestId = await firstConsumer.getAttribute('data-testid');
        await clickSvg(firstConsumer);

        const filterMenuItem = page.getByRole('menuitem').getByText(/Filter by/i);
        await expect(filterMenuItem).toBeVisible();
        await filterMenuItem.click();

        clickedConsumerId = clickedConsumerTestId!.replace(dependencyGraphTestIdPrefixes.contentConsumerBox, '');
        // Start the test on a pre-filtered view for the only consumer
        const url2 = new URL(page.url());
        url2.searchParams.set('contentConsumers', clickedConsumerId);
        await page.goto(url2.toString());

        await page.waitForFunction(
          (id) => new URL(window.location.href).searchParams.get('contentConsumers') === id,
          clickedConsumerId
        );
      });

      test('url params are updated', async () => {
        const urlConsumerParam = new URL(page.url()).searchParams.get('contentConsumers');
        expect(urlConsumerParam).toBe(clickedConsumerId);
      });

      test('remaining box is the clicked one', async () => {
        const consumerBoxesAfterFilter = page.getByTestId(
          new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`)
        );
        await expect(consumerBoxesAfterFilter).toHaveCount(1);

        const remainingConsumerTestId = await consumerBoxesAfterFilter.first().getAttribute('data-testid');
        expect(remainingConsumerTestId).toBe(clickedConsumerTestId);
      });
    });

    test.describe('remove filter', () => {
      test('can remove provider filter and restore providers', async ({ depGraphPageWithMockApps }) => {
        const page = depGraphPageWithMockApps.ctx.page;
        await navigateToView(page);

        // Start the test on a pre-filtered view for the first provider
        const providerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`));
        const firstProviderTestId = await providerBoxes.first().getAttribute('data-testid');
        const firstProviderId = firstProviderTestId!.replace(dependencyGraphTestIdPrefixes.contentProviderBox, '');
        const url = new URL(page.url());
        url.searchParams.set('view', 'addedfunctions');
        url.searchParams.set('contentProviders', firstProviderId);
        await page.goto(url.toString());

        await page.getByTestId(dependencyGraphTestIds.contentProviderBox(firstProviderId)).click();
        await page.getByRole('menuitem').getByText('Remove filter').click();

        // Wait for the URL param to be removed
        await page.waitForFunction(() => !new URL(window.location.href).searchParams.get('contentProviders'));

        await navigateToView(page);
        const providerBoxesAfterRemove = page.getByTestId(
          new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`)
        );
        await expect(providerBoxesAfterRemove).toHaveCount(1);
      });

      test('can remove consumer filter and restore consumers', async ({ depGraphPageWithMockApps }) => {
        const page = depGraphPageWithMockApps.ctx.page;
        await navigateToView(page);

        const consumerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`));
        await expect(consumerBoxes).toHaveCount(1);

        const firstConsumerTestId = await consumerBoxes.first().getAttribute('data-testid');
        const firstConsumerId = firstConsumerTestId!.replace(dependencyGraphTestIdPrefixes.contentConsumerBox, '');

        // Navigate directly to a URL filtered by the consumer id
        const url = new URL(page.url());
        url.searchParams.set('view', 'addedfunctions');
        url.searchParams.set('contentConsumers', firstConsumerId);
        await page.goto(url.toString());

        // Remove the consumer filter via context menu (click the SVG consumer box then select 'Remove filter')
        await clickSvg(page.getByTestId(dependencyGraphTestIds.contentConsumerBox(firstConsumerId)));
        await page.getByRole('menuitem').getByText('Remove filter').click();

        await page.waitForFunction(() => !new URL(window.location.href).searchParams.get('contentConsumers'));

        await navigateToView(page);
        const consumerBoxesAfterRemove = page.getByTestId(
          new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`)
        );
        await expect(consumerBoxesAfterRemove).toHaveCount(1);
      });

      test('changing view clears provider and consumer filters', async ({ depGraphPageWithMockApps }) => {
        const page = depGraphPageWithMockApps.ctx.page;
        await navigateToView(page);

        // Start with both provider and consumer filters present
        const url = new URL(page.url());
        url.searchParams.set('view', 'addedfunctions');
        url.searchParams.set('contentConsumers', 'grafana-metricsdrilldown-app');
        url.searchParams.set('contentProviders', 'grafana-lokiexplore-app');
        await page.goto(url.toString());

        // Ensure both params are present
        await page.waitForFunction(
          () =>
            Boolean(new URL(window.location.href).searchParams.get('contentConsumers')) &&
            Boolean(new URL(window.location.href).searchParams.get('contentProviders'))
        );

        // Open the visualization mode selector and choose Exposed components
        const vizSelector = page.getByTestId(dependencyGraphTestIds.visualizationModeSelector);
        await vizSelector.click();

        // The visible option label is localized to 'Exposed components' — choose by that label
        const exposedOption = page.getByRole('option').getByText(/Exposed components/i);
        await exposedOption.click();

        // Wait for the view param to change, then assert filter params are gone
        await page.waitForFunction(() => new URL(window.location.href).searchParams.get('view') === 'exposedComponents');
        const urlObj = new URL(page.url());
        expect(urlObj.searchParams.get('contentConsumers')).toBeNull();
        expect(urlObj.searchParams.get('contentProviders')).toBeNull();
      });
    });
  });
});
