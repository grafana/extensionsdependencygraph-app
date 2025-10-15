// This script is evaluated in the browser context, following the pattern from @grafana/plugin-e2e
// It overrides window.grafanaBootData.settings.apps with mock data for testing.

// The mock data will be injected here as a string and parsed

export const overrideGrafanaBootData = ({ apps }) => {
  const timeout = 1;
  const waitForGrafanaBootData = (cb) => {
    if (window?.grafanaBootData?.user) {
      cb();
    } else {
      setTimeout(() => waitForGrafanaBootData(cb), timeout);
    }
  };

  // Wait for Grafana boot data to be added to the window object
  waitForGrafanaBootData(() => {
    if (apps && Object.keys(apps).length > 0) {
      console.log('@grafana/extensionsdevtools-app: setting mock apps data with', Object.keys(apps).length, 'plugins');

      // Override apps with the mock data provided by the test
      window.grafanaBootData.settings.apps = apps;
    }
  });
};
