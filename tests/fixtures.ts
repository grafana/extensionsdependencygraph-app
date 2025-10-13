import { AppConfigPage, AppPage, test as base } from '@grafana/plugin-e2e';
import { overrideGrafanaBootData } from './scripts/overrideGrafanaBootData';

import { Page } from '@playwright/test';
import { join } from 'path';
import pluginJson from '../src/plugin.json';
import { readFileSync } from 'fs';

type AppTestFixture = {
  appConfigPage: AppConfigPage;
  depGraphPage: () => Promise<AppPage>;
  depGraphPageWithMockApps: Page;
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
  depGraphPageWithMockApps: async ({ page, selectors, grafanaVersion, request }, use, testInfo) => {
    const mockAppsData = readFileSync(join(__dirname, 'mockApps.json'), 'utf-8');
    await page.addInitScript(overrideGrafanaBootData, { apps: JSON.parse(mockAppsData) });
    const appPage = new AppPage({ page, selectors, grafanaVersion, request, testInfo }, { pluginId: pluginJson.id });
    await appPage.goto({ path: '/dependency-graph' });
    await use(page);
  },
});

export { expect } from '@grafana/plugin-e2e';
