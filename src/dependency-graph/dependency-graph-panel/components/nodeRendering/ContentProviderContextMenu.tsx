/**
 * Content Provider Context Menu
 *
 * Context menu for content provider nodes in the dependency graph.
 */

import React from 'react';
import { ContextMenu, Menu } from '@grafana/ui';

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
          <Menu.Item label="Highlight connections" onClick={onHighlightArrows} />
          <Menu.Item
            label={isFiltered(selectedContentProviderId) ? 'Remove filter' : `Filter by ${appName}`}
            onClick={isFiltered(selectedContentProviderId) ? onRemoveFilter : onFilter}
            icon="filter"
          />
        </>
      )}
    />
  );
}
