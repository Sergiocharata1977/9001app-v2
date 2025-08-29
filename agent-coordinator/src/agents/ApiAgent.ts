import { BaseAgent } from '../core/BaseAgent';
import { AgentConfig } from '../types/agent.types';
import * as fs from 'fs';
import * as path from 'path';

export class ApiAgent extends BaseAgent {
  constructor(config: Partial<AgentConfig> = {}) {
    super(
      'api-agent',
      'API Optimization Agent',
      'api',
      {
        maxRetries: 3,
        timeout: 60000,
        autoRestart: true,
        ...config
      }
    );

    this.capabilities = [
      'api-analysis',
      'endpoint-optimization',
      'performance-monitoring',
      'route-validation'
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
   * Ejecutar optimización de APIs
   */
  async run(): Promise<void> {
    this.logger.info('Iniciando optimización de APIs...');
    this.status = 'running';
    this.emit('statusChanged', { agentId: this.id, status: this.status });

    const startTime = Date.now();

    try {
      const results = await this.optimizeApis();
      
      this.metrics.totalExecutions++;
      this.metrics.successfulExecutions++;
      this.metrics.lastExecutionTime = Date.now() - startTime;
      this.metrics.averageExecutionTime = 
        (this.metrics.averageExecutionTime * (this.metrics.totalExecutions - 1) + this.metrics.lastExecutionTime) / 
        this.metrics.totalExecutions;

      this.status = 'completed';
      this.logger.info('Optimización de APIs completada exitosamente');
      
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
      
      this.logger.error('Error en optimización de APIs:', error);
      this.emit('error', { agentId: this.id, error: error.message });
    }

    this.emit('statusChanged', { agentId: this.id, status: this.status });
  }

  /**
   * Optimizar APIs del proyecto
   */
  private async optimizeApis(): Promise<any> {
    const optimizationResults = {
      timestamp: new Date().toISOString(),
      endpoints: [],
      optimizations: [],
      issues: [],
      performance: {},
      recommendations: []
    };

    // 1. Analizar endpoints existentes
    this.logger.info('Analizando endpoints...');
    optimizationResults.endpoints = await this.analyzeEndpoints();

    // 2. Identificar problemas de performance
    this.logger.info('Identificando problemas de performance...');
    const performanceIssues = await this.identifyPerformanceIssues();
    optimizationResults.issues.push(...performanceIssues);

    // 3. Optimizar rutas
    this.logger.info('Optimizando rutas...');
    const routeOptimizations = await this.optimizeRoutes();
    optimizationResults.optimizations.push(...routeOptimizations);

    // 4. Analizar métricas de performance
    optimizationResults.performance = await this.analyzePerformanceMetrics();

    // 5. Generar recomendaciones
    optimizationResults.recommendations = this.generateApiRecommendations(optimizationResults.issues);

    return optimizationResults;
  }

  /**
   * Analizar endpoints del backend
   */
  private async analyzeEndpoints(): Promise<any[]> {
    const endpoints = [];

    try {
      const routesDir = path.join(process.cwd(), 'backend/routes');
      
      if (fs.existsSync(routesDir)) {
        const routeFiles = fs.readdirSync(routesDir).filter(file => 
          file.endsWith('.js') || file.endsWith('.ts')
        );

        for (const file of routeFiles) {
          const filePath = path.join(routesDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Buscar definiciones de rutas
          const routePatterns = [
            /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
            /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g
          ];

          for (const pattern of routePatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
              endpoints.push({
                file: file,
                method: match[1].toUpperCase(),
                path: match[2],
                line: this.getLineNumber(content, match.index),
                hasValidation: this.hasValidation(content, match.index),
                hasAuth: this.hasAuth(content, match.index),
                complexity: this.calculateRouteComplexity(content, match.index)
              });
            }
          }
        }
      }

    } catch (error) {
      this.logger.error('Error analizando endpoints:', error);
    }

    return endpoints;
  }

  /**
   * Identificar problemas de performance
   */
  private async identifyPerformanceIssues(): Promise<any[]> {
    const issues = [];

    try {
      const routesDir = path.join(process.cwd(), 'backend/routes');
      
      if (fs.existsSync(routesDir)) {
        const routeFiles = fs.readdirSync(routesDir).filter(file => 
          file.endsWith('.js') || file.endsWith('.ts')
        );

        for (const file of routeFiles) {
          const filePath = path.join(routesDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Buscar patrones problemáticos
          const problemPatterns = [
            {
              pattern: /await.*\.find\(\)/g,
              issue: 'Query sin límites',
              severity: 'high',
              description: 'Consulta sin paginación puede causar problemas de memoria'
            },
            {
              pattern: /for\s*\(.*\)\s*{[\s\S]*?await/g,
              issue: 'Loop con await',
              severity: 'high',
              description: 'Await dentro de loop puede causar problemas de performance'
            },
            {
              pattern: /\.findById\(.*\)\.populate\(/g,
              issue: 'Populate innecesario',
              severity: 'medium',
              description: 'Populate puede ser costoso, evaluar si es necesario'
            }
          ];

          for (const check of problemPatterns) {
            let match;
            while ((match = check.pattern.exec(content)) !== null) {
              issues.push({
                type: 'performance',
                file: file,
                issue: check.issue,
                severity: check.severity,
                description: check.description,
                line: this.getLineNumber(content, match.index),
                recommendation: this.getPerformanceRecommendation(check.issue)
              });
            }
          }
        }
      }

    } catch (error) {
      this.logger.error('Error identificando problemas de performance:', error);
    }

    return issues;
  }

  /**
   * Optimizar rutas existentes
   */
  private async optimizeRoutes(): Promise<any[]> {
    const optimizations = [];

    try {
      const routesDir = path.join(process.cwd(), 'backend/routes');
      
      if (fs.existsSync(routesDir)) {
        const routeFiles = fs.readdirSync(routesDir).filter(file => 
          file.endsWith('.js') || file.endsWith('.ts')
        );

        for (const file of routeFiles) {
          const filePath = path.join(routesDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Sugerir optimizaciones
          if (!content.includes('express-rate-limit')) {
            optimizations.push({
              type: 'rate-limiting',
              file: file,
              description: 'Agregar rate limiting para prevenir abuso',
              priority: 'medium',
              implementation: 'Instalar y configurar express-rate-limit'
            });
          }

          if (!content.includes('compression')) {
            optimizations.push({
              type: 'compression',
              file: file,
              description: 'Agregar compresión de respuestas',
              priority: 'low',
              implementation: 'Implementar middleware de compresión'
            });
          }

          // Verificar validación de input
          if (content.includes('req.body') && !content.includes('validator')) {
            optimizations.push({
              type: 'validation',
              file: file,
              description: 'Agregar validación de entrada',
              priority: 'high',
              implementation: 'Implementar validación con joi o express-validator'
            });
          }
        }
      }

    } catch (error) {
      this.logger.error('Error optimizando rutas:', error);
    }

    return optimizations;
  }

  /**
   * Analizar métricas de performance
   */
  private async analyzePerformanceMetrics(): Promise<any> {
    const metrics = {
      totalEndpoints: 0,
      endpointsByMethod: {},
      complexityDistribution: {},
      securityScore: 0,
      performanceScore: 0
    };

    try {
      const endpoints = await this.analyzeEndpoints();
      metrics.totalEndpoints = endpoints.length;

      // Distribución por método HTTP
      for (const endpoint of endpoints) {
        metrics.endpointsByMethod[endpoint.method] = 
          (metrics.endpointsByMethod[endpoint.method] || 0) + 1;
      }

      // Distribución de complejidad
      for (const endpoint of endpoints) {
        const complexity = endpoint.complexity || 'low';
        metrics.complexityDistribution[complexity] = 
          (metrics.complexityDistribution[complexity] || 0) + 1;
      }

      // Calcular scores
      metrics.securityScore = this.calculateSecurityScore(endpoints);
      metrics.performanceScore = this.calculatePerformanceScore(endpoints);

    } catch (error) {
      this.logger.error('Error analizando métricas:', error);
    }

    return metrics;
  }

  /**
   * Obtener número de línea de un match
   */
  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Verificar si tiene validación
   */
  private hasValidation(content: string, index: number): boolean {
    const beforeMatch = content.substring(Math.max(0, index - 500), index);
    return /validate|validator|joi|schema/.test(beforeMatch);
  }

  /**
   * Verificar si tiene autenticación
   */
  private hasAuth(content: string, index: number): boolean {
    const beforeMatch = content.substring(Math.max(0, index - 500), index);
    return /auth|authenticate|verifyToken|isAuth/.test(beforeMatch);
  }

  /**
   * Calcular complejidad de ruta
   */
  private calculateRouteComplexity(content: string, index: number): string {
    const routeContent = content.substring(index, index + 1000);
    
    let complexity = 0;
    
    // Contar operaciones de base de datos
    const dbOperations = (routeContent.match(/\.(find|save|update|delete|create)/g) || []).length;
    complexity += dbOperations * 2;
    
    // Contar estructuras de control
    const controlStructures = (routeContent.match(/(if|for|while|switch)/g) || []).length;
    complexity += controlStructures;
    
    // Contar operaciones async
    const asyncOps = (routeContent.match(/await/g) || []).length;
    complexity += asyncOps;

    if (complexity < 5) return 'low';
    if (complexity < 10) return 'medium';
    return 'high';
  }

  /**
   * Obtener recomendación de performance
   */
  private getPerformanceRecommendation(issue: string): string {
    const recommendations = {
      'Query sin límites': 'Implementar paginación con .limit() y .skip()',
      'Loop con await': 'Usar Promise.all() para operaciones paralelas',
      'Populate innecesario': 'Evaluar si el populate es realmente necesario'
    };

    return recommendations[issue] || 'Revisar implementación para optimizar performance';
  }

  /**
   * Calcular score de seguridad
   */
  private calculateSecurityScore(endpoints: any[]): number {
    if (endpoints.length === 0) return 100;

    let score = 0;
    
    for (const endpoint of endpoints) {
      let endpointScore = 100;
      
      if (!endpoint.hasAuth && ['POST', 'PUT', 'DELETE'].includes(endpoint.method)) {
        endpointScore -= 30;
      }
      
      if (!endpoint.hasValidation) {
        endpointScore -= 20;
      }
      
      score += endpointScore;
    }

    return Math.round(score / endpoints.length);
  }

  /**
   * Calcular score de performance
   */
  private calculatePerformanceScore(endpoints: any[]): number {
    if (endpoints.length === 0) return 100;

    let score = 0;
    
    for (const endpoint of endpoints) {
      let endpointScore = 100;
      
      if (endpoint.complexity === 'high') {
        endpointScore -= 20;
      } else if (endpoint.complexity === 'medium') {
        endpointScore -= 10;
      }
      
      score += endpointScore;
    }

    return Math.round(score / endpoints.length);
  }

  /**
   * Generar recomendaciones de API
   */
  private generateApiRecommendations(issues: any[]): string[] {
    const recommendations = [];

    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;

    if (highIssues > 0) {
      recommendations.push('Corregir problemas críticos de performance identificados');
    }

    if (mediumIssues > 0) {
      recommendations.push('Optimizar endpoints con problemas de performance moderados');
    }

    recommendations.push('Implementar rate limiting en todas las rutas públicas');
    recommendations.push('Agregar validación de entrada en todos los endpoints');
    recommendations.push('Implementar logging y monitoreo de APIs');
    recommendations.push('Configurar cache para endpoints de solo lectura');

    return recommendations;
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