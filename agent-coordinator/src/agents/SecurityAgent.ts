import { BaseAgent } from '../core/BaseAgent';
import { AgentConfig } from '../types/agent.types';
import * as fs from 'fs';
import * as path from 'path';

export class SecurityAgent extends BaseAgent {
  constructor(config: Partial<AgentConfig> = {}) {
    super(
      'security-agent',
      'Security Audit Agent',
      'security',
      {
        maxRetries: 3,
        timeout: 60000,
        autoRestart: true,
        ...config
      }
    );

    this.capabilities = [
      'security-audit',
      'vulnerability-scan',
      'dependency-check',
      'code-analysis'
    ];

    this.dependencies = [];
    this.priority = 'high';

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
   * Ejecutar auditoría de seguridad
   */
  async run(): Promise<void> {
    this.logger.info('Iniciando auditoría de seguridad...');
    this.status = 'running';
    this.emit('statusChanged', { agentId: this.id, status: this.status });

    const startTime = Date.now();

    try {
      const results = await this.performSecurityAudit();
      
      this.metrics.totalExecutions++;
      this.metrics.successfulExecutions++;
      this.metrics.lastExecutionTime = Date.now() - startTime;
      this.metrics.averageExecutionTime = 
        (this.metrics.averageExecutionTime * (this.metrics.totalExecutions - 1) + this.metrics.lastExecutionTime) / 
        this.metrics.totalExecutions;

      this.status = 'completed';
      this.logger.info('Auditoría de seguridad completada exitosamente');
      
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
      
      this.logger.error('Error en auditoría de seguridad:', error);
      this.emit('error', { agentId: this.id, error: error.message });
    }

    this.emit('statusChanged', { agentId: this.id, status: this.status });
  }

  /**
   * Realizar auditoría completa de seguridad
   */
  private async performSecurityAudit(): Promise<any> {
    const auditResults = {
      timestamp: new Date().toISOString(),
      vulnerabilities: [],
      recommendations: [],
      score: 0
    };

    // 1. Verificar dependencias con vulnerabilidades conocidas
    this.logger.info('Verificando dependencias...');
    const dependencyIssues = await this.checkDependencies();
    auditResults.vulnerabilities.push(...dependencyIssues);

    // 2. Analizar configuración de seguridad
    this.logger.info('Analizando configuración de seguridad...');
    const configIssues = await this.checkSecurityConfig();
    auditResults.vulnerabilities.push(...configIssues);

    // 3. Verificar archivos sensibles
    this.logger.info('Verificando archivos sensibles...');
    const fileIssues = await this.checkSensitiveFiles();
    auditResults.vulnerabilities.push(...fileIssues);

    // 4. Generar recomendaciones
    auditResults.recommendations = this.generateRecommendations(auditResults.vulnerabilities);

    // 5. Calcular score de seguridad
    auditResults.score = this.calculateSecurityScore(auditResults.vulnerabilities);

    return auditResults;
  }

  /**
   * Verificar dependencias con vulnerabilidades
   */
  private async checkDependencies(): Promise<any[]> {
    const vulnerabilities = [];

    try {
      // Verificar package.json del frontend
      const frontendPackagePath = path.join(process.cwd(), 'frontend', 'package.json');
      if (fs.existsSync(frontendPackagePath)) {
        const packageData = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
        
        // Verificar dependencias conocidas con vulnerabilidades
        const knownVulnerabilities = {
          'react': { minVersion: '18.0.0', severity: 'medium' },
          'axios': { minVersion: '1.0.0', severity: 'high' }
        };

        for (const [dep, info] of Object.entries(knownVulnerabilities)) {
          if (packageData.dependencies && packageData.dependencies[dep]) {
            vulnerabilities.push({
              type: 'dependency',
              package: dep,
              current: packageData.dependencies[dep],
              recommended: info.minVersion,
              severity: info.severity,
              description: `Dependencia ${dep} puede tener vulnerabilidades conocidas`
            });
          }
        }
      }

      // Verificar package.json del backend
      const backendPackagePath = path.join(process.cwd(), 'backend', 'package.json');
      if (fs.existsSync(backendPackagePath)) {
        const packageData = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
        
        const backendVulnerabilities = {
          'express': { minVersion: '4.18.0', severity: 'high' },
          'mongoose': { minVersion: '7.0.0', severity: 'medium' }
        };

        for (const [dep, info] of Object.entries(backendVulnerabilities)) {
          if (packageData.dependencies && packageData.dependencies[dep]) {
            vulnerabilities.push({
              type: 'dependency',
              package: dep,
              current: packageData.dependencies[dep],
              recommended: info.minVersion,
              severity: info.severity,
              description: `Dependencia ${dep} del backend puede tener vulnerabilidades`
            });
          }
        }
      }

    } catch (error) {
      this.logger.error('Error verificando dependencias:', error);
    }

    return vulnerabilities;
  }

  /**
   * Verificar configuración de seguridad
   */
  private async checkSecurityConfig(): Promise<any[]> {
    const issues = [];

    try {
      // Verificar archivos de configuración
      const configFiles = [
        { path: 'backend/.env', name: 'Backend Environment' },
        { path: 'frontend/.env', name: 'Frontend Environment' },
        { path: '.env', name: 'Root Environment' }
      ];

      for (const config of configFiles) {
        const fullPath = path.join(process.cwd(), config.path);
        
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Verificar secrets expuestos
          const patterns = [
            { pattern: /password\s*=\s*["']?[^"'\n\r]{1,8}["']?/i, issue: 'Contraseña débil detectada' },
            { pattern: /jwt.*secret\s*=\s*["']?[^"'\n\r]{1,16}["']?/i, issue: 'JWT Secret débil' },
            { pattern: /api.*key\s*=\s*["']?[^"'\n\r]{1,20}["']?/i, issue: 'API Key posiblemente expuesta' }
          ];

          for (const check of patterns) {
            if (check.pattern.test(content)) {
              issues.push({
                type: 'config',
                file: config.path,
                severity: 'high',
                description: check.issue,
                recommendation: 'Usar secretos más fuertes y no exponerlos en el código'
              });
            }
          }
        }
      }

    } catch (error) {
      this.logger.error('Error verificando configuración:', error);
    }

    return issues;
  }

  /**
   * Verificar archivos sensibles
   */
  private async checkSensitiveFiles(): Promise<any[]> {
    const issues = [];

    try {
      const sensitivePatterns = [
        '.env',
        'config.json',
        'secrets.json',
        'private.key',
        'id_rsa'
      ];

      const checkDir = (dir: string, relativePath = '') => {
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const relativeFilePath = path.join(relativePath, file);
          
          if (fs.statSync(fullPath).isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules') {
              checkDir(fullPath, relativeFilePath);
            }
          } else {
            for (const pattern of sensitivePatterns) {
              if (file.includes(pattern)) {
                issues.push({
                  type: 'sensitive-file',
                  file: relativeFilePath,
                  severity: 'medium',
                  description: `Archivo sensible detectado: ${file}`,
                  recommendation: 'Verificar que esté en .gitignore y no se exponga públicamente'
                });
              }
            }
          }
        }
      };

      checkDir(process.cwd());

    } catch (error) {
      this.logger.error('Error verificando archivos sensibles:', error);
    }

    return issues;
  }

  /**
   * Generar recomendaciones basadas en vulnerabilidades
   */
  private generateRecommendations(vulnerabilities: any[]): string[] {
    const recommendations = [];

    const highSeverity = vulnerabilities.filter(v => v.severity === 'high').length;
    const mediumSeverity = vulnerabilities.filter(v => v.severity === 'medium').length;

    if (highSeverity > 0) {
      recommendations.push('Priorizar la corrección de vulnerabilidades de alta severidad');
    }

    if (mediumSeverity > 0) {
      recommendations.push('Revisar y corregir vulnerabilidades de severidad media');
    }

    recommendations.push('Implementar análisis de seguridad automatizado en CI/CD');
    recommendations.push('Realizar auditorías de seguridad regulares');
    recommendations.push('Mantener dependencias actualizadas');

    return recommendations;
  }

  /**
   * Calcular score de seguridad
   */
  private calculateSecurityScore(vulnerabilities: any[]): number {
    let score = 100;

    for (const vuln of vulnerabilities) {
      switch (vuln.severity) {
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
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