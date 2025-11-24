import React, { useCallback } from 'react';

import { InlineField, MultiCombobox } from '@grafana/ui';
import { reportInteraction } from '@grafana/runtime';

import { dependencyGraphTestIds } from '../testIds';
import { PLUGIN_ID } from '../../constants';

interface ContentProviderSelectorProps {
  availableProviders: string[];
  selectedProviderValues: Array<{ value: string; label: string }>;
  onProviderChange: (selected: Array<{ value?: string }>) => void;
}

/**
 * Component for selecting content providers
 */
export function ContentProviderSelector({
  availableProviders,
  selectedProviderValues,
  onProviderChange,
}: ContentProviderSelectorProps): React.JSX.Element {
  const handleProviderChange = useCallback(
    (selected: Array<{ value?: string }>) => {
      const selectedValues = selected.map((item) => item.value).filter((v): v is string => Boolean(v));
      const newValue = selectedValues.length === availableProviders.length ? [] : selectedValues;

      reportInteraction('extensions_dependencygraph_filter_usage', {
        pluginId: PLUGIN_ID,
        filterType: 'content_provider',
        selectedCount: newValue.length,
        selectedProviders: newValue,
      });

      onProviderChange(newValue.map((value) => ({ value })));
    },
    [availableProviders.length, onProviderChange]
  );

  return (
    <InlineField label="Content provider">
      <MultiCombobox
        data-testid={dependencyGraphTestIds.contentProviderSelector}
        options={selectedProviderValues}
        value={selectedProviderValues}
        onChange={handleProviderChange}
        placeholder="Select content providers to display"
        width="auto"
        enableAllOption
        minWidth={20}
        maxWidth={30}
      />
    </InlineField>
  );
}
