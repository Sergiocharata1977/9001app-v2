import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LoginDebug from './components/common/LoginDebug.jsx';
import SuperAdminRedirect from './components/common/SuperAdminRedirect.jsx';
import SuperAdminTestAuth from './components/admin/super-admin/SuperAdminTestAuth.tsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { useAuthInitializer } from './hooks/useAuthInitializer.js';
import { QueryProvider } from './hooks/useQueryClient.jsx';
import './index.css';
import AppRoutes from './routes/AppRoutes.jsx';

// Componente interno que maneja la inicialización de auth
const AppContent = () => {
  const { isLoading } = useAuthInitializer();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Componente de redirección automática para Super Admins */}
      <SuperAdminRedirect />
      
      <Routes>
        {/* Usar AppRoutes, toda la app va bajo /app y públicas fuera */}
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
      
      {/* Componente de debug para desarrollo */}
      <LoginDebug />
      
      {/* Componente de test para Super Admin */}
      <SuperAdminTestAuth />
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
