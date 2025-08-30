import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DatabaseManagement from './DatabaseManagement';
import GlobalUsers from './GlobalUsers';
import OrganizationsManagement from './OrganizationsManagement';
import SuperAdminDashboard from './SuperAdminDashboard';
import SuperAdminLayout from './SuperAdminLayout';
import SystemConfig from './SystemConfig';
import SystemMonitoring from './SystemMonitoring';
// import AgentCoordinator from './AgentCoordinator'; // Comentado temporalmente

const SuperAdminRoutes: React.FC = () => {
  console.log('🎯 SuperAdminRoutes renderizado');
  
  return (
    <SuperAdminLayout>
      <Routes>
        <Route path="/" element={<SuperAdminDashboard />} />
        <Route path="/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/organizations" element={<OrganizationsManagement />} />
        <Route path="/users" element={<GlobalUsers />} />
        <Route path="/system" element={<SystemConfig />} />
        <Route path="/database" element={<DatabaseManagement />} />
        <Route path="/monitoring" element={<SystemMonitoring />} />
        
        {/* Redirección por defecto */}
        <Route path="*" element={<SuperAdminDashboard />} />
      </Routes>
    </SuperAdminLayout>
  );
};

export default SuperAdminRoutes;
