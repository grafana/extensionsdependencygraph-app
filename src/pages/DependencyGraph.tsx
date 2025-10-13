import { DependencyGraphPage } from '../dependency-graph/DependencyGraphPage';
import { PluginPage } from '@grafana/runtime';
import React from 'react';

function DependencyGraph() {
  return (
    <PluginPage>
      <DependencyGraphPage />
    </PluginPage>
  );
}

export default DependencyGraph;
