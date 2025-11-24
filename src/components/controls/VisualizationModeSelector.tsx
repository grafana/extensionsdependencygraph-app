import React, { useCallback } from 'react';

import { Combobox, InlineField } from '@grafana/ui';
import { reportInteraction } from '@grafana/runtime';

import { DependencyGraphControls } from '../../hooks/useDependencyGraphControls';
import { VisualizationMode } from '../../hooks/useDependencyGraphData';
import { dependencyGraphTestIds } from '../testIds';
import { PLUGIN_ID } from '../../constants';

interface VisualizationModeSelectorProps {
  controls: DependencyGraphControls;
}

/**
 * Component for selecting the visualization mode
 */
export function VisualizationModeSelector({ controls }: VisualizationModeSelectorProps): React.JSX.Element {
  const { visualizationMode, setVisualizationMode, modeOptions } = controls;

  const handleModeChange = useCallback(
    (option: { value?: VisualizationMode }) => {
      if (
        option.value &&
        (option.value === 'exposedComponents' ||
          option.value === 'addedlinks' ||
          option.value === 'addedcomponents' ||
          option.value === 'addedfunctions' ||
          option.value === 'extensionpoint')
      ) {
        reportInteraction('extensions_dependencygraph_view_change', {
          pluginId: PLUGIN_ID,
          previousView: visualizationMode,
          newView: option.value,
        });
        setVisualizationMode(option.value);
      }
    },
    [setVisualizationMode, visualizationMode]
  );

  return (
    <InlineField>
      <Combobox<VisualizationMode>
        data-testid={dependencyGraphTestIds.visualizationModeSelector}
        options={modeOptions}
        value={visualizationMode}
        onChange={handleModeChange}
        width={22}
      />
    </InlineField>
  );
}
