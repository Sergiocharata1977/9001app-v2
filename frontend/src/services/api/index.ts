import axios from 'axios';

/**
 * Obtener la URL base de la API desde la configuración dinámica o variables de entorno
 */
const getApiBaseUrl = () => {
  // Primero intentar con la configuración dinámica (runtime)
  if (window.__RUNTIME_CONFIG__ && window.__RUNTIME_CONFIG__.API_BASE_URL) {
    return window.__RUNTIME_CONFIG__.API_BASE_URL;
  }
  // Fallback a variables de entorno de Vite (para desarrollo)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Valor por defecto
  return 'http://localhost:5000/api';
};

/**
 * Cliente API centralizado con interceptores
 */
export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔑 Interceptor - Token en localStorage:', token ? 'Presente' : 'Ausente');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Interceptor - Token agregado al header:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ Interceptor - No hay token en localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirigir a la ruta correcta de login
      window.location.href = '/app/login';
    }
    return Promise.reject(error);
  }
); 