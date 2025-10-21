import React, { Suspense, lazy } from 'react';
import semver from 'semver';
import { initPluginTranslations } from '@grafana/i18n';
import { AppPlugin, type AppRootProps } from '@grafana/data';
import { config } from '@grafana/runtime';
import { LoadingPlaceholder } from '@grafana/ui';
import type { AppConfigProps } from './components/AppConfig/AppConfig';
import { loadResources } from './loadResources';
import pluginJson from './plugin.json';

// Import runtime panel plugin to register it
import './dependency-graph/dependency-graph-panel/module';
import { DependencyGraphPage } from 'dependency-graph/DependencyGraphPage';

// Before Grafana version 12.1.0 the plugin is responsible for loading translation resources
// In Grafana version 12.1.0 and later Grafana is responsible for loading translation resources
const loaders = semver.lt(config?.buildInfo?.version || '0.0.0', '12.1.0') ? [loadResources] : [];
await initPluginTranslations(pluginJson.id, loaders);

const LazyApp = lazy(() => import('./components/App/App'));
const LazyAppConfig = lazy(() => import('./components/AppConfig/AppConfig'));

const App = (props: AppRootProps) => (
  <Suspense fallback={<LoadingPlaceholder text="Loading..." />}>
    <LazyApp {...props} />
  </Suspense>
);

const AppConfig = (props: AppConfigProps) => (
  <Suspense fallback={<LoadingPlaceholder text="Loading..." />}>
    <LazyAppConfig {...props} />
  </Suspense>
);

export const plugin = new AppPlugin<{}>()
  .setRootPage(App)
  .addConfigPage({
    title: 'Configuration',
    icon: 'cog',
    body: AppConfig,
    id: 'configuration',
  })
  .addLink({
    targets: 'grafana/extension-sidebar/v0-alpha',
    title: 'Plugin Extensions DevTools',
    description: 'Opens Plugin Extensions DevTools',
    configure: () => {
      return {
        description: 'Opens Plugin Extensions DevTools',
        title: 'Plugin Extensions DevTools',
      };
    },
    onClick: () => {
      // do nothing
      void 0;
    },
  })
  .addComponent({
    targets: 'grafana/extension-sidebar/v0-alpha',
    title: 'Plugin Extensions DevTools',
    description: 'Opens Plugin Extensions DevTools',
    component: () => {
      return <DependencyGraphPage />;
    },
  });
