import React from 'react';
import SuperAdminRoutes from '@/components/admin/super-admin/SuperAdminRoutes';

const SuperAdminPage = () => {
  console.log('🎯 SuperAdminPage renderizado');
  
  return (
    <div className="min-h-screen">
      <SuperAdminRoutes />
    </div>
  );
};

export default SuperAdminPage; 