import { AppRootProps } from '@grafana/data';
import React from 'react';

const DependencyGraph = React.lazy(() => import('../pages/DependencyGraph'));

function App(props: AppRootProps) {
  return <DependencyGraph />;
}

export default App;
