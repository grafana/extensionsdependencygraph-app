import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppRootProps } from '@grafana/data';
import { ROUTES } from '../../constants';

const DependencyGraph = React.lazy(() => import('../../pages/DependencyGraph'));

function App(props: AppRootProps) {
  return (
    <Routes>
      {/* Dependency Graph page */}
      <Route path={ROUTES.DependencyGraph} element={<DependencyGraph />} />

      {/* Default page */}
      <Route path="*" element={<DependencyGraph />} />
    </Routes>
  );
}

export default App;
