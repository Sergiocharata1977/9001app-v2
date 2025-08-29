import React, { useEffect } from 'react';
import useAuthStore from '@/store/authStore';

const SuperAdminTestAuth: React.FC = () => {
  const { updateUser, isAuthenticated } = useAuthStore();

  const createMockSuperAdmin = () => {
    const mockUser = {
      id: '999',
      name: 'Super Admin Test',
      email: 'superadmin@9001app.com',
      role: 'super_admin',
      organization_id: null,
      organization_name: null,
      organization_plan: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Simular token válido
    localStorage.setItem('token', 'mock-super-admin-token-123');
    
    // Actualizar el usuario en el store
    updateUser(mockUser);
    
    console.log('🧪 Mock Super Admin creado:', mockUser);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'red', 
      color: 'white', 
      padding: '10px',
      borderRadius: '5px',
      zIndex: 9999
    }}>
      <h3>TEST AUTH</h3>
      <p>Autenticado: {isAuthenticated ? 'SÍ' : 'NO'}</p>
      <button onClick={createMockSuperAdmin} style={{ 
        background: 'white', 
        color: 'red', 
        border: 'none', 
        padding: '5px 10px',
        borderRadius: '3px',
        cursor: 'pointer'
      }}>
        Crear Super Admin Test
      </button>
    </div>
  );
};

export default SuperAdminTestAuth;