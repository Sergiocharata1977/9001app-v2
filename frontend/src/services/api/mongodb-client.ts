// MongoDB API Client
// Cliente API específico para MongoDB Atlas

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  QueryParams,
  PaginationConfig 
} from '../../types/mongodb-types';

export class MongoDBClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request timestamp
        config.metadata = { startTime: new Date() };
        
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const endTime = new Date();
        const startTime = response.config.metadata?.startTime;
        
        if (startTime) {
          const duration = endTime.getTime() - startTime.getTime();
          console.log(`API Request completed in ${duration}ms:`, response.config.url);
        }

        return response;
      },
      (error) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  private handleApiError(error: any): void {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          this.handleUnauthorized();
          break;
        case 403:
          this.handleForbidden();
          break;
        case 404:
          this.handleNotFound();
          break;
        case 422:
          this.handleValidationError(data);
          break;
        case 500:
          this.handleServerError(data);
          break;
        default:
          console.error(`API Error ${status}:`, data);
          this.showErrorNotification(data?.message || 'An error occurred');
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
      this.showErrorNotification('Network error. Please check your connection.');
    } else {
      // Other error
      console.error('Error:', error.message);
      this.showErrorNotification(error.message);
    }
  }

  private handleUnauthorized(): void {
    // Clear auth data and redirect to login
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    window.location.href = '/login';
  }

  private handleForbidden(): void {
    this.showErrorNotification('Access denied. You don\'t have permission to perform this action.');
  }

  private handleNotFound(): void {
    this.showErrorNotification('Resource not found.');
  }

  private handleValidationError(data: any): void {
    const errors = data?.errors || [];
    const message = errors.length > 0 
      ? errors.map((err: any) => err.message).join(', ')
      : 'Validation error occurred.';
    this.showErrorNotification(message);
  }

  private handleServerError(data: any): void {
    this.showErrorNotification('Server error. Please try again later.');
  }

  private showErrorNotification(message: string): void {
    // Use toast notification system
    if (window.showToast) {
      window.showToast(message, 'error');
    } else {
      console.error(message);
    }
  }

  // Generic CRUD methods
  async get<T>(endpoint: string, params?: QueryParams): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPaginated<T>(
    endpoint: string, 
    params?: QueryParams
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.client.get<PaginatedResponse<T>>(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // File upload
  async uploadFile<T>(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.client.post<ApiResponse<T>>(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Batch operations
  async batchCreate<T>(endpoint: string, items: any[]): Promise<ApiResponse<T[]>> {
    try {
      const response = await this.client.post<ApiResponse<T[]>>(`${endpoint}/batch`, { items });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async batchUpdate<T>(endpoint: string, items: any[]): Promise<ApiResponse<T[]>> {
    try {
      const response = await this.client.put<ApiResponse<T[]>>(`${endpoint}/batch`, { items });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async batchDelete<T>(endpoint: string, ids: string[]): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(`${endpoint}/batch`, { 
        data: { ids } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Search and filtering
  async search<T>(endpoint: string, query: string, filters?: Record<string, any>): Promise<PaginatedResponse<T>> {
    const params = {
      search: query,
      ...filters,
    };
    return this.getPaginated<T>(endpoint, params);
  }

  async findByField<T>(endpoint: string, field: string, value: any): Promise<ApiResponse<T>> {
    return this.get<T>(`${endpoint}/field/${field}/${value}`);
  }

  // Caching utilities
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  async getWithCache<T>(
    endpoint: string, 
    ttl: number = 5 * 60 * 1000, // 5 minutes default
    params?: QueryParams
  ): Promise<T> {
    const cacheKey = `${endpoint}?${JSON.stringify(params)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    const response = await this.get<T>(endpoint, params);
    this.cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
      ttl,
    });

    return response.data;
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get raw axios instance for advanced usage
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }

  // Update base URL
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
    this.client.defaults.baseURL = baseURL;
  }
}

// Singleton instance
export const mongodbClient = new MongoDBClient();

// Export for use in other modules
export default mongodbClient;