import { AppPluginConfig } from '@grafana/data';

const pluginData = require('../../data.json');

// Cache for expensive calculations
const cache = new Map<string, unknown>();

/**
 * Gets plugin data from either window.grafanaBootData.settings.apps (default) or data.json (when useFakeData=true).
 *
 * By default, this function reads plugin data from window.grafanaBootData.settings.apps which is injected
 * by the Grafana runtime. For testing purposes, you can add ?useFakeData=true to the URL
 * to use the static data from data.json instead.
 *
 * @returns Plugin data object containing all plugin configurations
 *
 * @public
 */
export const getPluginData = (): Record<string, AppPluginConfig> => {
  // Check if we should use fake data from data.json
  const urlParams = new URLSearchParams(window.location.search);
  const useFakeData = urlParams.get('useFakeData') === 'true';

  if (useFakeData) {
    console.log('Using fake data from data.json');
    return pluginData as Record<string, AppPluginConfig>;
  }

  // Default: use real data from window.grafanaBootData.settings.apps
  const grafanaBootData = (window as any).grafanaBootData;
  const windowPlugins = grafanaBootData?.settings?.apps;

  if (windowPlugins && typeof windowPlugins === 'object') {
    console.log('Using real plugin data from window.grafanaBootData.settings.apps');
    return windowPlugins as Record<string, AppPluginConfig>;
  }

  // No data available
  console.warn('window.grafanaBootData.settings.apps not found. Add ?useFakeData=true to use test data.');
  return {};
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
  return result as T | undefined;
};

export const setCachedResult = <T>(key: string, result: T): void => {
  cache.set(key, result);
};
