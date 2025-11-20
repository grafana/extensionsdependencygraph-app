import { DependencyGraphControlsComponent } from '../components/DependencyGraphControls';
import { DependencyGraphErrorBoundary } from '../components/DependencyGraphErrorBoundary';
import { DependencyGraphHeader } from '../components/DependencyGraphHeader';
import { DependencyGraphPanel } from '../components/DependencyGraphPanel';
import { LAYOUT_CONSTANTS } from '../dependency-graph-panel/constants';
import React from 'react';
import { css } from '@emotion/css';
import { useDependencyGraphControls } from '../hooks/useDependencyGraphControls';
import { useStyles2 } from '@grafana/ui';

/**
 * Main dependency graph page component
 * This component orchestrates all the dependency graph functionality
 */
export function DependencyGraphPage(): React.JSX.Element {
  const controls = useDependencyGraphControls();
  const styles = useStyles2(getStyles);

  return (
    <DependencyGraphErrorBoundary>
      <div className={styles.container}>
        <div className={styles.headerSection}>
          <DependencyGraphHeader controls={controls} />

          {/* Controls Section */}
          <DependencyGraphControlsComponent controls={controls} />
        </div>

        {/* Panel Section */}
        <DependencyGraphPanel controls={controls} />
      </div>
    </DependencyGraphErrorBoundary>
  );
}

const getStyles = () => {
  return {
    container: css({
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }),
    headerSection: css({
      marginTop: LAYOUT_CONSTANTS.TAB_PADDING,
      paddingLeft: LAYOUT_CONSTANTS.TAB_PADDING,
      paddingRight: LAYOUT_CONSTANTS.TAB_PADDING,
    }),
  };
};
