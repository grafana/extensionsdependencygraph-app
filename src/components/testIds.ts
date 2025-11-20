export const testIds = {
  appConfig: {
    apiKey: 'data-testid ac-api-key',
    apiUrl: 'data-testid ac-api-url',
    submit: 'data-testid ac-submit-form',
  },
  pageOne: {
    container: 'data-testid pg-one-container',
    navigateToFour: 'data-testid navigate-to-four',
  },
  pageTwo: {
    container: 'data-testid pg-two-container',
  },
  pageThree: {
    container: 'data-testid pg-three-container',
  },
  pageFour: {
    container: 'data-testid pg-four-container',
    navigateBack: 'data-testid navigate-back',
  },
};

/**
 * Centralized test IDs for the Dependency Graph feature.
 * Used across both source code and test files to ensure consistency.
 */
export const dependencyGraphTestIds = {
  // Selectors/Controls
  visualizationModeSelector: 'visualization-mode-selector',
  extensionPointSelector: 'extension-point-selector',
  contentProviderSelector: 'content-provider-selector',
  contentConsumerSelector: 'content-consumer-selector',

  // Graph elements - these are functions that return the test ID with dynamic values
  contentProviderBox: (pluginId: string) => `content-provider-box-${pluginId}`,
  contentConsumerBox: (pluginId: string) => `content-consumer-box-${pluginId}`,
  extensionPointBox: (extensionPointId: string) => `extension-point-box-${extensionPointId}`,
} as const;

/**
 * Helper to get all test IDs matching a prefix (for use in tests with selectors like [data-testid^="..."])
 */
export const dependencyGraphTestIdPrefixes = {
  contentProviderBox: 'content-provider-box-',
  contentConsumerBox: 'content-consumer-box-',
  extensionPointBox: 'extension-point-box-',
} as const;
