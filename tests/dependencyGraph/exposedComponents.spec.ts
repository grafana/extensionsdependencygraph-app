import { dependencyGraphTestIdPrefixes, dependencyGraphTestIds } from '../../src/dependency-graph/testIds';
import { expect, test, clickSvg } from '../fixtures';
import { Page } from '@playwright/test';
import { ROUTES } from '../../src/constants';

const navigateToView = async (page: Page) => {
  const url = new URL(page.url());
  url.searchParams.set('view', 'exposedComponents');
  await page.goto(url.toString());
};

test.describe('Exposed Components View', () => {
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

  test('displays 3 content provider boxes and 1 content consumer box', async ({ depGraphPageWithMockApps }) => {
    const page = depGraphPageWithMockApps.ctx.page;
    const providerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`));
    const consumerBoxes = page.getByTestId(new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`));
    await expect(providerBoxes).toHaveCount(3);
    await expect(consumerBoxes).toHaveCount(1);
  });

  test.describe('filtering', () => {
    test.describe('providers', () => {
      let page: Page;
      let clickedProviderId: string | null;

      test.beforeEach(async ({ depGraphPageWithMockApps }) => {
        await depGraphPageWithMockApps.goto({
          path: 'dependency-graph?view=exposedComponents&contentProviders=grafana-lokiexplore-app',
        });
        page = depGraphPageWithMockApps.ctx.page;
        clickedProviderId = 'grafana-lokiexplore-app';
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
        expect(remainingTestId).toBe(dependencyGraphTestIds.contentProviderBox('grafana-lokiexplore-app'));
      });
    });

    test.describe('consumers', () => {
      let page: Page;
      let clickedConsumerId: string | null;

      test.beforeEach(async ({ depGraphPageWithMockApps }) => {
        page = depGraphPageWithMockApps.ctx.page;
        // Navigate directly to filtered view
        await depGraphPageWithMockApps.goto({
          path: 'dependency-graph?view=exposedComponents&contentConsumers=grafana-lokiexplore-app',
        });
        clickedConsumerId = 'grafana-lokiexplore-app';
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
        expect(remainingConsumerTestId).toBe(dependencyGraphTestIds.contentConsumerBox('grafana-lokiexplore-app'));
      });
    });

    test.describe('remove filter', () => {
      test('can remove provider filter and restore providers', async ({ depGraphPageWithMockApps }) => {
        await depGraphPageWithMockApps.goto({
          path: '/dependency-graph?view=exposedComponents&contentProviders=grafana-lokiexplore-app',
        });
        const page = depGraphPageWithMockApps.ctx.page;
        await clickSvg(page.getByTestId(dependencyGraphTestIds.contentProviderBox('grafana-lokiexplore-app')));
        await page.getByRole('menuitem').getByText('Remove filter').click();

        // Wait for the URL param to be removed
        await page.waitForFunction(() => !new URL(window.location.href).searchParams.get('contentProviders'));

        // await navigateToView(page);
        const providerBoxesAfterRemove = page.getByTestId(
          new RegExp(`^${dependencyGraphTestIdPrefixes.contentProviderBox}`)
        );
        await expect(providerBoxesAfterRemove).toHaveCount(3);
      });

      test('can remove consumer filter and restore consumers', async ({ depGraphPageWithMockApps }) => {
        await depGraphPageWithMockApps.goto({
          path: 'dependency-graph?view=exposedComponents&contentConsumers=grafana-lokiexplore-app',
        });
        const page = depGraphPageWithMockApps.ctx.page;
        await clickSvg(page.getByTestId(dependencyGraphTestIds.contentConsumerBox('grafana-lokiexplore-app')));
        await page.getByRole('menuitem').getByText('Remove filter').click();

        // Wait for the URL param to be removed
        await page.waitForFunction(() => !new URL(window.location.href).searchParams.get('contentConsumers'));

        const consumerBoxesAfterRemove = page.getByTestId(
          new RegExp(`^${dependencyGraphTestIdPrefixes.contentConsumerBox}`)
        );
        await expect(consumerBoxesAfterRemove).toHaveCount(1);
      });

      test('changing view clears provider and consumer filters', async ({ depGraphPageWithMockApps }) => {
        await depGraphPageWithMockApps.goto({
          path: 'dependency-graph?view=exposedComponents&contentProviders=grafana-lokiexplore-app',
        });
        const page = depGraphPageWithMockApps.ctx.page;
        // Open the visualization mode selector and choose Added links
        const vizSelector = page.getByTestId(dependencyGraphTestIds.visualizationModeSelector);
        await vizSelector.click();

        // The visible option label is localized to 'Added links' — choose by that label
        const addedLinksOption = page.getByRole('option').getByText(/Added links/i);
        await addedLinksOption.click();

        // Wait for the view param to change, then assert filter params are gone
        await expect(page).toHaveURL(/view=addedlinks/);
        const urlObj = new URL(page.url());
        expect(urlObj.searchParams.get('contentConsumers')).toBeNull();
        expect(urlObj.searchParams.get('contentProviders')).toBeNull();
      });
    });
  });
});
