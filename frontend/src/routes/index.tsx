import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout components
import MainLayout from '../components/common/MainLayout';

// Page components
import Dashboard from '../pages/Dashboard';
import DepartmentsPage from '../pages/DepartmentsPage';
import RolesPage from '../pages/RolesPage';
import MatricesPage from '../pages/MatricesPage';
import CalculatorsPage from '../pages/CalculatorsPage';
import OrgChartPage from '../pages/OrgChartPage';
import ImplementationsPage from '../pages/ImplementationsPage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="departments/:departmentId" element={<DepartmentsPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="roles/:roleId" element={<RolesPage />} />
          <Route path="matrices" element={<MatricesPage />} />
          <Route path="matrices/:matrixId" element={<MatricesPage />} />
          <Route path="calculators" element={<CalculatorsPage />} />
          <Route path="calculators/:calculatorId" element={<CalculatorsPage />} />
          <Route path="org-chart" element={<OrgChartPage />} />
          <Route path="org-chart/:chartId" element={<OrgChartPage />} />
          <Route path="implementations" element={<ImplementationsPage />} />
          <Route path="implementations/:implementationId" element={<ImplementationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
