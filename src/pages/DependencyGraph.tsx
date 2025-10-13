import React from 'react';
import { PluginPage } from '@grafana/runtime';

import { DependencyGraphPage } from '../dependency-graph/DependencyGraphPage';

function DependencyGraph() {
  return (
    <PluginPage>
      <DependencyGraphPage />
    </PluginPage>
  );
}

export default DependencyGraph;
