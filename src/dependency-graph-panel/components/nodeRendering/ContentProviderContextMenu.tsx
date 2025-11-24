/**
 * Content Provider Context Menu
 *
 * Context menu for content provider nodes in the dependency graph.
 */

import React from 'react';
import { ContextMenu, Menu } from '@grafana/ui';
import { reportInteraction } from '@grafana/runtime';

import { PLUGIN_ID } from '../../../constants';

interface ContentProviderContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedContentProviderId: string | null;
  onClose: () => void;
  onHighlightArrows: () => void;
  onFilter: () => void;
  onRemoveFilter: () => void;
  isFiltered: (providerId: string) => boolean;
}

/**
 * Context menu for content provider nodes
 */
export function ContentProviderContextMenu({
  isOpen,
  position,
  selectedContentProviderId,
  onClose,
  onHighlightArrows,
  onFilter,
  onRemoveFilter,
  isFiltered,
}: ContentProviderContextMenuProps): React.JSX.Element {
  if (!isOpen || !selectedContentProviderId) {
    return <></>;
  }

  const appName = selectedContentProviderId === 'grafana-core' ? 'Grafana Core' : selectedContentProviderId;

  return (
    <ContextMenu
      x={position.x}
      y={position.y}
      onClose={onClose}
      renderMenuItems={() => (
        <>
          <Menu.Item
            label="Highlight connections"
            onClick={() => {
              reportInteraction('extensions_dependencygraph_context_menu_click', {
                pluginId: PLUGIN_ID,
                menuType: 'content_provider',
                action: 'highlight_connections',
                providerId: selectedContentProviderId,
              });
              onHighlightArrows();
            }}
          />
          <Menu.Item
            label={isFiltered(selectedContentProviderId) ? 'Remove filter' : `Filter by ${appName}`}
            onClick={() => {
              const action = isFiltered(selectedContentProviderId) ? 'remove_filter' : 'filter_by_provider';
              reportInteraction('extensions_dependencygraph_context_menu_click', {
                pluginId: PLUGIN_ID,
                menuType: 'content_provider',
                action,
                providerId: selectedContentProviderId,
              });
              if (isFiltered(selectedContentProviderId)) {
                onRemoveFilter();
              } else {
                onFilter();
              }
            }}
            icon="filter"
          />
        </>
      )}
    />
  );
}
