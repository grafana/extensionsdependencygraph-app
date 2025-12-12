# Extensions Dependency Graph

Developer tools for plugin authors working with Grafana's [plugin extensions system](https://grafana.com/developers/plugin-tools/ui-extensions). This app helps you visualize, explore, and debug extension relationships during plugin development.

## Current Features

### Dependency Graph Visualization

Interactive graph showing relationships between plugins, extension points, and extensions with multiple visualization modes:

- **Added Links Mode**: Visualize plugins adding link extensions to extension points
- **Added Components Mode**: See plugins adding component extensions
- **Added Functions Mode**: Track plugins adding function extensions
- **Exposed Components Mode**: View plugins exposing components to other plugins
- **Extension Point Mode**: Detailed view of extension points and their consumers

**Features:**

- Filter by content providers, content consumers, and extension points
- Interactive exploration with click and context menu interactions
- Real-time visualization of your plugin's extension relationships

## Reporting Issues

Found a bug or have a feature request? We'd love to hear from you!

- **Bug reports**: Open an issue on [GitHub Issues](https://github.com/grafana/grafana-extensionsdevtools-app/issues) with steps to reproduce the problem
- **Feature requests**: Submit an issue describing the feature and its use case
- **Questions**: Reach out in the [`#plugin-development`](https://grafana.slack.com/archives/C3HJV5PNE) Slack channel (Public) or [#grafana-plugins-platform](https://grafanalabs.enterprise.slack.com/archives/C01C4K8DETW) Slack channel (internal)
