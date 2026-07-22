import { useCallback, useMemo } from 'react';

import { VisualizationMode } from './useDependencyGraphData';
import { useSearchParams } from 'react-router-dom';

/**
 * Type guard to check if a string is a valid VisualizationMode
 */
const isValidVisualizationMode = (mode: string | null): mode is VisualizationMode => {
  return (
    mode === 'exposedComponents' ||
    mode === 'extensionpoint' ||
    mode === 'addedlinks' ||
    mode === 'addedcomponents' ||
    mode === 'addedfunctions'
  );
};

export interface DependencyGraphControls {
  visualizationMode: VisualizationMode;
  selectedContentProviders: string[];
  selectedContentConsumers: string[];
  selectedContentConsumersForExtensionPoint: string[];
  selectedExtensionPoints: string[];
  selectedExtensions: string[];
  setVisualizationMode: (mode: VisualizationMode) => void;
  setSelectedContentProviders: (providers: string[]) => void;
  setSelectedContentConsumers: (consumers: string[]) => void;
  setSelectedContentConsumersForExtensionPoint: (consumers: string[]) => void;
  setSelectedExtensionPoints: (extensionPoints: string[]) => void;
  setSelectedExtensions: (extensions: string[]) => void;
  modeOptions: Array<{ label: string; value: VisualizationMode }>;
}

/**
 * URL parameter utilities for dependency graph controls
 */
const URL_PARAMS = {
  API_MODE: 'view',
  CONTENT_PROVIDERS: 'contentProviders',
  CONTENT_CONSUMERS: 'contentConsumers',
  CONTENT_CONSUMERS_FOR_EXTENSION_POINT: 'contentConsumersForExtensionPoint',
  EXTENSION_POINTS: 'extensionPoints',
  EXTENSIONS: 'extensions',
} as const;

/**
 * Parse comma-separated string to array
 */
const parseArrayParam = (value: string | null): string[] => {
  if (!value) {
    return [];
  }
  return value.split(',').filter(Boolean);
};

/**
 * Serialize array to comma-separated string
 */
const serializeArrayParam = (array: string[]): string => {
  return array.join(',');
};

/**
 * Custom hook for managing dependency graph control state with URL synchronization
 */
export function useDependencyGraphControls(): DependencyGraphControls {
  const [searchParams, setSearchParams] = useSearchParams();

  // The URL is the source of truth: derive all control state from it
  const mode = searchParams.get(URL_PARAMS.API_MODE);
  // Default to 'addedlinks' mode when no view parameter is present
  const visualizationMode: VisualizationMode = isValidVisualizationMode(mode) ? mode : 'addedlinks';

  const selectedContentProviders = useMemo(
    () => parseArrayParam(searchParams.get(URL_PARAMS.CONTENT_PROVIDERS)),
    [searchParams]
  );

  const selectedContentConsumers = useMemo(
    () => parseArrayParam(searchParams.get(URL_PARAMS.CONTENT_CONSUMERS)),
    [searchParams]
  );

  const selectedContentConsumersForExtensionPoint = useMemo(
    () => parseArrayParam(searchParams.get(URL_PARAMS.CONTENT_CONSUMERS_FOR_EXTENSION_POINT)),
    [searchParams]
  );

  const selectedExtensionPoints = useMemo(
    () => parseArrayParam(searchParams.get(URL_PARAMS.EXTENSION_POINTS)),
    [searchParams]
  );

  const selectedExtensions = useMemo(
    () => parseArrayParam(searchParams.get(URL_PARAMS.EXTENSIONS)),
    [searchParams]
  );

  // Update URL parameters when state changes
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);

        // Preserve useFakeData parameter if it's set to true
        const useFakeData = prev.get('useFakeData');

        Object.entries(updates).forEach(([key, value]) => {
          if (value === null || value === '') {
            newParams.delete(key);
          } else {
            newParams.set(key, value);
          }
        });

        // Restore useFakeData if it was true
        if (useFakeData === 'true') {
          newParams.set('useFakeData', 'true');
        }

        return newParams;
      });
    },
    [setSearchParams]
  );

  // Wrapper functions that update the URL, which the derived state follows
  const setVisualizationMode = useCallback(
    (mode: VisualizationMode) => {
      // Reset filters when changing views via dropdown
      updateUrlParams({
        [URL_PARAMS.API_MODE]: mode,
        [URL_PARAMS.CONTENT_PROVIDERS]: null,
        [URL_PARAMS.CONTENT_CONSUMERS]: null,
        [URL_PARAMS.CONTENT_CONSUMERS_FOR_EXTENSION_POINT]: null,
        [URL_PARAMS.EXTENSION_POINTS]: null,
        [URL_PARAMS.EXTENSIONS]: null,
      });
    },
    [updateUrlParams]
  );

  const setSelectedContentProviders = useCallback(
    (providers: string[]) => {
      updateUrlParams({
        [URL_PARAMS.CONTENT_PROVIDERS]: providers.length > 0 ? serializeArrayParam(providers) : null,
      });
    },
    [updateUrlParams]
  );

  const setSelectedContentConsumers = useCallback(
    (consumers: string[]) => {
      updateUrlParams({
        [URL_PARAMS.CONTENT_CONSUMERS]: consumers.length > 0 ? serializeArrayParam(consumers) : null,
      });
    },
    [updateUrlParams]
  );

  const setSelectedContentConsumersForExtensionPoint = useCallback(
    (consumers: string[]) => {
      updateUrlParams({
        [URL_PARAMS.CONTENT_CONSUMERS_FOR_EXTENSION_POINT]:
          consumers.length > 0 ? serializeArrayParam(consumers) : null,
      });
    },
    [updateUrlParams]
  );

  const setSelectedExtensionPoints = useCallback(
    (extensionPoints: string[]) => {
      updateUrlParams({
        [URL_PARAMS.EXTENSION_POINTS]: extensionPoints.length > 0 ? serializeArrayParam(extensionPoints) : null,
      });
    },
    [updateUrlParams]
  );

  const setSelectedExtensions = useCallback(
    (extensions: string[]) => {
      updateUrlParams({
        [URL_PARAMS.EXTENSIONS]: extensions.length > 0 ? serializeArrayParam(extensions) : null,
      });
    },
    [updateUrlParams]
  );

  const modeOptions = [
    { label: 'Added links', value: 'addedlinks' as const },
    { label: 'Added components', value: 'addedcomponents' as const },
    { label: 'Added functions', value: 'addedfunctions' as const },
    { label: 'Exposed components', value: 'exposedComponents' as const },
    { label: 'Extension points', value: 'extensionpoint' as const },
  ];

  return {
    visualizationMode,
    selectedContentProviders,
    selectedContentConsumers,
    selectedContentConsumersForExtensionPoint,
    selectedExtensionPoints,
    selectedExtensions,
    setVisualizationMode,
    setSelectedContentProviders,
    setSelectedContentConsumers,
    setSelectedContentConsumersForExtensionPoint,
    setSelectedExtensionPoints,
    setSelectedExtensions,
    modeOptions,
  };
}
