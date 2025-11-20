import React, { useCallback } from 'react';

import { InlineField, MultiCombobox } from '@grafana/ui';

import { dependencyGraphTestIds } from '../testIds';

interface ExtensionPointSelectorProps {
  extensionPointOptions: Array<{ value: string; label: string }>;
  selectedExtensionPointValues: Array<{ value: string; label: string }>;
  onExtensionPointChange: (selected: Array<{ value?: string }>) => void;
}

/**
 * Component for selecting extension points
 */
export function ExtensionPointSelector({
  extensionPointOptions,
  selectedExtensionPointValues,
  onExtensionPointChange,
}: ExtensionPointSelectorProps): React.JSX.Element {
  const handleExtensionPointChange = useCallback(
    (selected: Array<{ value?: string }>) => {
      const selectedValues = selected.map((item) => item.value).filter((v): v is string => Boolean(v));
      const newValue = selectedValues.length === extensionPointOptions.length ? [] : selectedValues;
      onExtensionPointChange(newValue.map((value) => ({ value })));
    },
    [extensionPointOptions.length, onExtensionPointChange]
  );

  return (
    <InlineField label="Extension point">
      <MultiCombobox
        data-testid={dependencyGraphTestIds.extensionPointSelector}
        options={extensionPointOptions}
        value={selectedExtensionPointValues}
        onChange={handleExtensionPointChange}
        placeholder="Select extension points to display"
        width="auto"
        enableAllOption
        minWidth={20}
        maxWidth={30}
      />
    </InlineField>
  );
}
