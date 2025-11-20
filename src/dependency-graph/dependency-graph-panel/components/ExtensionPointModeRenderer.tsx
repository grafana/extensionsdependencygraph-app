import { GraphData, PanelOptions } from '../types';
import {
  LAYOUT_CONSTANTS,
  TYPOGRAPHY_CONSTANTS,
  VISUAL_CONSTANTS,
  getResponsiveGroupSpacing,
  getRightMargin,
} from '../constants';

import { GrafanaTheme2 } from '@grafana/data';
import { PositionInfo } from './GraphLayout';
import React from 'react';
import { dependencyGraphTestIds } from '../../testIds';
import { getDisplayName } from '../utils/helpers/extensionUtils';

interface ExtensionPointModeRendererProps {
  theme: GrafanaTheme2;
  data: GraphData;
  options: PanelOptions;
  width: number;
  height: number;
  extensionPointModePositions: Map<string, PositionInfo>;
  selectedContentConsumer: string | null;
  highlightedExtensionPointId: string | null;
  onContentConsumerClick: (id: string | null) => void;
  onHighlightedExtensionPointChange: (id: string | null) => void;
  onContextMenu: (event: React.MouseEvent, extensionPointId: string) => void;
  styles: {
    extensionPointBox: { toString(): string };
    extensionPointLabel: { toString(): string };
    extensionPointDescription: { toString(): string };
    extensionPointVersion: { toString(): string };
    extensionPointProvider: { toString(): string };
    contentConsumerBox: { toString(): string };
    contentConsumerLabel: { toString(): string };
  };
}

/**
 * Component for rendering extension point mode
 */
export function ExtensionPointModeRenderer({
  theme,
  data,
  options,
  width,
  height,
  extensionPointModePositions,
  selectedContentConsumer,
  highlightedExtensionPointId,
  onContentConsumerClick,
  onHighlightedExtensionPointChange,
  onContextMenu,
  styles,
}: ExtensionPointModeRendererProps): React.JSX.Element {
  const rightMargin = getRightMargin(width);
  const groupSpacing = getResponsiveGroupSpacing(height);

  return (
    <>
      {/* Render Extension Points */}
      {Array.from(extensionPointModePositions.entries()).map(([extensionPointId, position]) => {
        const extensionPoint = data.extensionPoints?.find((ep) => ep.id === extensionPointId);
        if (!extensionPoint) {
          return null;
        }

        const isHighlighted = highlightedExtensionPointId === extensionPointId;
        const strokeColor = isHighlighted ? theme.colors.primary.border : theme.colors.border.medium;
        const strokeWidth = isHighlighted
          ? VISUAL_CONSTANTS.SELECTED_STROKE_WIDTH
          : VISUAL_CONSTANTS.DEFAULT_STROKE_WIDTH;

        return (
          <g key={extensionPointId}>
            {/* Extension Point Box - always blue */}
            <rect
              x={position.x}
              y={position.y}
              width={LAYOUT_CONSTANTS.EXTENSION_BOX_WIDTH}
              height={LAYOUT_CONSTANTS.EXTENSION_BOX_HEIGHT}
              rx={VISUAL_CONSTANTS.EXTENSION_BORDER_RADIUS}
              fill={theme.colors.info.main}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className={styles.extensionPointBox.toString()}
              onClick={(e) => onContextMenu(e, extensionPointId)}
              onContextMenu={(e) => onContextMenu(e, extensionPointId)}
              style={{ cursor: 'pointer' }}
            />

            {/* Extension Point Label */}
            <text
              x={position.x + 10}
              y={position.y + 20}
              fontSize={TYPOGRAPHY_CONSTANTS.EXTENSION_LABEL_SIZE}
              fill="#ffffff"
              className={styles.extensionPointLabel.toString()}
            >
              {extensionPoint.title || extensionPoint.id}
            </text>

            {/* Extension Point Description */}
            {extensionPoint.description && (
              <text
                x={position.x + 10}
                y={position.y + 35}
                fontSize={TYPOGRAPHY_CONSTANTS.DESCRIPTION_SIZE}
                fill="#ffffff"
                className={styles.extensionPointDescription.toString()}
              >
                {extensionPoint.description}
              </text>
            )}

            {/* Extension Point Provider */}
            <text
              x={position.x + 10}
              y={position.y + LAYOUT_CONSTANTS.EXTENSION_BOX_HEIGHT - 5}
              fontSize={TYPOGRAPHY_CONSTANTS.TYPE_BADGE_SIZE}
              fill="#ffffff"
              className={styles.extensionPointProvider.toString()}
            >
              {`Provided by ${getDisplayName(extensionPoint.definingPlugin)}`}
            </text>
          </g>
        );
      })}

      {/* Render Content Providers */}
      {(() => {
        // Get all unique providers from extension points
        const allProvidersSet = new Set<string>();
        data.extensionPoints?.forEach((ep) => {
          ep.providers.forEach((providerId) => {
            allProvidersSet.add(providerId);
          });
        });

        return Array.from(allProvidersSet).map((providerId, index) => {
          const x = 20; // Left margin
          const y = LAYOUT_CONSTANTS.HEADER_Y_OFFSET + groupSpacing + index * (LAYOUT_CONSTANTS.MIN_NODE_HEIGHT + 10);

          const strokeColor = theme.colors.border.medium;
          const strokeWidth = VISUAL_CONSTANTS.DEFAULT_STROKE_WIDTH;

          return (
            <g key={providerId}>
              {/* Content Provider Box */}
              <rect
                data-testid={dependencyGraphTestIds.contentProviderBox(providerId)}
                x={x}
                y={y}
                width={LAYOUT_CONSTANTS.MIN_NODE_WIDTH}
                height={LAYOUT_CONSTANTS.MIN_NODE_HEIGHT}
                rx={VISUAL_CONSTANTS.NODE_BORDER_RADIUS}
                fill={theme.colors.background.secondary}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                className={styles.contentConsumerBox.toString()}
                style={{ cursor: 'pointer' }}
              />

              {/* Content Provider Label */}
              <text
                x={x + 10}
                y={y + 20}
                fontSize={TYPOGRAPHY_CONSTANTS.PLUGIN_LABEL_SIZE}
                fill={theme.colors.text.primary}
                className={styles.contentConsumerLabel.toString()}
              >
                {getDisplayName(providerId)}
              </text>
            </g>
          );
        });
      })()}

      {/* Render Content Consumers */}
      {(() => {
        // Get all unique consumers from exposed components
        const allConsumersSet = new Set<string>();
        data.exposedComponents?.forEach((comp) => {
          comp.consumers.forEach((consumerId) => {
            allConsumersSet.add(consumerId);
          });
        });

        return Array.from(allConsumersSet).map((consumerId, index) => {
          const x = width - rightMargin - LAYOUT_CONSTANTS.MIN_NODE_WIDTH;
          const y = LAYOUT_CONSTANTS.HEADER_Y_OFFSET + groupSpacing + index * (LAYOUT_CONSTANTS.MIN_NODE_HEIGHT + 10);

          const isSelected = selectedContentConsumer === consumerId;
          const strokeColor = isSelected ? theme.colors.primary.border : theme.colors.border.medium;
          const strokeWidth = isSelected
            ? VISUAL_CONSTANTS.SELECTED_STROKE_WIDTH
            : VISUAL_CONSTANTS.DEFAULT_STROKE_WIDTH;

          return (
            <g key={consumerId}>
              {/* Content Consumer Box */}
              <rect
                data-testid={dependencyGraphTestIds.contentConsumerBox(consumerId)}
                x={x}
                y={y}
                width={LAYOUT_CONSTANTS.MIN_NODE_WIDTH}
                height={LAYOUT_CONSTANTS.MIN_NODE_HEIGHT}
                rx={VISUAL_CONSTANTS.NODE_BORDER_RADIUS}
                fill={theme.colors.background.secondary}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                className={styles.contentConsumerBox.toString()}
                onClick={() => onContentConsumerClick(consumerId)}
                style={{ cursor: 'pointer' }}
              />

              {/* Content Consumer Label */}
              <text
                x={x + 10}
                y={y + 20}
                fontSize={TYPOGRAPHY_CONSTANTS.PLUGIN_LABEL_SIZE}
                fill={theme.colors.text.primary}
                className={styles.contentConsumerLabel.toString()}
              >
                {getDisplayName(consumerId)}
              </text>
            </g>
          );
        });
      })()}
    </>
  );
}
