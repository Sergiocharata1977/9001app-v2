import { BaseAgent } from '../core/BaseAgent';
import { AgentConfig } from '../types/agent.types';
import * as fs from 'fs';
import * as path from 'path';

export class StructureAgent extends BaseAgent {
  constructor(config: Partial<AgentConfig> = {}) {
    super(
      'structure-agent',
      'Project Structure Agent',
      'structure',
      {
        maxRetries: 3,
        timeout: 45000,
        autoRestart: true,
        ...config
      }
    );

    this.capabilities = [
      'structure-analysis',
      'code-organization',
      'file-management',
      'architecture-review'
    ];

    this.dependencies = [];
    this.priority = 'medium';

    // Inicializar métricas
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    };

    // Inicializar health
    this.health = {
      isHealthy: true,
      lastCheck: new Date().toISOString(),
      uptime: 0,
      errorCount: 0,
      successRate: 100,
      responseTime: 0
    };
  }

  /**
   * Ejecutar análisis de estructura
   */
  async run(): Promise<void> {
    this.logger.info('Iniciando análisis de estructura del proyecto...');
    this.status = 'running';
    this.emit('statusChanged', { agentId: this.id, status: this.status });

    const startTime = Date.now();

    try {
      const results = await this.analyzeProjectStructure();
      
      this.metrics.totalExecutions++;
      this.metrics.successfulExecutions++;
      this.metrics.lastExecutionTime = Date.now() - startTime;
      this.metrics.averageExecutionTime = 
        (this.metrics.averageExecutionTime * (this.metrics.totalExecutions - 1) + this.metrics.lastExecutionTime) / 
        this.metrics.totalExecutions;

      this.status = 'completed';
      this.logger.info('Análisis de estructura completado exitosamente');
      
      this.emit('completed', { 
        agentId: this.id, 
        results,
        duration: this.metrics.lastExecutionTime 
      });

    } catch (error) {
      this.metrics.totalExecutions++;
      this.metrics.failedExecutions++;
      this.health.errorCount++;
      this.status = 'failed';
      
      this.logger.error('Error en análisis de estructura:', error);
      this.emit('error', { agentId: this.id, error: error.message });
    }

    this.emit('statusChanged', { agentId: this.id, status: this.status });
  }

  /**
   * Analizar estructura completa del proyecto
   */
  private async analyzeProjectStructure(): Promise<any> {
    const analysisResults = {
      timestamp: new Date().toISOString(),
      projectOverview: {},
      recommendations: [],
      issues: [],
      metrics: {},
      structureScore: 0
    };

    // 1. Analizar estructura general
    this.logger.info('Analizando estructura general...');
    analysisResults.projectOverview = await this.getProjectOverview();

    // 2. Verificar organización de archivos
    this.logger.info('Verificando organización de archivos...');
    const organizationIssues = await this.checkFileOrganization();
    analysisResults.issues.push(...organizationIssues);

    // 3. Analizar arquitectura de componentes
    this.logger.info('Analizando arquitectura de componentes...');
    const architectureAnalysis = await this.analyzeArchitecture();
    analysisResults.metrics = architectureAnalysis;

    // 4. Generar recomendaciones
    analysisResults.recommendations = this.generateStructureRecommendations(analysisResults.issues);

    // 5. Calcular score de estructura
    analysisResults.structureScore = this.calculateStructureScore(analysisResults.issues);

    return analysisResults;
  }

  /**
   * Obtener overview general del proyecto
   */
  private async getProjectOverview(): Promise<any> {
    const overview = {
      totalFiles: 0,
      totalDirectories: 0,
      fileTypes: {},
      largestFiles: [],
      codeDistribution: {}
    };

    try {
      const analyzeDirectory = (dir: string, relativePath = '') => {
        if (!fs.existsSync(dir)) return;

        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const relativeItemPath = path.join(relativePath, item);
          
          if (fs.statSync(fullPath).isDirectory()) {
            if (!item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
              overview.totalDirectories++;
              analyzeDirectory(fullPath, relativeItemPath);
            }
          } else {
            overview.totalFiles++;
            
            const ext = path.extname(item);
            overview.fileTypes[ext] = (overview.fileTypes[ext] || 0) + 1;
            
            const stats = fs.statSync(fullPath);
            if (stats.size > 100000) { // Archivos > 100KB
              overview.largestFiles.push({
                file: relativeItemPath,
                size: stats.size,
                sizeKB: Math.round(stats.size / 1024)
              });
            }
          }
        }
      };

      analyzeDirectory(process.cwd());

      // Ordenar archivos más grandes
      overview.largestFiles.sort((a, b) => b.size - a.size);
      overview.largestFiles = overview.largestFiles.slice(0, 10);

      // Calcular distribución de código
      const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.py', '.java'];
      for (const ext of codeExtensions) {
        if (overview.fileTypes[ext]) {
          overview.codeDistribution[ext] = overview.fileTypes[ext];
        }
      }

    } catch (error) {
      this.logger.error('Error en overview del proyecto:', error);
    }

    return overview;
  }

  /**
   * Verificar organización de archivos
   */
  private async checkFileOrganization(): Promise<any[]> {
    const issues = [];

    try {
      // Verificar estructura estándar de React
      const expectedDirectories = [
        { path: 'frontend/src/components', required: true, description: 'Directorio de componentes' },
        { path: 'frontend/src/pages', required: true, description: 'Directorio de páginas' },
        { path: 'frontend/src/services', required: true, description: 'Directorio de servicios' },
        { path: 'frontend/src/hooks', required: false, description: 'Directorio de hooks personalizados' },
        { path: 'frontend/src/utils', required: false, description: 'Directorio de utilidades' },
        { path: 'backend/routes', required: true, description: 'Directorio de rutas del backend' },
        { path: 'backend/models', required: true, description: 'Directorio de modelos' },
        { path: 'backend/middleware', required: false, description: 'Directorio de middleware' }
      ];

      for (const dir of expectedDirectories) {
        const fullPath = path.join(process.cwd(), dir.path);
        
        if (!fs.existsSync(fullPath)) {
          if (dir.required) {
            issues.push({
              type: 'missing-directory',
              path: dir.path,
              severity: 'high',
              description: `Directorio requerido faltante: ${dir.description}`,
              recommendation: `Crear directorio ${dir.path} para mejor organización`
            });
          } else {
            issues.push({
              type: 'optional-directory',
              path: dir.path,
              severity: 'low',
              description: `Directorio opcional ausente: ${dir.description}`,
              recommendation: `Considerar crear ${dir.path} para mejor organización`
            });
          }
        }
      }

      // Verificar archivos en ubicaciones incorrectas
      const checkMisplacedFiles = (dir: string, allowedExtensions: string[], relativePath = '') => {
        if (!fs.existsSync(dir)) return;

        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const relativeItemPath = path.join(relativePath, item);
          
          if (fs.statSync(fullPath).isFile()) {
            const ext = path.extname(item);
            
            if (!allowedExtensions.includes(ext) && !item.startsWith('.')) {
              issues.push({
                type: 'misplaced-file',
                file: relativeItemPath,
                severity: 'medium',
                description: `Archivo ${item} en ubicación posiblemente incorrecta`,
                recommendation: `Mover ${item} a un directorio más apropiado`
              });
            }
          }
        }
      };

      // Verificar componentes en ubicación correcta
      const componentsDir = path.join(process.cwd(), 'frontend/src/components');
      if (fs.existsSync(componentsDir)) {
        checkMisplacedFiles(componentsDir, ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss'], 'frontend/src/components');
      }

    } catch (error) {
      this.logger.error('Error verificando organización:', error);
    }

    return issues;
  }

  /**
   * Analizar arquitectura del proyecto
   */
  private async analyzeArchitecture(): Promise<any> {
    const architecture = {
      componentCount: 0,
      pageCount: 0,
      serviceCount: 0,
      complexityMetrics: {},
      dependencies: {}
    };

    try {
      // Contar componentes
      const componentsDir = path.join(process.cwd(), 'frontend/src/components');
      if (fs.existsSync(componentsDir)) {
        architecture.componentCount = this.countFilesRecursive(componentsDir, ['.tsx', '.jsx']);
      }

      // Contar páginas
      const pagesDir = path.join(process.cwd(), 'frontend/src/pages');
      if (fs.existsSync(pagesDir)) {
        architecture.pageCount = this.countFilesRecursive(pagesDir, ['.tsx', '.jsx']);
      }

      // Contar servicios
      const servicesDir = path.join(process.cwd(), 'frontend/src/services');
      if (fs.existsSync(servicesDir)) {
        architecture.serviceCount = this.countFilesRecursive(servicesDir, ['.ts', '.js']);
      }

      // Métricas de complejidad básicas
      architecture.complexityMetrics = {
        averageComponentSize: this.getAverageFileSize(componentsDir, ['.tsx', '.jsx']),
        averagePageSize: this.getAverageFileSize(pagesDir, ['.tsx', '.jsx']),
        totalLinesOfCode: this.getTotalLinesOfCode()
      };

    } catch (error) {
      this.logger.error('Error analizando arquitectura:', error);
    }

    return architecture;
  }

  /**
   * Contar archivos recursivamente
   */
  private countFilesRecursive(dir: string, extensions: string[]): number {
    if (!fs.existsSync(dir)) return 0;

    let count = 0;
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        count += this.countFilesRecursive(fullPath, extensions);
      } else {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Obtener tamaño promedio de archivos
   */
  private getAverageFileSize(dir: string, extensions: string[]): number {
    if (!fs.existsSync(dir)) return 0;

    let totalSize = 0;
    let fileCount = 0;

    const calculateSize = (currentDir: string) => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        
        if (fs.statSync(fullPath).isDirectory()) {
          calculateSize(fullPath);
        } else {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            totalSize += fs.statSync(fullPath).size;
            fileCount++;
          }
        }
      }
    };

    calculateSize(dir);
    return fileCount > 0 ? Math.round(totalSize / fileCount) : 0;
  }

  /**
   * Obtener total de líneas de código
   */
  private getTotalLinesOfCode(): number {
    // Implementación simplificada
    return 0; // Placeholder
  }

  /**
   * Generar recomendaciones de estructura
   */
  private generateStructureRecommendations(issues: any[]): string[] {
    const recommendations = [];

    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;

    if (highIssues > 0) {
      recommendations.push('Corregir problemas críticos de estructura identificados');
    }

    if (mediumIssues > 0) {
      recommendations.push('Revisar y mejorar organización de archivos');
    }

    recommendations.push('Implementar convenciones de naming consistentes');
    recommendations.push('Crear documentación de arquitectura');
    recommendations.push('Establecer guidelines para organización de código');

    return recommendations;
  }

  /**
   * Calcular score de estructura
   */
  private calculateStructureScore(issues: any[]): number {
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Obtener estado del agente
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      health: this.health,
      metrics: this.metrics,
      capabilities: this.capabilities
    };
  }
}