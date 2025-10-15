import { AppPluginConfig } from '@grafana/data';

const pluginData = require('../../data.json');

// Cache for expensive calculations
const cache = new Map<string, unknown>();

/**
 * Gets plugin data from data.json file.
 *
 * @returns Plugin data object containing all plugin configurations
 *
 * @public
 */
export const getPluginData = (): Record<string, AppPluginConfig> => {
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
  return result as T | undefined;
};

export const setCachedResult = <T>(key: string, result: T): void => {
  cache.set(key, result);
};
