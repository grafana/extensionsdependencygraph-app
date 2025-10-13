import { expect, test } from '../fixtures';

import { ROUTES } from '../../src/constants';

test.describe('Added Links View', () => {
  test('shows only view, content provider and content consumer selectors', async ({ depGraphPageWithMockApps }) => {
    const vizSelector = depGraphPageWithMockApps.locator('[data-testid="visualization-mode-selector"]');
    const providerSelector = depGraphPageWithMockApps.locator('[data-testid="content-provider-selector"]');
    const consumerSelector = depGraphPageWithMockApps.locator('[data-testid="content-consumer-selector"]');
    const extensionPointSelector = depGraphPageWithMockApps.locator('[data-testid="extension-point-selector"]');

    // The visualization mode, provider and consumer selectors should be visible
    await expect(vizSelector).toBeVisible();
    await expect(providerSelector).toBeVisible();
    await expect(consumerSelector).toBeVisible();

    // Extension point selector should not be visible in addedlinks view
    await expect(extensionPointSelector).toHaveCount(0);
  });
});
