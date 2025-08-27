import { jwtDecode } from 'jwt-decode';
import { createApiClient } from './apiService.js';

const authApiClient = createApiClient('/auth');
const usersApiClient = createApiClient('/usuarios');

// MongoDB
export const authService = {
  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Object} Datos del usuario autenticado
   */
  async login(email, password) {
    try {
      console.log('Intentando login con endpoint /auth/login');
      
      // Usar email y password directamente como espera el backend
      const response = await authApiClient.post('/login', { 
        email, 
        password 
      });
      
      console.log('Respuesta del servidor:', response);
      
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }
      
      // La respuesta del backend es: { message, accessToken, refreshToken, user }
      if (!response.accessToken || !response.user) {
        throw new Error('Respuesta del servidor incompleta');
      }
      
      // Guardar información del usuario en localStorage
      const userData = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        organization_id: response.user.organization_id,
        token: response.accessToken,
        refreshToken: response.refreshToken
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Login exitoso con endpoint /auth/login');
      
      return userData;
    } catch (error) {
      console.error('Error al usar nuevo endpoint de autenticación:', error);
      console.log('Intentando login con endpoint original /usuarios/login como fallback');
      
      try {
        // Fallback: intentar con el endpoint original
        const response = await usersApiClient.post('/login', { username: email, password });
        
        if (!response || !response.token) {
          throw new Error('Error al iniciar sesión');
        }
        
        // Guardar información del usuario en localStorage
        const userData = {
          id: response.id,
          name: response.nombre || response.name,
          email: response.email,
          role: response.role || response.rol || 'user',
          token: response.token
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Login exitoso con endpoint original como fallback');
        
        return userData;
      } catch (fallbackError) {
        console.error('Error en ambos métodos de login:', fallbackError);
        throw new Error('Error al iniciar sesión. Verifique sus credenciales.');
      }
    }
  },

  /**
   * Registra un nuevo usuario y organización
   * @param {string} organizationName - Nombre de la organización
   * @param {string} userName - Nombre del usuario
   * @param {string} userEmail - Email del usuario
   * @param {string} userPassword - Contraseña del usuario
   * @returns {Object} Datos del usuario registrado
   */
  async register(organizationName, userName, userEmail, userPassword) {
    try {
      console.log('Intentando registro con endpoint /auth/register');
      
      // Llamar al endpoint de registro en el backend
      const response = await authApiClient.post('/register', {
        organizationName,
        userName,
        userEmail,
        userPassword
      });
      
      console.log('Respuesta del registro:', response);
      
      if (!response || !response.user) {
        throw new Error('Error al registrar el usuario');
      }
      
      // Si el registro es exitoso y devuelve un token, iniciar sesión automáticamente
      if (response.accessToken) {
        const userData = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          organization_id: response.user.organization_id,
          token: response.accessToken,
          refreshToken: response.refreshToken
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Registro exitoso y login automático');
        return userData;
      }
      
      return {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        organization_id: response.user.organization_id
      };
    } catch (error) {
      console.error('Error con endpoint de registro:', error);
      throw new Error('Error al registrar el usuario. Verifique los datos.');
    }
  },

  /**
   * Cierra la sesión del usuario actual
   */
  async logout() {
    try {
      const user = this.getCurrentUser();
      if (user && user.token) {
        // No es necesario llamar a un endpoint de logout en el backend con JWT
        // ya que la sesión se maneja por token en el cliente
        console.log('Cerrando sesión de usuario:', user.email || user.name);
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Eliminar datos locales
      localStorage.removeItem('user');
    }
  },

  /**
   * Obtiene el usuario actual desde localStorage
   * @returns {Object|null} Usuario actual o null si no hay sesión
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      
      // Verificar si el token podría estar expirado (sin decodificarlo realmente)
      // Para una implementación completa, debería decodificar y verificar la expiración
      if (!user.token) {
        localStorage.removeItem('user');
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      localStorage.removeItem('user'); // Limpiar en caso de error
      return null;
    }
  },

  /**
   * Actualiza el perfil del usuario
   * @param {Object} userData - Nuevos datos del usuario
   * @returns {Object} Datos actualizados
   */
  async updateProfile(userData) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) throw new Error('No hay una sesión activa');
      
      console.log('Actualizando perfil con nuevo endpoint /api/auth/perfil');
      
      // Llamar al endpoint de actualización de perfil en el nuevo backend
      const response = await authApiClient.put('/perfil', {
        nombre: userData.nombre || currentUser.name,
        apellido: userData.apellido || '',
        email: userData.email || currentUser.email
      });
      
      if (!response || !response.usuario) {
        throw new Error('Error al actualizar el perfil');
      }
      
      const newUserData = {
        ...currentUser,
        name: response.usuario.nombre,
        email: response.usuario.email,
        role: response.usuario.rol || currentUser.role
      };
      
      // Actualizar localStorage
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      return newUserData;
    } catch (error) {
      console.error('Error con nuevo endpoint de perfil:', error);
      console.log('Intentando actualizar perfil con endpoint original como fallback');
      
      try {
        const currentUser = this.getCurrentUser();
        if (!currentUser) throw new Error('No hay una sesión activa');
        
        // Llamar al endpoint de actualización de perfil en el backend original
        const response = await usersApiClient.put(`/profile/${currentUser.id}`, {
          nombre: userData.nombre || currentUser.name,
          role: userData.role || currentUser.role
        });
        
        if (!response.data) throw new Error('Error al actualizar el perfil');
        
        const newUserData = {
          ...currentUser,
          name: response.data.nombre || response.data.name,
          role: response.data.role
        };
        
        // Actualizar localStorage
        localStorage.setItem('user', JSON.stringify(newUserData));
        
        return newUserData;
      } catch (fallbackError) {
        console.error('Error en ambos métodos de actualizar perfil:', fallbackError);
        throw new Error('Error al actualizar el perfil. Inténtelo de nuevo.');
      }
    }
  },

  /**
   * Cambiar la contraseña del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Mensaje de éxito
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) throw new Error('No hay una sesión activa');
      
      console.log('Cambiando contraseña con nuevo endpoint /api/auth/cambiar-password');
      
      // Llamar al endpoint de cambio de contraseña
      const response = await authApiClient.post('/cambiar-password', {
        currentPassword,
        newPassword
      });
      
      return response;
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      throw new Error(error.message || 'Error al cambiar la contraseña');
    }
  },

  /**
   * Registra una actividad del usuario (función de compatibilidad)
   * @deprecated Esta función es legado y no será soportada en el futuro
   */
  async logUserActivity(userId, tipo, descripcion) {
    console.log('Registro de actividad:', { userId, tipo, descripcion });
    // No hacemos nada realmente, solo por compatibilidad
  }
};

// Exportación por defecto para compatibilidad con imports existentes
export default authService;
