// Personnel Service for MongoDB
// Servicio específico para personal adaptado a MongoDB Atlas

import { mongodbClient } from './mongodb-client';
import { 
  Personnel, 
  QueryParams, 
  ApiResponse, 
  PaginatedResponse,
  Skill,
  Certification,
  Evaluation 
} from '../../types/mongodb-types';

export class PersonnelService {
  private endpoint = '/personnel';

  // Get all personnel with pagination
  async getPersonnel(params?: QueryParams): Promise<PaginatedResponse<Personnel>> {
    return mongodbClient.getPaginated<Personnel>(this.endpoint, params);
  }

  // Get personnel by ID
  async getPersonnelById(id: string): Promise<ApiResponse<Personnel>> {
    return mongodbClient.get<Personnel>(`${this.endpoint}/${id}`);
  }

  // Get personnel by employee ID
  async getPersonnelByEmployeeId(employeeId: string): Promise<ApiResponse<Personnel>> {
    return mongodbClient.get<Personnel>(`${this.endpoint}/employee/${employeeId}`);
  }

  // Create new personnel
  async createPersonnel(personnel: Partial<Personnel>): Promise<ApiResponse<Personnel>> {
    return mongodbClient.post<Personnel>(this.endpoint, personnel);
  }

  // Update personnel
  async updatePersonnel(id: string, updates: Partial<Personnel>): Promise<ApiResponse<Personnel>> {
    return mongodbClient.put<Personnel>(`${this.endpoint}/${id}`, updates);
  }

  // Delete personnel
  async deletePersonnel(id: string): Promise<ApiResponse<void>> {
    return mongodbClient.delete<void>(`${this.endpoint}/${id}`);
  }

  // Get personnel by department
  async getPersonnelByDepartment(departmentId: string): Promise<ApiResponse<Personnel[]>> {
    return mongodbClient.get<Personnel[]>(`${this.endpoint}/department/${departmentId}`);
  }

  // Get personnel by position
  async getPersonnelByPosition(positionId: string): Promise<ApiResponse<Personnel[]>> {
    return mongodbClient.get<Personnel[]>(`${this.endpoint}/position/${positionId}`);
  }

  // Get personnel by status
  async getPersonnelByStatus(status: string): Promise<ApiResponse<Personnel[]>> {
    return mongodbClient.get<Personnel[]>(`${this.endpoint}/status/${status}`);
  }

  // Get active personnel only
  async getActivePersonnel(): Promise<ApiResponse<Personnel[]>> {
    return mongodbClient.get<Personnel[]>(`${this.endpoint}/active`);
  }

  // Search personnel
  async searchPersonnel(query: string, filters?: Record<string, any>): Promise<PaginatedResponse<Personnel>> {
    return mongodbClient.search<Personnel>(this.endpoint, query, filters);
  }

  // Bulk operations
  async bulkCreatePersonnel(personnelList: Partial<Personnel>[]): Promise<ApiResponse<Personnel[]>> {
    return mongodbClient.batchCreate<Personnel>(this.endpoint, personnelList);
  }

  async bulkUpdatePersonnel(personnelList: Personnel[]): Promise<ApiResponse<Personnel[]>> {
    return mongodbClient.batchUpdate<Personnel>(this.endpoint, personnelList);
  }

  async bulkDeletePersonnel(ids: string[]): Promise<ApiResponse<void>> {
    return mongodbClient.batchDelete<void>(this.endpoint, ids);
  }

  // Personnel-specific operations
  async updatePersonnelStatus(id: string, status: string): Promise<ApiResponse<Personnel>> {
    return mongodbClient.patch<Personnel>(`${this.endpoint}/${id}/status`, { status });
  }

  async updatePersonnelPosition(id: string, positionId: string): Promise<ApiResponse<Personnel>> {
    return mongodbClient.patch<Personnel>(`${this.endpoint}/${id}/position`, { positionId });
  }

  async updatePersonnelDepartment(id: string, departmentId: string): Promise<ApiResponse<Personnel>> {
    return mongodbClient.patch<Personnel>(`${this.endpoint}/${id}/department`, { departmentId });
  }

  async terminatePersonnel(id: string, terminationDate: Date, reason: string): Promise<ApiResponse<Personnel>> {
    return mongodbClient.patch<Personnel>(`${this.endpoint}/${id}/terminate`, { 
      terminationDate, 
      reason 
    });
  }

  async reactivatePersonnel(id: string): Promise<ApiResponse<Personnel>> {
    return mongodbClient.patch<Personnel>(`${this.endpoint}/${id}/reactivate`);
  }

  // Skills management
  async addSkill(personnelId: string, skill: Skill): Promise<ApiResponse<Personnel>> {
    return mongodbClient.post<Personnel>(`${this.endpoint}/${personnelId}/skills`, skill);
  }

  async updateSkill(personnelId: string, skillId: string, updates: Partial<Skill>): Promise<ApiResponse<Personnel>> {
    return mongodbClient.put<Personnel>(`${this.endpoint}/${personnelId}/skills/${skillId}`, updates);
  }

  async removeSkill(personnelId: string, skillId: string): Promise<ApiResponse<Personnel>> {
    return mongodbClient.delete<Personnel>(`${this.endpoint}/${personnelId}/skills/${skillId}`);
  }

  async getPersonnelSkills(personnelId: string): Promise<ApiResponse<Skill[]>> {
    return mongodbClient.get<Skill[]>(`${this.endpoint}/${personnelId}/skills`);
  }

  // Certifications management
  async addCertification(personnelId: string, certification: Certification): Promise<ApiResponse<Personnel>> {
    return mongodbClient.post<Personnel>(`${this.endpoint}/${personnelId}/certifications`, certification);
  }

  async updateCertification(personnelId: string, certId: string, updates: Partial<Certification>): Promise<ApiResponse<Personnel>> {
    return mongodbClient.put<Personnel>(`${this.endpoint}/${personnelId}/certifications/${certId}`, updates);
  }

  async removeCertification(personnelId: string, certId: string): Promise<ApiResponse<Personnel>> {
    return mongodbClient.delete<Personnel>(`${this.endpoint}/${personnelId}/certifications/${certId}`);
  }

  async getPersonnelCertifications(personnelId: string): Promise<ApiResponse<Certification[]>> {
    return mongodbClient.get<Certification[]>(`${this.endpoint}/${personnelId}/certifications`);
  }

  // Evaluations management
  async addEvaluation(personnelId: string, evaluation: Evaluation): Promise<ApiResponse<Personnel>> {
    return mongodbClient.post<Personnel>(`${this.endpoint}/${personnelId}/evaluations`, evaluation);
  }

  async getPersonnelEvaluations(personnelId: string): Promise<ApiResponse<Evaluation[]>> {
    return mongodbClient.get<Evaluation[]>(`${this.endpoint}/${personnelId}/evaluations`);
  }

  async getEvaluationHistory(personnelId: string): Promise<ApiResponse<Evaluation[]>> {
    return mongodbClient.get<Evaluation[]>(`${this.endpoint}/${personnelId}/evaluations/history`);
  }

  // Analytics and reporting
  async getPersonnelAnalytics(dateRange?: { start: Date; end: Date }): Promise<ApiResponse<any>> {
    const params = dateRange ? { 
      startDate: dateRange.start.toISOString(), 
      endDate: dateRange.end.toISOString() 
    } : {};
    return mongodbClient.get<any>(`${this.endpoint}/analytics`, params);
  }

  async getDepartmentPersonnelStats(departmentId: string): Promise<ApiResponse<any>> {
    return mongodbClient.get<any>(`${this.endpoint}/department/${departmentId}/stats`);
  }

  async getPersonnelReport(filters?: Record<string, any>): Promise<ApiResponse<any>> {
    return mongodbClient.get<any>(`${this.endpoint}/report`, filters);
  }

  async getPersonnelTurnoverReport(dateRange?: { start: Date; end: Date }): Promise<ApiResponse<any>> {
    const params = dateRange ? { 
      startDate: dateRange.start.toISOString(), 
      endDate: dateRange.end.toISOString() 
    } : {};
    return mongodbClient.get<any>(`${this.endpoint}/report/turnover`, params);
  }

  // Export functionality
  async exportPersonnel(format: 'csv' | 'excel' | 'pdf', filters?: Record<string, any>): Promise<Blob> {
    const response = await mongodbClient.getAxiosInstance().get(`${this.endpoint}/export/${format}`, {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }

  // Import functionality
  async importPersonnel(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<Personnel[]>> {
    return mongodbClient.uploadFile<Personnel[]>(`${this.endpoint}/import`, file, onProgress);
  }

  // Validation
  async validateEmployeeId(employeeId: string, excludeId?: string): Promise<ApiResponse<{ available: boolean }>> {
    const params = excludeId ? { employeeId, excludeId } : { employeeId };
    return mongodbClient.get<{ available: boolean }>(`${this.endpoint}/validate/employee-id`, params);
  }

  async validateEmail(email: string, excludeId?: string): Promise<ApiResponse<{ available: boolean }>> {
    const params = excludeId ? { email, excludeId } : { email };
    return mongodbClient.get<{ available: boolean }>(`${this.endpoint}/validate/email`, params);
  }

  // Advanced searches
  async getPersonnelBySkill(skillName: string): Promise<ApiResponse<Personnel[]>> {
    return mongodbClient.get<Personnel[]>(`${this.endpoint}/skill/${encodeURIComponent(skillName)}`);
  }

  async getPersonnelByCertification(certificationName: string): Promise<ApiResponse<Personnel[]>> {
    return mongodbClient.get<Personnel[]>(`${this.endpoint}/certification/${encodeURIComponent(certificationName)}`);
  }

  async getPersonnelByHireDateRange(startDate: Date, endDate: Date): Promise<ApiResponse<Personnel[]>> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    return mongodbClient.get<Personnel[]>(`${this.endpoint}/hired-between`, params);
  }

  // Organizational chart
  async getOrganizationalChart(): Promise<ApiResponse<any>> {
    return mongodbClient.get<any>(`${this.endpoint}/org-chart`);
  }

  async getDepartmentChart(departmentId: string): Promise<ApiResponse<any>> {
    return mongodbClient.get<any>(`${this.endpoint}/department/${departmentId}/chart`);
  }
}

// Singleton instance
export const personnelService = new PersonnelService();

// Export for use in other modules
export default personnelService;