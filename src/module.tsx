import React, { Suspense, lazy } from 'react';
import { AppPlugin, type AppRootProps } from '@grafana/data';
import { LoadingPlaceholder } from '@grafana/ui';

import { DependencyGraphPage } from './pages/DependencyGraphPage';

const LazyApp = lazy(() => import('./components/App'));

const App = (props: AppRootProps) => (
  <Suspense fallback={<LoadingPlaceholder text="Loading..." />}>
    <LazyApp {...props} />
  </Suspense>
);

export const plugin = new AppPlugin<{}>()
  .setRootPage(App)
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
