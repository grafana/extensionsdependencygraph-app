/**
 * Extension Point Processor (Refactored)
 *
 * Main entry point for extension point processing. This file now imports
 * from focused modules for better organization and maintainability.
 */

import { AppPluginConfig } from '@grafana/data';

import { GraphData, PanelOptions } from '../../types';

import { collectExtensions } from './extensionPoint/extensionCollection';
import { addMissingExtensionPoints, collectExplicitExtensionPoints } from './extensionPoint/extensionPointCollection';
import { setupFilters } from './extensionPoint/filterSetup';
import { createDependencies, createNodes } from './extensionPoint/nodeAndDependencyCreation';


/**
 * Processes plugin data for "extensionpoint" mode visualization.
 *
 * In extension point mode, the visualization shows:
 * - Extensions (left side): Link, component, and function extensions that extend extension points
 * - Extension Points (right side): The extension points being extended
 * - Arrows: From extensions to their target extension points
 *
 * @param options - Panel options including filtering settings
 * @param pluginData - Raw plugin data from data.json
 * @returns Processed graph data for extension point mode visualization
 */
export const processPluginDataToExtensionPointGraph = (
  options: PanelOptions,
  pluginData: Record<string, AppPluginConfig>
): GraphData => {
  // Setup filters
  const filters = setupFilters(options);

  // Collect extension points
  const extensionPoints = collectExplicitExtensionPoints(pluginData, filters);
  addMissingExtensionPoints(extensionPoints, filters);

  // Collect extensions
  const extensions = collectExtensions(pluginData, filters);

  // Create nodes and dependencies
  const nodes = createNodes(pluginData, extensions, extensionPoints, filters);
  const dependencies = createDependencies(extensions, extensionPoints);

  return {
    nodes: Array.from(nodes.values()),
    dependencies,
    extensionPoints: Array.from(extensionPoints.values()),
    extensions: Array.from(extensions.values()),
    exposedComponents: [], // Not used in extension point mode
  };
};
