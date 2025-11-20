import React, { useCallback } from 'react';

import { InlineField, MultiCombobox } from '@grafana/ui';
import { reportInteraction } from '@grafana/runtime';

import { dependencyGraphTestIds } from '../testIds';
import { PLUGIN_ID } from '../../constants';

interface ContentConsumerSelectorProps {
  activeConsumers: string[];
  selectedConsumerValues: Array<{ value: string; label: string }>;
  onConsumerChange: (selected: Array<{ value?: string }>) => void;
}

/**
 * Component for selecting content consumers
 */
export function ContentConsumerSelector({
  activeConsumers,
  selectedConsumerValues,
  onConsumerChange,
}: ContentConsumerSelectorProps): React.JSX.Element {
  const handleConsumerChange = useCallback(
    (selected: Array<{ value?: string }>) => {
      const selectedValues = selected.map((item) => item.value).filter((v): v is string => Boolean(v));
      const isDefaultSelection =
        selectedValues.length === activeConsumers.length &&
        activeConsumers.every((consumer) => selectedValues.includes(consumer));
      const newValue = isDefaultSelection ? [] : selectedValues;

      reportInteraction('extensions_dependencygraph_filter_usage', {
        pluginId: PLUGIN_ID,
        filterType: 'content_consumer',
        selectedCount: newValue.length,
        selectedConsumers: newValue,
      });

      onConsumerChange(newValue.map((value) => ({ value })));
    },
    [activeConsumers, onConsumerChange]
  );

  return (
    <InlineField label="Content consumer">
      <MultiCombobox
        data-testid={dependencyGraphTestIds.contentConsumerSelector}
        options={selectedConsumerValues}
        value={selectedConsumerValues}
        onChange={handleConsumerChange}
        placeholder="Select content consumers to display (active consumers by default)"
        width="auto"
        enableAllOption
        minWidth={20}
        maxWidth={30}
      />
    </InlineField>
  );
}
