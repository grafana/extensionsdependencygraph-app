import React, { useMemo } from 'react';

import { Extension } from '../dependency-graph-panel/types';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';

interface ExtensionTypeLegendProps {
  linkColor: string;
  componentColor: string;
  functionColor: string;
  extensions?: Extension[];
}

export function ExtensionTypeLegend({
  linkColor,
  componentColor,
  functionColor,
  extensions = [],
}: ExtensionTypeLegendProps): React.JSX.Element {
  const styles = useStyles2(getStyles);

  // Determine which extension types are present in the data
  const presentTypes = useMemo(() => {
    const types = new Set<'link' | 'component' | 'function'>();
    extensions.forEach((ext) => {
      types.add(ext.type);
    });
    return types;
  }, [extensions]);

  // Don't render if no extensions present
  if (presentTypes.size === 0) {
    return <></>;
  }

  return (
    <div className={styles.container}>
      {presentTypes.has('link') && (
        <div className={styles.legendItem}>
          <div className={styles.colorBox} style={{ backgroundColor: linkColor }} />
          <span className={styles.label}>Link extension</span>
        </div>
      )}
      {presentTypes.has('component') && (
        <div className={styles.legendItem}>
          <div className={styles.colorBox} style={{ backgroundColor: componentColor }} />
          <span className={styles.label}>Component extension</span>
        </div>
      )}
      {presentTypes.has('function') && (
        <div className={styles.legendItem}>
          <div className={styles.colorBox} style={{ backgroundColor: functionColor }} />
          <span className={styles.label}>Function extension</span>
        </div>
      )}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css({
      position: 'absolute',
      top: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '10px',
      padding: '4px 8px',
      backgroundColor: theme.colors.background.primary,
      borderRadius: '3px',
      fontSize: '10px',
      zIndex: 10,
    }),
    legendItem: css({
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    }),
    colorBox: css({
      width: '8px',
      height: '8px',
      borderRadius: '2px',
      flexShrink: 0,
    }),
    label: css({
      color: theme.colors.text.primary,
      whiteSpace: 'nowrap',
    }),
  };
};
