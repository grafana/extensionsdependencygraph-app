import React from 'react';
import { EmptyState as GrafanaEmptyState } from '@grafana/ui';

import { GraphData } from '../types';

import { getGraphStyles } from './GraphStyles';

interface EmptyStateProps {
  data: GraphData;
  width: number;
  height: number;
  styles: ReturnType<typeof getGraphStyles>;
}

/**
 * Empty state component for when no dependency graph data is available
 */
export function EmptyState({ data, width, height, styles }: EmptyStateProps): React.JSX.Element {
  return (
    <div className={styles.emptyState.toString()}>
      <GrafanaEmptyState variant="not-found" message="No plugin dependency data available">
        <p>Configure your data source to provide plugin relationships</p>
        <details style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-color-secondary)' }}>
          <summary>Debug Information</summary>
          <p>
            Width: {width}, Height: {height}, Data keys: {Object.keys(data).join(', ')}
          </p>
        </details>
      </GrafanaEmptyState>
    </div>
  );
}
