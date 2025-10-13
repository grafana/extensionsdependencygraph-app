import { PluginPage } from '@grafana/runtime';
import React from 'react';

import { DependencyGraphTab } from '../dependency-graph/DependencyGraphTab';

function DependencyGraph() {
  return (
    <PluginPage>
      <DependencyGraphTab />
    </PluginPage>
  );
}

export default DependencyGraph;
