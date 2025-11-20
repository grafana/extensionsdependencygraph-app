import { GraphData, PanelOptions } from '../../types';
import { getCacheKey, getCachedResult, getPluginData, setCachedResult } from '../helpers/dataAccess';

import { processPluginDataToAddedComponentsGraph } from './addedComponentsProcessor';
import { processPluginDataToAddedFunctionsGraph } from './addedFunctionsProcessor';
import { processPluginDataToAddedLinksGraph } from './addedLinksProcessor';
import { processPluginDataToExposeGraph } from './exposedComponentsProcessor';
import { processPluginDataToExtensionPointGraph } from './extensionPointProcessor';

/**
 * Processes plugin data from data.json into a graph format for visualization.
 *
 * This is the main entry point for data processing. It routes to the appropriate
 * processor based on the visualization mode and implements result caching for
 * performance optimization.
 *
 * @param options - Panel configuration options that determine visualization mode and filtering
 * @returns GraphData structure containing nodes, dependencies, and extension information
 *
 * @example
 * ```typescript
 * const options: PanelOptions = {
 *   visualizationMode: 'addedlinks',
 *   selectedContentProviders: [],
 *   selectedContentConsumers: []
 * };
 * const graphData = processPluginDataToGraph(options);
 * ```
 *
 * @public
 */
export const processPluginDataToGraph = (options: PanelOptions): GraphData => {
  // Check cache first
  const cacheKey = getCacheKey(options);
  const cachedResult = getCachedResult<GraphData>(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const pluginData = getPluginData();
  // Route to the appropriate processor based on visualization mode
  let result: GraphData;
  switch (options.visualizationMode) {
    case 'exposedComponents':
      result = processPluginDataToExposeGraph(options, pluginData);
      break;
    case 'extensionpoint':
      result = processPluginDataToExtensionPointGraph(options, pluginData);
      break;
    case 'addedlinks':
      result = processPluginDataToAddedLinksGraph(options, pluginData);
      break;
    case 'addedcomponents':
      result = processPluginDataToAddedComponentsGraph(options, pluginData);
      break;
    case 'addedfunctions':
      result = processPluginDataToAddedFunctionsGraph(options, pluginData);
      break;
    default:
      result = processPluginDataToAddedLinksGraph(options, pluginData);
      break;
  }

  // Cache the result
  setCachedResult(cacheKey, result);
  return result;
};

// Keep the original function for backward compatibility, but it now just calls the new one
export const processTableDataToGraph = (data: unknown, options: PanelOptions): GraphData => {
  return processPluginDataToGraph(options);
};
