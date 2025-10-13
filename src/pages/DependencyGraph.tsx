import { DependencyGraphTab } from '../dependency-graph/DependencyGraphTab';
import { PluginPage } from '@grafana/runtime';
import React from 'react';

function DependencyGraph() {
  return (
    <PluginPage>
      <DependencyGraphTab />
    </PluginPage>
  );
}

export default DependencyGraph;
