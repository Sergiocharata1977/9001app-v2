import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'admin' | 'manager' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/app/login" replace />;
  }

  // Si se requiere un rol específico, verificar
  if (requiredRole && user?.role !== requiredRole) {
    // Si es admin tratando de acceder a super_admin, redirigir a menu-cards
    if (user?.role === 'admin' && requiredRole === 'super_admin') {
      return <Navigate to="/app/menu-cards" replace />;
    }
    // Si es super_admin tratando de acceder a rutas de admin, permitir
    if (user?.role === 'super_admin' && requiredRole === 'admin') {
      return <>{children}</>;
    }
    // En otros casos, redirigir a una página de acceso denegado o al dashboard
    return <Navigate to="/app/menu-cards" replace />;
  }

  return <>{children}</>;
};

// Componente para rutas que solo pueden acceder admin de organización
export const OrganizationAdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/app/login" replace />;
  }

  // Permitir acceso solo a admin y super_admin
  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <Navigate to="/app/menu-cards" replace />;
  }

  return <>{children}</>;
};

// Componente para rutas que solo puede acceder super_admin
export const SuperAdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <ProtectedRoute requiredRole="super_admin">{children}</ProtectedRoute>;
};

export default ProtectedRoute;