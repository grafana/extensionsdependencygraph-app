# Contributing

Additional developer tools for working with plugin extensions will be added in future releases.

### Frontend

1. Install dependencies

   ```bash
   npm install
   ```

2. Build plugin in development mode and run in watch mode

   ```bash
   npm run dev
   ```

3. Build plugin in production mode

   ```bash
   npm run build
   ```

4. Run the tests (using Jest)

   ```bash
   # Runs the tests and watches for changes, requires git init first
   npm run test

   # Exits after running all the tests
   npm run test:ci
   ```

5. Spin up a Grafana instance and run the plugin inside it (using Docker)

   ```bash
   npm run server
   ```

6. Run the E2E tests (using Playwright)

   ```bash
   # Spins up a Grafana instance first that we tests against
   npm run server

   # If you wish to start a certain Grafana version. If not specified will use latest by default
   GRAFANA_VERSION=11.3.0 npm run server

   # Starts the tests
   npm run e2e
   ```

7. Run the linter

   ```bash
   npm run lint

   # or

   npm run lint:fix
   ```

# Releases

## Automatic Deployments

All pushes to the `main` branch are automatically deployed to the **dev** environment.

## Manual Deployments (OPS)

To deploy to OPS or other environments:

1. Go to the [Plugins - CD workflow](https://github.com/grafana/extensionsdependencygraph-app/actions/workflows/publish.yaml)
2. Click **"Run workflow"**
3. Select the branch to deploy and the target environment
4. Click **"Run workflow"** to start the deployment
