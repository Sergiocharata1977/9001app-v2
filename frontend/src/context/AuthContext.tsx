import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api/index';
import { toast } from 'react-hot-toast';

// Tipos de TypeScript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'user';
  organization_id?: string;
  organization_name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

// Provider del contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Función para guardar datos de autenticación
  const saveAuthData = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    // Configurar el token en los headers de axios
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  // Función para limpiar datos de autenticación
  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  // Función de login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Iniciando login con:', email);
      
      const response = await apiClient.post('/auth/login', { email, password });
      const { data } = response.data;
      
      console.log('✅ Respuesta del servidor:', data);
      
      if (data && data.user && data.tokens?.accessToken) {
        // Guardar datos de autenticación
        saveAuthData(data.user, data.tokens.accessToken);
        
        // Redireccionar según el rol
        const redirectPath = data.user.role === 'super_admin' 
          ? '/app/super-admin/tablero' 
          : '/app/menu-cards';
        
        console.log('🚀 Redirigiendo a:', redirectPath);
        toast.success('¡Inicio de sesión exitoso!');
        
        // Usar setTimeout para asegurar que el estado se actualice antes de navegar
        setTimeout(() => {
          navigate(redirectPath);
        }, 100);
      } else {
        throw new Error('Respuesta del servidor inválida');
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    console.log('👋 Cerrando sesión...');
    clearAuthData();
    toast.success('Sesión cerrada correctamente');
    navigate('/app/login');
  };

  // Función para verificar autenticación
  const checkAuth = async () => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (!savedToken || !savedUser) {
        console.log('❌ No hay token o usuario guardado');
        setIsLoading(false);
        return;
      }

      // Configurar el token en los headers
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      
      // Verificar token con el backend
      console.log('🔄 Verificando token...');
      const response = await apiClient.get('/auth/verify');
      
      if (response.data.valid) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setToken(savedToken);
        console.log('✅ Token válido, usuario:', userData.email);
        
        // Si está en la página de login, redirigir
        const currentPath = window.location.pathname;
        if (currentPath === '/app/login' || currentPath === '/login') {
          const redirectPath = userData.role === 'super_admin' 
            ? '/app/super-admin/tablero' 
            : '/app/menu-cards';
          navigate(redirectPath);
        }
      } else {
        console.log('❌ Token inválido');
        clearAuthData();
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;