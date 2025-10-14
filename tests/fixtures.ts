import { AppConfigPage, AppPage, test as base } from '@grafana/plugin-e2e';

import { Page } from '@playwright/test';
import { join } from 'path';
import { overrideGrafanaBootData } from './scripts/overrideGrafanaBootData';
import pluginJson from '../src/plugin.json';
import { readFileSync } from 'fs';

type AppTestFixture = {
  appConfigPage: AppConfigPage;
  depGraphPage: () => Promise<AppPage>;
  depGraphPageWithMockApps: AppPage;
};

export const test = base.extend<AppTestFixture>({
  appConfigPage: async ({ gotoAppConfigPage }, use) => {
    const configPage = await gotoAppConfigPage({
      pluginId: pluginJson.id,
    });
    await use(configPage);
  },
  depGraphPage: async ({ gotoAppPage }, use) => {
    await use(() =>
      gotoAppPage({
        path: '/dependency-graph',
        pluginId: pluginJson.id,
      })
    );
  },
  depGraphPageWithMockApps: async ({ page, selectors, grafanaVersion, request, gotoAppPage }, use, testInfo) => {
    const mockAppsData = readFileSync(join(__dirname, 'mockApps.json'), 'utf-8');
    await page.addInitScript(overrideGrafanaBootData, { apps: JSON.parse(mockAppsData) });
    const appPage = await gotoAppPage({
      path: '/dependency-graph',
      pluginId: pluginJson.id,
    });
    await use(appPage);
  },
});

export { expect } from '@grafana/plugin-e2e';

/**
 * Helper to reliably click SVG or other elements that may not expose `click()`
 * Use: await clickSvg(locator);
 */
export async function clickSvg(locator: import('@playwright/test').Locator): Promise<void> {
  await locator.evaluate((el) =>
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
  );
}
