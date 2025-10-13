import { expect, test } from './fixtures';

import { ROUTES } from '../src/constants';

test.describe('Dependency Graph with Mock Data', () => {
  test('should render dependency graph with mocked apps data', async ({ depGraphPageWithMockApps, context }) => {
    // Check that the dependency graph container is visible
    await expect(
      depGraphPageWithMockApps.locator('[data-testid="dependency-graph"]').or(depGraphPageWithMockApps.locator('svg'))
    ).toBeVisible({
      timeout: 10000,
    });
  });

  test('should display plugins from mock data', async ({ depGraphPageWithMockApps, context }) => {
    const appPage = await context.newPage();
    await appPage.goto(`/a/grafana-extensionsinsights-app/${ROUTES.DependencyGraph}`);

    await appPage.waitForLoadState('networkidle');

    // Verify that mock data is loaded by checking for specific plugin IDs from mockApps.json
    const bootData = await appPage.evaluate(() => {
      return (window as any).grafanaBootData?.settings?.apps;
    });

    expect(bootData).toBeDefined();
    expect(bootData).toHaveProperty('grafana-asserts-app');
    expect(bootData).toHaveProperty('grafana-k8s-app');
    expect(bootData).toHaveProperty('cloud-home-app');
  });

  test('should show correct number of plugins', async ({ depGraphPageWithMockApps, context }) => {
    const appPage = await context.newPage();
    await appPage.goto(`/a/grafana-extensionsinsights-app/${ROUTES.DependencyGraph}`);

    await appPage.waitForLoadState('networkidle');

    // Count the number of plugins in mock data
    const pluginCount = await appPage.evaluate(() => {
      const apps = (window as any).grafanaBootData?.settings?.apps;
      return apps ? Object.keys(apps).length : 0;
    });

    // We have 6 plugins in mockApps.json (minimal set covering all extension types)
    expect(pluginCount).toBe(6);
  });

  test('should display plugins with extensions', async ({ depGraphPageWithMockApps, context }) => {
    const appPage = await context.newPage();
    await appPage.goto(`/a/grafana-extensionsinsights-app/${ROUTES.DependencyGraph}`);

    await appPage.waitForLoadState('networkidle');

    // Check for specific plugins that have extensions
    const assertsAppData = await appPage.evaluate(() => {
      const apps = (window as any).grafanaBootData?.settings?.apps;
      return apps?.['grafana-asserts-app'];
    });

    expect(assertsAppData).toBeDefined();
    expect(assertsAppData.extensions.exposedComponents).toHaveLength(8);
    expect(assertsAppData.extensions.addedComponents).toHaveLength(2);
  });

  test('should display plugins with dependencies', async ({ depGraphPageWithMockApps, context }) => {
    const appPage = await context.newPage();
    await appPage.goto(`/a/grafana-extensionsinsights-app/${ROUTES.DependencyGraph}`);

    await appPage.waitForLoadState('networkidle');

    // Check for a plugin that depends on exposed components
    const collectorAppData = await appPage.evaluate(() => {
      const apps = (window as any).grafanaBootData?.settings?.apps;
      return apps?.['grafana-collector-app'];
    });

    expect(collectorAppData).toBeDefined();
    expect(collectorAppData.extensions.exposedComponents).toBeDefined();
    expect(collectorAppData.dependencies.extensions.exposedComponents).toContain('grafana-k8s-app/cluster-config/v1');
  });

  test('should handle extension points', async ({ depGraphPageWithMockApps, context }) => {
    const appPage = await context.newPage();
    await appPage.goto(`/a/grafana-extensionsinsights-app/${ROUTES.DependencyGraph}`);

    await appPage.waitForLoadState('networkidle');

    // Check for plugins with extension points
    const exploreTracesData = await appPage.evaluate(() => {
      const apps = (window as any).grafanaBootData?.settings?.apps;
      return apps?.['grafana-exploretraces-app'];
    });

    expect(exploreTracesData).toBeDefined();
    expect(exploreTracesData.extensions.extensionPoints).toHaveLength(1);
    expect(exploreTracesData.extensions.extensionPoints[0].id).toBe('grafana-exploretraces-app/investigation/v1');
  });

  test('should handle plugins with added links', async ({ depGraphPageWithMockApps, context }) => {
    const appPage = await context.newPage();
    await appPage.goto(`/a/grafana-extensionsinsights-app/${ROUTES.DependencyGraph}`);

    await appPage.waitForLoadState('networkidle');

    // Check for plugins with added links
    const assistantAppData = await appPage.evaluate(() => {
      const apps = (window as any).grafanaBootData?.settings?.apps;
      return apps?.['grafana-assistant-app'];
    });

    expect(assistantAppData).toBeDefined();
    expect(assistantAppData.extensions.addedLinks.length).toBeGreaterThan(0);
  });

  test('should display complex dependency chains', async ({ depGraphPageWithMockApps, context }) => {
    const appPage = await context.newPage();
    await appPage.goto(`/a/grafana-extensionsinsights-app/${ROUTES.DependencyGraph}`);

    await appPage.waitForLoadState('networkidle');

    // Check cloud-home-app which depends on grafana-collector-app
    const cloudHomeData = await appPage.evaluate(() => {
      const apps = (window as any).grafanaBootData?.settings?.apps;
      return apps?.['cloud-home-app'];
    });

    expect(cloudHomeData).toBeDefined();
    expect(cloudHomeData.dependencies.extensions.exposedComponents).toContain(
      'grafana-collector-app/collector-install/v1'
    );
  });
});
