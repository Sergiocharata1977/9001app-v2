import { apiService } from './apiService';

export interface PlanData {
  _id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_annual?: number;
  max_users?: number;
  max_departments?: number;
  features?: string[];
  is_active?: boolean;
  created_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
  source?: string;
  original_error?: string;
}

export const testConnectionService = {
  // Probar conexión básica con el backend
  async testBackendConnection(): Promise<{ status: string; message: string }> {
    try {
      const response = await apiService.get<{ message: string }>('/test');
      return {
        status: 'success',
        message: response.data.message
      };
    } catch (error) {
      return {
        status: 'error', 
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  },

  // Probar endpoint de health del backend
  async testHealthEndpoint(): Promise<any> {
    try {
      const response = await apiService.get('/health');
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  },

  // Obtener planes desde el backend (con datos mock si MongoDB no está disponible)
  async getPlanes(): Promise<ApiResponse<PlanData[]>> {
    try {
      const response = await apiService.get<ApiResponse<PlanData[]>>('/test-mongo/planes');
      return response.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error obteniendo planes');
    }
  },

  // Probar múltiples endpoints para diagnóstico completo
  async runFullDiagnostic(): Promise<{
    backend: any;
    health: any;
    plans: any;
    summary: {
      total_tests: number;
      passed: number;
      failed: number;
      success_rate: number;
    };
  }> {
    const results = {
      backend: null as any,
      health: null as any, 
      plans: null as any,
      summary: {
        total_tests: 3,
        passed: 0,
        failed: 0,
        success_rate: 0
      }
    };

    // Test 1: Conexión básica al backend
    try {
      results.backend = await this.testBackendConnection();
      if (results.backend.status === 'success') results.summary.passed++;
      else results.summary.failed++;
    } catch (error) {
      results.backend = { status: 'error', message: 'Error en test de conexión' };
      results.summary.failed++;
    }

    // Test 2: Health endpoint
    try {
      results.health = await this.testHealthEndpoint();
      if (results.health.status === 'success') results.summary.passed++;
      else results.summary.failed++;
    } catch (error) {
      results.health = { status: 'error', message: 'Error en health endpoint' };
      results.summary.failed++;
    }

    // Test 3: Obtener planes
    try {
      results.plans = await this.getPlanes();
      if (results.plans.success) results.summary.passed++;
      else results.summary.failed++;
    } catch (error) {
      results.plans = { success: false, message: 'Error obteniendo planes' };
      results.summary.failed++;
    }

    results.summary.success_rate = (results.summary.passed / results.summary.total_tests) * 100;

    return results;
  }
};