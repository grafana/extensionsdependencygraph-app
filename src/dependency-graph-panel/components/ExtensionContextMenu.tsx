import React from 'react';
import { ContextMenu, Menu } from '@grafana/ui';
import { reportInteraction } from '@grafana/runtime';

import { GraphData } from '../types';
import { PLUGIN_ID } from '../../constants';

interface ExtensionContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedExtensionPointId: string | null;
  data: GraphData;
  onClose: () => void;
  onHighlightArrows: () => void;
  onNavigateToExtensionPoint: () => void;
  onFilterExtensionPoint: () => void;
  onUnfilterExtensionPoint: () => void;
}

/**
 * Context menu component for extension points
 */
export function ExtensionContextMenu({
  isOpen,
  position,
  selectedExtensionPointId,
  data,
  onClose,
  onHighlightArrows,
  onNavigateToExtensionPoint,
  onFilterExtensionPoint,
  onUnfilterExtensionPoint,
}: ExtensionContextMenuProps): React.JSX.Element | null {
  if (!isOpen || !selectedExtensionPointId) {
    return null;
  }

  const extensionPoint = data.extensionPoints?.find((ep) => ep.id === selectedExtensionPointId);
  if (!extensionPoint) {
    return null;
  }

  // Check if extension point is currently filtered
  const currentUrl = new URL(window.location.href);
  const currentExtensionPoints = currentUrl.searchParams.get('extensionPoints')?.split(',').filter(Boolean) || [];
  const isFiltered = currentExtensionPoints.includes(selectedExtensionPointId);

  return (
    <ContextMenu
      x={position.x}
      y={position.y}
      onClose={onClose}
      renderMenuItems={() => (
        <>
          <Menu.Item
            label="Highlight connections"
            icon="arrow-up"
            onClick={() => {
              reportInteraction('extensions_dependencygraph_context_menu_click', {
                pluginId: PLUGIN_ID,
                menuType: 'extension_point',
                action: 'highlight_connections',
                extensionPointId: selectedExtensionPointId,
              });
              onHighlightArrows();
            }}
          />
          <Menu.Item
            label="Switch to extension points view"
            icon="arrow-right"
            onClick={() => {
              reportInteraction('extensions_dependencygraph_context_menu_click', {
                pluginId: PLUGIN_ID,
                menuType: 'extension_point',
                action: 'switch_to_extension_points_view',
                extensionPointId: selectedExtensionPointId,
              });
              onNavigateToExtensionPoint();
            }}
          />
          {isFiltered ? (
            <Menu.Item
              label="Remove filter"
              icon="filter"
              onClick={() => {
                reportInteraction('extensions_dependencygraph_context_menu_click', {
                  pluginId: PLUGIN_ID,
                  menuType: 'extension_point',
                  action: 'remove_filter',
                  extensionPointId: selectedExtensionPointId,
                });
                onUnfilterExtensionPoint();
              }}
            />
          ) : (
            <Menu.Item
              label="Filter by extension point"
              icon="filter"
              onClick={() => {
                reportInteraction('extensions_dependencygraph_context_menu_click', {
                  pluginId: PLUGIN_ID,
                  menuType: 'extension_point',
                  action: 'filter_by_extension_point',
                  extensionPointId: selectedExtensionPointId,
                });
                onFilterExtensionPoint();
              }}
            />
          )}
        </>
      )}
    />
  );
}
