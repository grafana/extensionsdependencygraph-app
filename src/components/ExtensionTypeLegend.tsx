import { ExposedComponent, Extension } from '../dependency-graph-panel/types';
import React, { useMemo } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';

interface ExtensionTypeLegendProps {
  linkColor: string;
  componentColor: string;
  functionColor: string;
  extensionPointColor: string;
  exposedComponentColor: string;
  extensions?: Extension[];
  exposedComponents?: ExposedComponent[];
  visualizationMode: 'exposedComponents' | 'extensionpoint' | 'addedlinks' | 'addedcomponents' | 'addedfunctions';
  badgeTypesPresent?: { link: boolean; component: boolean; function: boolean };
}

export function ExtensionTypeLegend({
  linkColor,
  componentColor,
  functionColor,
  extensionPointColor,
  exposedComponentColor,
  extensions = [],
  exposedComponents = [],
  visualizationMode,
  badgeTypesPresent = { link: false, component: false, function: false },
}: ExtensionTypeLegendProps): React.JSX.Element {
  const styles = useStyles2(getStyles);

  // Determine which extension types are present based on visualization mode
  const showItems = useMemo(() => {
    const items = {
      link: false,
      component: false,
      function: false,
      extensionPoint: false,
      exposedComponent: false,
    };

    switch (visualizationMode) {
      case 'addedlinks':
      case 'addedcomponents':
      case 'addedfunctions':
        // In added* views, show badge types that are actually present in the view
        items.link = badgeTypesPresent.link;
        items.component = badgeTypesPresent.component;
        items.function = badgeTypesPresent.function;
        items.extensionPoint = true;
        break;
      case 'extensionpoint':
        // Check which extension types are actually present in the data
        extensions.forEach((ext) => {
          if (ext.type === 'link') {
            items.link = true;
          }
          if (ext.type === 'component') {
            items.component = true;
          }
          if (ext.type === 'function') {
            items.function = true;
          }
        });
        items.extensionPoint = true;
        break;
      case 'exposedComponents':
        items.exposedComponent = exposedComponents.length > 0;
        break;
    }

    return items;
  }, [visualizationMode, extensions, exposedComponents, badgeTypesPresent]);

  // Don't render if nothing to show
  if (
    !showItems.link &&
    !showItems.component &&
    !showItems.function &&
    !showItems.extensionPoint &&
    !showItems.exposedComponent
  ) {
    return <></>;
  }

  return (
    <div className={styles.container}>
      {showItems.link && (
        <div className={styles.legendItem}>
          <div className={styles.colorBox} style={{ backgroundColor: linkColor }} />
          <span className={styles.label}>Link extension</span>
        </div>
      )}
      {showItems.component && (
        <div className={styles.legendItem}>
          <div className={styles.colorBox} style={{ backgroundColor: componentColor }} />
          <span className={styles.label}>Component extension</span>
        </div>
      )}
      {showItems.function && (
        <div className={styles.legendItem}>
          <div className={styles.colorBox} style={{ backgroundColor: functionColor }} />
          <span className={styles.label}>Function extension</span>
        </div>
      )}
      {showItems.extensionPoint && (
        <div className={styles.legendItem}>
          <div className={styles.colorBox} style={{ backgroundColor: extensionPointColor }} />
          <span className={styles.label}>Extension point</span>
        </div>
      )}
      {showItems.exposedComponent && (
        <div className={styles.legendItem}>
          <div className={styles.colorBox} style={{ backgroundColor: exposedComponentColor }} />
          <span className={styles.label}>Exposed component</span>
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
