import { AppPluginConfig } from '@grafana/data';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pluginData = require('../../data.json');

// Cache for expensive calculations
const cache = new Map<string, unknown>();
const ENABLE_DEBUG_LOGS = true; // Set to true for debugging

/**
 * Gets plugin data from window.grafanaBootData.settings.apps or falls back to data.json file.
 *
 * @returns Plugin data object containing all plugin configurations
 *
 * @public
 */
export const getPluginData = (): Record<string, AppPluginConfig> => {
  // Try to get data from window.grafanaBootData.settings.apps first
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const grafanaBootData = (window as any).grafanaBootData;
    if (grafanaBootData?.settings?.apps) {
      if (ENABLE_DEBUG_LOGS) {
        console.log('Using window.grafanaBootData.settings.apps', Object.keys(grafanaBootData.settings.apps).length, 'plugins');
      }
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return grafanaBootData.settings.apps as Record<string, AppPluginConfig>;
    }
  } catch (error) {
    console.warn('Could not load plugin data from window.grafanaBootData, falling back to data.json', error);
  }

  // Fall back to data.json for dependency graph data (for testing/development)
  if (ENABLE_DEBUG_LOGS) {
    console.log('Using fallback data.json', Object.keys(pluginData).length, 'plugins');
  }
  // Type assertion to handle the data from data.json
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return pluginData as Record<string, AppPluginConfig>;
};

/**
 * Clears all cached graph data results.
 *
 * Call this when the underlying plugin data changes or when you want to force
 * a fresh computation of all graph data.
 *
 * @public
 */
export const clearCache = (): void => {
  cache.clear();
};

/**
 * Returns the current number of cached graph data results.
 *
 * @returns The number of entries currently in the cache
 *
 * @public
 */
export const getCacheSize = (): number => {
  return cache.size;
};

/**
 * Helper to generate cache keys for graph data caching.
 *
 * @param options - Options object containing visualization mode and filter selections
 * @returns Cache key string for the given options
 *
 * @internal
 */
export const getCacheKey = (options: {
  visualizationMode: string;
  selectedContentProviders?: string[];
  selectedContentConsumers?: string[];
  selectedExtensionPoints?: string[];
  selectedContentConsumersForExtensionPoint?: string[];
}): string => {
  return JSON.stringify({
    mode: options.visualizationMode,
    providers: Array.isArray(options.selectedContentProviders) ? options.selectedContentProviders.slice().sort() : [],
    consumers: Array.isArray(options.selectedContentConsumers) ? options.selectedContentConsumers.slice().sort() : [],
    extensionPoints: Array.isArray(options.selectedExtensionPoints)
      ? options.selectedExtensionPoints.slice().sort()
      : [],
    contentConsumersForExtensionPoint: Array.isArray(options.selectedContentConsumersForExtensionPoint)
      ? options.selectedContentConsumersForExtensionPoint.slice().sort()
      : [],
  });
};

/**
 * Cache management functions
 */
export const getCachedResult = <T>(key: string): T | undefined => {
  const result = cache.get(key);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return result as T | undefined;
};

export const setCachedResult = <T>(key: string, result: T): void => {
  cache.set(key, result);
};
