// Departments Service for MongoDB
// Servicio específico para departamentos adaptado a MongoDB Atlas

import { mongodbClient } from './mongodb-client';
import { 
  Department, 
  QueryParams, 
  ApiResponse, 
  PaginatedResponse 
} from '../../types/mongodb-types';

export class DepartmentsService {
  private endpoint = '/departments';

  // Get all departments with pagination
  async getDepartments(params?: QueryParams): Promise<PaginatedResponse<Department>> {
    return mongodbClient.getPaginated<Department>(this.endpoint, params);
  }

  // Get department by ID
  async getDepartment(id: string): Promise<ApiResponse<Department>> {
    return mongodbClient.get<Department>(`${this.endpoint}/${id}`);
  }

  // Create new department
  async createDepartment(department: Partial<Department>): Promise<ApiResponse<Department>> {
    return mongodbClient.post<Department>(this.endpoint, department);
  }

  // Update department
  async updateDepartment(id: string, updates: Partial<Department>): Promise<ApiResponse<Department>> {
    return mongodbClient.put<Department>(`${this.endpoint}/${id}`, updates);
  }

  // Delete department
  async deleteDepartment(id: string): Promise<ApiResponse<void>> {
    return mongodbClient.delete<void>(`${this.endpoint}/${id}`);
  }

  // Get departments by manager
  async getDepartmentsByManager(managerId: string): Promise<ApiResponse<Department[]>> {
    return mongodbClient.get<Department[]>(`${this.endpoint}/manager/${managerId}`);
  }

  // Get department hierarchy
  async getDepartmentHierarchy(): Promise<ApiResponse<Department[]>> {
    return mongodbClient.get<Department[]>(`${this.endpoint}/hierarchy`);
  }

  // Get departments with statistics
  async getDepartmentsWithStats(): Promise<ApiResponse<Department[]>> {
    return mongodbClient.get<Department[]>(`${this.endpoint}/stats`);
  }

  // Search departments
  async searchDepartments(query: string, filters?: Record<string, any>): Promise<PaginatedResponse<Department>> {
    return mongodbClient.search<Department>(this.endpoint, query, filters);
  }

  // Get active departments only
  async getActiveDepartments(): Promise<ApiResponse<Department[]>> {
    return mongodbClient.get<Department[]>(`${this.endpoint}/active`);
  }

  // Bulk operations
  async bulkCreateDepartments(departments: Partial<Department>[]): Promise<ApiResponse<Department[]>> {
    return mongodbClient.batchCreate<Department>(this.endpoint, departments);
  }

  async bulkUpdateDepartments(departments: Department[]): Promise<ApiResponse<Department[]>> {
    return mongodbClient.batchUpdate<Department>(this.endpoint, departments);
  }

  async bulkDeleteDepartments(ids: string[]): Promise<ApiResponse<void>> {
    return mongodbClient.batchDelete<void>(this.endpoint, ids);
  }

  // Department-specific operations
  async getSubDepartments(parentId: string): Promise<ApiResponse<Department[]>> {
    return mongodbClient.get<Department[]>(`${this.endpoint}/${parentId}/subdepartments`);
  }

  async assignManager(departmentId: string, managerId: string): Promise<ApiResponse<Department>> {
    return mongodbClient.patch<Department>(`${this.endpoint}/${departmentId}/manager`, { managerId });
  }

  async updateDepartmentBudget(departmentId: string, budget: number): Promise<ApiResponse<Department>> {
    return mongodbClient.patch<Department>(`${this.endpoint}/${departmentId}/budget`, { budget });
  }

  async deactivateDepartment(departmentId: string): Promise<ApiResponse<Department>> {
    return mongodbClient.patch<Department>(`${this.endpoint}/${departmentId}/deactivate`);
  }

  async reactivateDepartment(departmentId: string): Promise<ApiResponse<Department>> {
    return mongodbClient.patch<Department>(`${this.endpoint}/${departmentId}/reactivate`);
  }

  // Analytics and reporting
  async getDepartmentAnalytics(departmentId: string, dateRange?: { start: Date; end: Date }): Promise<ApiResponse<any>> {
    const params = dateRange ? { startDate: dateRange.start.toISOString(), endDate: dateRange.end.toISOString() } : {};
    return mongodbClient.get<any>(`${this.endpoint}/${departmentId}/analytics`, params);
  }

  async getDepartmentsReport(filters?: Record<string, any>): Promise<ApiResponse<any>> {
    return mongodbClient.get<any>(`${this.endpoint}/report`, filters);
  }

  // Export functionality
  async exportDepartments(format: 'csv' | 'excel' | 'pdf', filters?: Record<string, any>): Promise<Blob> {
    const response = await mongodbClient.getAxiosInstance().get(`${this.endpoint}/export/${format}`, {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }

  // Import functionality
  async importDepartments(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<Department[]>> {
    return mongodbClient.uploadFile<Department[]>(`${this.endpoint}/import`, file, onProgress);
  }

  // Validation
  async validateDepartmentCode(code: string, excludeId?: string): Promise<ApiResponse<{ available: boolean }>> {
    const params = excludeId ? { code, excludeId } : { code };
    return mongodbClient.get<{ available: boolean }>(`${this.endpoint}/validate/code`, params);
  }

  async validateDepartmentName(name: string, excludeId?: string): Promise<ApiResponse<{ available: boolean }>> {
    const params = excludeId ? { name, excludeId } : { name };
    return mongodbClient.get<{ available: boolean }>(`${this.endpoint}/validate/name`, params);
  }
}

// Singleton instance
export const departmentsService = new DepartmentsService();

// Export for use in other modules
export default departmentsService;