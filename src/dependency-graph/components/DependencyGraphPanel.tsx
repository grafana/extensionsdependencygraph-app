import { LAYOUT_CONSTANTS, getThemeColors } from '../dependency-graph-panel/constants';
import { useStyles2, useTheme2 } from '@grafana/ui';

import AutoSizer from 'react-virtualized-auto-sizer';
import { DependencyGraph } from '../dependency-graph-panel/components/DependencyGraph';
import { DependencyGraphControls } from '../hooks/useDependencyGraphControls';
import { ExtensionTypeLegend } from './ExtensionTypeLegend';
import React from 'react';
import { css } from '@emotion/css';
import { logAutoSizer } from '../utils/logger';
import { useDependencyGraphData } from '../hooks/useDependencyGraphData';

interface DependencyGraphPanelProps {
  controls: DependencyGraphControls;
}

/**
 * Reusable component for rendering the dependency graph panel
 */
export function DependencyGraphPanel({ controls }: DependencyGraphPanelProps): React.JSX.Element {
  const {
    visualizationMode,
    selectedContentProviders,
    selectedContentConsumers,
    selectedContentConsumersForExtensionPoint,
    selectedExtensionPoints,
  } = controls;

  const { graphData } = useDependencyGraphData({
    visualizationMode,
    selectedContentProviders,
    selectedContentConsumers,
    selectedContentConsumersForExtensionPoint,
    selectedExtensionPoints,
  });

  const styles = useStyles2(getStyles);
  const theme = useTheme2();
  const themeColors = getThemeColors(theme);

  return (
    <div className={styles.container}>
      <AutoSizer>
        {({ width, height }: { width: number; height: number }) => {
          const effectiveWidth = width || LAYOUT_CONSTANTS.VISUALIZATION_FALLBACK_WIDTH;
          const effectiveHeight = height || LAYOUT_CONSTANTS.VISUALIZATION_MIN_HEIGHT;
          logAutoSizer(effectiveWidth, effectiveHeight);
          return (
            <div className={styles.graphContainer} style={{ width: effectiveWidth, height: effectiveHeight }}>
              <ExtensionTypeLegend
                linkColor={themeColors.LINK_EXTENSION}
                componentColor={themeColors.COMPONENT_EXTENSION}
                functionColor={themeColors.FUNCTION_EXTENSION}
                extensionPointColor={theme.colors.info.main}
                exposedComponentColor="#9933ff"
                extensions={graphData.extensions}
                exposedComponents={graphData.exposedComponents}
                visualizationMode={visualizationMode}
              />
              <DependencyGraph
                data={graphData}
                options={{
                  visualizationMode,
                  showDependencyTypes: true,
                  showDescriptions: false,
                  selectedContentProviders,
                  selectedContentConsumers,
                  selectedContentConsumersForExtensionPoint,
                  selectedExtensionPoints,
                  linkExtensionColor: themeColors.LINK_EXTENSION,
                  componentExtensionColor: themeColors.COMPONENT_EXTENSION,
                  functionExtensionColor: themeColors.FUNCTION_EXTENSION,
                  layoutType: 'hierarchical',
                }}
                width={effectiveWidth}
                height={effectiveHeight}
              />
            </div>
          );
        }}
      </AutoSizer>
    </div>
  );
}

const getStyles = () => {
  return {
    container: css({
      flex: 1,
      overflow: 'visible',
      minHeight: LAYOUT_CONSTANTS.VISUALIZATION_MIN_HEIGHT,
      width: '100%',
    }),
    graphContainer: css({
      position: 'relative',
    }),
  };
};
