# Extensions Dependency Graph

Developer tools for plugin authors working with Grafana's [plugin extensions system](https://grafana.com/developers/plugin-tools/ui-extensions). This app helps you visualize, explore, and debug extension relationships during plugin development.

![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?logo=grafana&query=$.version&url=https://grafana.com/api/plugins/grafana-extensionsdependencygraph-app&label=Marketplace&prefix=v&color=F47A20)

## Overview

Extensions Dependency Graph provides interactive visualization and debugging capabilities for Grafana's plugin extensions system. If you're building plugins that use extension points or provide extensions to other plugins, this tool helps you understand and debug those relationships in real-time.

## Key Features

### Dependency Graph Visualization

The Dependency Graph provides an interactive visualization of your plugin ecosystem, showing how plugins connect through the extensions system. Choose from multiple visualization modes to explore different aspects of your plugin architecture:

#### Added Links Mode

Visualize plugins adding link extensions to extension points.

![Added Links Mode](https://github.com/grafana/extensionsdependencygraph-app/raw/main/src/img/added-links.jpg)

#### Added Components Mode

See plugins adding component extensions to extension points.

![Added Components Mode](https://github.com/grafana/extensionsdependencygraph-app/raw/main/src/img/added-components.jpg)

#### Added Functions Mode

Track plugins adding function extensions to extension points.

![Added Functions Mode](https://github.com/grafana/extensionsdependencygraph-app/raw/main/src/img/added-functions.jpg)

#### Exposed Components Mode

View plugins exposing components to other plugins.

![Exposed Components Mode](https://github.com/grafana/extensionsdependencygraph-app/raw/main/src/img/exposed-components.jpg)

#### Extension Points Mode

Detailed view of extension points and their consumers.

![Extension Points Mode](https://github.com/grafana/extensionsdependencygraph-app/raw/main/src/img/extension-points.jpg)

### Interactive Features

- **Filtering**: Filter by content providers, content consumers, and extension points
- **Click Interactions**: Click on nodes to explore relationships
- **Context Menus**: Right-click for additional actions and information
- **Real-time Updates**: Automatically reflects changes in your development environment

## Requirements

- Grafana 10.4.0 or later
- A Grafana instance with plugins that use the extensions system

## Getting Started

1. **Install the plugin** in your Grafana instance
2. **Navigate to the Extensions Dependency Graph app** from the Grafana main menu
3. **Open the Dependency Graph** to start visualizing your plugin extensions
4. **Use the filters and visualization modes** to explore different aspects of your plugin ecosystem

## Use Cases

### Plugin Development

- Verify that your plugin correctly registers extension points
- Confirm that extensions are being added to the right extension points
- Debug extension relationships during development

### Architecture Review

- Understand the overall structure of your plugin ecosystem
- Identify dependencies between plugins
- Document extension point usage

### Troubleshooting

- Debug missing or misconfigured extensions
- Identify unexpected plugin relationships
- Validate extension configurations

## Future Tools

Additional developer tools for working with plugin extensions will be added in future releases. Stay tuned for updates!

## Documentation

For more information about Grafana's plugin extensions system, refer to:

- [UI Extensions Documentation](https://grafana.com/developers/plugin-tools/ui-extensions)
- [Plugin Development Guide](https://grafana.com/developers/plugin-tools/)

## Contributing

This plugin is developed and maintained by Grafana Labs. If you encounter issues or have feature requests, please use the GitHub repository's issue tracker.

## License

Apache License 2.0
