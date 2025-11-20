import { LAYOUT_CONSTANTS, getThemeColors } from '../dependency-graph-panel/constants';
import React, { useMemo } from 'react';
import { useStyles2, useTheme2 } from '@grafana/ui';

import AutoSizer from 'react-virtualized-auto-sizer';
import { DependencyGraph } from '../dependency-graph-panel/components/DependencyGraph';
import { DependencyGraphControls } from '../hooks/useDependencyGraphControls';
import { ExtensionTypeLegend } from './ExtensionTypeLegend';
import { calculateContentHeight } from '../dependency-graph-panel/components/GraphLayout';
import { css } from '@emotion/css';
import { getPluginData } from '../dependency-graph-panel/utils/helpers/dataAccess';
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

  // Calculate which badge types are present in added* views
  const badgeTypesPresent = useMemo(() => {
    const isAddedView =
      visualizationMode === 'addedlinks' ||
      visualizationMode === 'addedcomponents' ||
      visualizationMode === 'addedfunctions';

    if (!isAddedView || !graphData.extensionPoints) {
      return { link: false, component: false, function: false };
    }

    const types = { link: false, component: false, function: false };
    const pluginData = getPluginData();

    // Check each extension point to see what badge types it has
    graphData.extensionPoints.forEach((extensionPoint) => {
      Object.entries(pluginData).forEach(([pluginId, pluginInfo]: [string, any]) => {
        const extensions = pluginInfo?.extensions;
        if (!extensions) {
          return;
        }

        // Check addedLinks
        if (extensions.addedLinks && Array.isArray(extensions.addedLinks)) {
          extensions.addedLinks.forEach((link: any) => {
            const targets = Array.isArray(link.targets) ? link.targets : [link.targets];
            if (targets.includes(extensionPoint.id)) {
              types.link = true;
            }
          });
        }

        // Check addedComponents
        if (extensions.addedComponents && Array.isArray(extensions.addedComponents)) {
          extensions.addedComponents.forEach((component: any) => {
            const targets = Array.isArray(component.targets) ? component.targets : [component.targets];
            if (targets.includes(extensionPoint.id)) {
              types.component = true;
            }
          });
        }

        // Check addedFunctions
        if (extensions.addedFunctions && Array.isArray(extensions.addedFunctions)) {
          extensions.addedFunctions.forEach((func: any) => {
            const targets = Array.isArray(func.targets) ? func.targets : [func.targets];
            if (targets.includes(extensionPoint.id)) {
              types.function = true;
            }
          });
        }
      });
    });

    return types;
  }, [visualizationMode, graphData.extensionPoints]);

  return (
    <div className={styles.container}>
      <AutoSizer disableHeight>
        {({ width }: { width: number }) => {
          const effectiveWidth = width || LAYOUT_CONSTANTS.VISUALIZATION_FALLBACK_WIDTH;
          // Calculate required height based on actual content for all views
          const isExposeMode = visualizationMode === 'exposedComponents';
          const effectiveHeight = calculateContentHeight(
            graphData,
            {
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
            },
            effectiveWidth,
            LAYOUT_CONSTANTS.VISUALIZATION_MIN_HEIGHT,
            isExposeMode
          );
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
                badgeTypesPresent={badgeTypesPresent}
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
