import { ObjectId } from 'mongodb';
import databaseManager from '../config/database';
import AIAgentService, { AgentType } from '../services/ai-agents';
import RAGService from '../services/rag-service';
import { Organization, User, AIAgent } from '../types';
import logger from '../utils/logger';

async function seedDatabase() {
  try {
    logger.info('🌱 Iniciando seed de la base de datos...');

    const mainDb = databaseManager.getMainDatabase();

    // ============================================================================
    // CREAR ORGANIZACIONES DE EJEMPLO
    // ============================================================================

    const organizations: Organization[] = [
      {
        _id: new ObjectId(),
        name: 'TechCorp Solutions',
        slug: 'techcorp-solutions',
        settings: {
          timezone: 'America/Mexico_City',
          locale: 'es-MX',
          features: ['ai_agents', 'rag', 'process_automation', 'analytics'],
          ai_enabled: true,
          theme: {
            primary_color: '#3B82F6',
            secondary_color: '#1E40AF',
            logo_url: 'https://example.com/logo-techcorp.png'
          }
        },
        limits: {
          users: 50,
          storage: 1000000000, // 1GB
          ai_requests: 1000,
          processes: 100
        },
        status: 'active',
        subscription: {
          plan: 'enterprise',
          start_date: new Date(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
          features: ['ai_agents', 'rag', 'process_automation', 'analytics', 'support']
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: new ObjectId(),
        name: 'QualityFirst Manufacturing',
        slug: 'qualityfirst-manufacturing',
        settings: {
          timezone: 'America/Mexico_City',
          locale: 'es-MX',
          features: ['ai_agents', 'rag', 'process_automation'],
          ai_enabled: true,
          theme: {
            primary_color: '#10B981',
            secondary_color: '#059669',
            logo_url: 'https://example.com/logo-qualityfirst.png'
          }
        },
        limits: {
          users: 25,
          storage: 500000000, // 500MB
          ai_requests: 500,
          processes: 50
        },
        status: 'active',
        subscription: {
          plan: 'professional',
          start_date: new Date(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          features: ['ai_agents', 'rag', 'process_automation']
        },
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insertar organizaciones
    for (const org of organizations) {
      await mainDb.collection('organizations').insertOne(org);
      logger.info(`✅ Organización creada: ${org.name}`);
    }

    // ============================================================================
    // CREAR USUARIOS DE EJEMPLO
    // ============================================================================

    const users: User[] = [
      {
        _id: new ObjectId(),
        organization_id: organizations[0]._id,
        email: 'admin@techcorp.com',
        name: 'Admin TechCorp',
        role: 'OrgAdmin',
        permissions: [
          'org:*',
          'process:*',
          'user:*',
          'ai:*',
          'rag:*',
          'analytics:*'
        ],
        preferences: {
          theme: 'light',
          language: 'es',
          notifications: {
            email: true,
            push: true,
            slack: false
          },
          dashboard_layout: {}
        },
        last_login: new Date(),
        is_active: true,
        department: 'Administración',
        position: 'Administrador General',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: new ObjectId(),
        organization_id: organizations[0]._id,
        email: 'auditor@techcorp.com',
        name: 'Auditor TechCorp',
        role: 'Auditor',
        permissions: [
          'process:read',
          'report:*',
          'ai:read',
          'rag:search'
        ],
        preferences: {
          theme: 'auto',
          language: 'es',
          notifications: {
            email: true,
            push: false,
            slack: false
          },
          dashboard_layout: {}
        },
        last_login: new Date(),
        is_active: true,
        department: 'Calidad',
        position: 'Auditor Interno',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: new ObjectId(),
        organization_id: organizations[1]._id,
        email: 'admin@qualityfirst.com',
        name: 'Admin QualityFirst',
        role: 'OrgAdmin',
        permissions: [
          'org:*',
          'process:*',
          'user:*',
          'ai:*',
          'rag:*'
        ],
        preferences: {
          theme: 'dark',
          language: 'es',
          notifications: {
            email: true,
            push: true,
            slack: true
          },
          dashboard_layout: {}
        },
        last_login: new Date(),
        is_active: true,
        department: 'Gestión',
        position: 'Gerente de Calidad',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insertar usuarios
    for (const user of users) {
      await mainDb.collection('users').insertOne(user);
      logger.info(`✅ Usuario creado: ${user.name} (${user.email})`);
    }

    // ============================================================================
    // CREAR AGENTES DE IA DE EJEMPLO
    // ============================================================================

    const agents: Array<{
      organizationId: string;
      name: string;
      type: AgentType;
      capabilities: string[];
    }> = [
      {
        organizationId: organizations[0]._id.toString(),
        name: 'Validador de Procesos ISO 9001',
        type: AgentType.VALIDATION,
        capabilities: ['process_validation', 'data_validation', 'compliance_check']
      },
      {
        organizationId: organizations[0]._id.toString(),
        name: 'Asistente de Sugerencias',
        type: AgentType.SUGGESTION,
        capabilities: ['process_suggestions', 'optimization_tips', 'best_practices']
      },
      {
        organizationId: organizations[0]._id.toString(),
        name: 'Autocompletador Inteligente',
        type: AgentType.AUTOCOMPLETE,
        capabilities: ['field_completion', 'context_aware', 'pattern_recognition']
      },
      {
        organizationId: organizations[0]._id.toString(),
        name: 'Analista de Procesos',
        type: AgentType.ANALYSIS,
        capabilities: ['process_analysis', 'performance_metrics', 'risk_assessment']
      },
      {
        organizationId: organizations[1]._id.toString(),
        name: 'Validador QualityFirst',
        type: AgentType.VALIDATION,
        capabilities: ['process_validation', 'quality_standards']
      },
      {
        organizationId: organizations[1]._id.toString(),
        name: 'Optimizador de Procesos',
        type: AgentType.OPTIMIZATION,
        capabilities: ['process_optimization', 'efficiency_improvement']
      }
    ];

    // Crear agentes
    for (const agentData of agents) {
      const agent = await AIAgentService.createAgent(
        agentData.organizationId,
        agentData.name,
        agentData.type,
        agentData.capabilities
      );
      logger.info(`✅ Agente creado: ${agent.name} (${agent.type})`);
    }

    // ============================================================================
    // INGESTIONAR DOCUMENTOS RAG DE EJEMPLO
    // ============================================================================

    const documents = [
      {
        organizationId: organizations[0]._id.toString(),
        title: 'Manual de Calidad ISO 9001:2015',
        content: `Este manual describe el sistema de gestión de calidad de TechCorp Solutions.

1. INTRODUCCIÓN
El Sistema de Gestión de Calidad (SGC) de TechCorp Solutions está diseñado para cumplir con los requisitos de la norma ISO 9001:2015.

2. ALCANCE
El SGC aplica a todos los procesos de desarrollo de software y servicios de consultoría tecnológica.

3. REFERENCIAS NORMATIVAS
- ISO 9001:2015 Sistemas de gestión de calidad
- ISO 9000:2015 Fundamentos y vocabulario

4. CONTEXTO DE LA ORGANIZACIÓN
4.1 Comprensión de la organización y su contexto
TechCorp Solutions opera en el sector de tecnología con enfoque en desarrollo de software.

4.2 Comprensión de las necesidades y expectativas de las partes interesadas
- Clientes: Soluciones tecnológicas innovadoras
- Empleados: Entorno de trabajo seguro y desarrollo profesional
- Proveedores: Relaciones comerciales justas

5. LIDERAZGO
5.1 Liderazgo y compromiso
La alta dirección demuestra liderazgo y compromiso con el SGC.

5.2 Política de la calidad
"Proporcionar soluciones tecnológicas innovadoras que superen las expectativas de nuestros clientes, manteniendo los más altos estándares de calidad y mejora continua."

6. PLANIFICACIÓN
6.1 Acciones para abordar riesgos y oportunidades
Se identifican y evalúan riesgos y oportunidades que pueden afectar la conformidad de productos y servicios.

6.2 Objetivos de la calidad y planificación para lograrlos
Los objetivos de calidad son medibles, coherentes con la política de calidad y se revisan periódicamente.

7. APOYO
7.1 Recursos
La organización determina y proporciona los recursos necesarios para el SGC.

7.2 Competencia
Se determina la competencia necesaria de las personas que realizan trabajo bajo control de la organización.

7.3 Toma de conciencia
Las personas que realizan trabajo bajo control de la organización son conscientes de la política de calidad.

8. OPERACIÓN
8.1 Planificación y control operacional
La organización planifica, implementa y controla los procesos necesarios para cumplir los requisitos.

8.2 Requisitos para los productos y servicios
Se determinan los requisitos para los productos y servicios a ofrecer.

8.3 Diseño y desarrollo de los productos y servicios
Se planifica y controla el diseño y desarrollo de productos y servicios.

9. EVALUACIÓN DEL DESEMPEÑO
9.1 Seguimiento, medición, análisis y evaluación
La organización determina qué necesita seguimiento y medición, y los métodos para hacerlo.

9.2 Auditoría interna
Se realizan auditorías internas a intervalos planificados.

9.3 Revisión por la dirección
La alta dirección revisa el SGC a intervalos planificados.

10. MEJORA
10.1 No conformidad y acciones correctivas
Se determinan y aplican acciones para eliminar las causas de no conformidades.

10.2 Mejora continua
La organización mejora continuamente la idoneidad, adecuación y eficacia del SGC.`,
        type: 'pdf' as const,
        source: 'upload' as const,
        metadata: {
          author: 'Equipo de Calidad',
          category: 'manuales',
          tags: ['iso9001', 'calidad', 'manual', 'procesos'],
          language: 'es'
        }
      },
      {
        organizationId: organizations[0]._id.toString(),
        title: 'Procedimientos de Desarrollo de Software',
        content: `PROCEDIMIENTOS DE DESARROLLO DE SOFTWARE

1. PROCESO DE DESARROLLO
1.1 Análisis de Requisitos
- Recopilación de requisitos del cliente
- Análisis de viabilidad técnica
- Documentación de especificaciones funcionales

1.2 Diseño del Sistema
- Arquitectura del software
- Diseño de base de datos
- Diseño de interfaces de usuario

1.3 Implementación
- Programación según estándares de codificación
- Revisión de código
- Pruebas unitarias

1.4 Pruebas
- Pruebas de integración
- Pruebas de sistema
- Pruebas de aceptación

1.5 Despliegue
- Configuración del entorno de producción
- Despliegue gradual
- Monitoreo post-despliegue

2. CONTROL DE VERSIONES
- Uso de Git para control de versiones
- Ramas de desarrollo separadas
- Revisión de código obligatoria
- Integración continua

3. GESTIÓN DE CONFIGURACIÓN
- Control de versiones de software
- Gestión de dependencias
- Configuración de entornos

4. PRUEBAS DE CALIDAD
4.1 Pruebas Unitarias
- Cobertura mínima del 80%
- Pruebas automatizadas
- Documentación de casos de prueba

4.2 Pruebas de Integración
- Pruebas de interfaces
- Pruebas de flujos de datos
- Pruebas de rendimiento

4.3 Pruebas de Sistema
- Pruebas end-to-end
- Pruebas de usabilidad
- Pruebas de seguridad

5. DOCUMENTACIÓN
- Documentación técnica
- Manuales de usuario
- Documentación de API
- Guías de instalación

6. GESTIÓN DE CAMBIOS
- Solicitudes de cambio documentadas
- Evaluación de impacto
- Aprobación por comité de cambios
- Implementación controlada

7. MÉTRICAS DE CALIDAD
- Tiempo de respuesta
- Tasa de defectos
- Satisfacción del cliente
- Productividad del equipo`,
        type: 'docx' as const,
        source: 'upload' as const,
        metadata: {
          author: 'Equipo de Desarrollo',
          category: 'procedimientos',
          tags: ['desarrollo', 'software', 'procesos', 'calidad'],
          language: 'es'
        }
      },
      {
        organizationId: organizations[1]._id.toString(),
        title: 'Manual de Calidad Manufacturing',
        content: `MANUAL DE CALIDAD - QUALITYFIRST MANUFACTURING

1. INTRODUCCIÓN
QualityFirst Manufacturing se compromete a proporcionar productos de la más alta calidad que cumplan o superen las expectativas de nuestros clientes.

2. POLÍTICA DE CALIDAD
"Fabricar productos de calidad superior mediante procesos eficientes y mejora continua, garantizando la satisfacción total del cliente."

3. PROCESOS DE FABRICACIÓN
3.1 Control de Materias Primas
- Inspección de entrada
- Almacenamiento controlado
- Trazabilidad completa

3.2 Proceso de Fabricación
- Control de parámetros críticos
- Inspección en proceso
- Registro de datos

3.3 Control de Producto Final
- Inspección 100% de características críticas
- Muestreo estadístico para características no críticas
- Certificado de conformidad

4. GESTIÓN DE NO CONFORMIDADES
4.1 Identificación
- Detección temprana de no conformidades
- Registro en sistema de gestión

4.2 Análisis
- Investigación de causas raíz
- Evaluación de impacto

4.3 Acciones Correctivas
- Implementación de acciones
- Verificación de efectividad
- Prevención de recurrencia

5. CALIBRACIÓN Y MANTENIMIENTO
- Programa de calibración anual
- Mantenimiento preventivo
- Registro de actividades

6. FORMACIÓN DEL PERSONAL
- Capacitación inicial
- Formación continua
- Evaluación de competencias

7. AUDITORÍAS INTERNAS
- Programa anual de auditorías
- Seguimiento de acciones correctivas
- Mejora continua

8. GESTIÓN DE PROVEEDORES
- Evaluación de proveedores
- Control de calidad de suministros
- Desarrollo de proveedores

9. MEJORA CONTINUA
- Análisis de datos
- Identificación de oportunidades
- Implementación de mejoras`,
        type: 'pdf' as const,
        source: 'upload' as const,
        metadata: {
          author: 'Equipo de Calidad',
          category: 'manuales',
          tags: ['manufactura', 'calidad', 'iso9001', 'procesos'],
          language: 'es'
        }
      }
    ];

    // Ingestionar documentos
    for (const doc of documents) {
      const document = await RAGService.ingestDocument(
        doc.organizationId,
        doc.title,
        doc.content,
        doc.type,
        doc.source,
        doc.metadata
      );
      logger.info(`✅ Documento RAG ingestionado: ${document.title}`);
    }

    // ============================================================================
    // CREAR ÍNDICES PARA TENANTS
    // ============================================================================

    for (const org of organizations) {
      await databaseManager.createTenantIndexes(org._id.toString());
      logger.info(`✅ Índices creados para tenant: ${org.name}`);
    }

    logger.info('🎉 Seed de la base de datos completado exitosamente!');
    logger.info(`📊 Organizaciones creadas: ${organizations.length}`);
    logger.info(`👥 Usuarios creados: ${users.length}`);
    logger.info(`🤖 Agentes de IA creados: ${agents.length}`);
    logger.info(`📄 Documentos RAG ingestionados: ${documents.length}`);

  } catch (error) {
    logger.error('❌ Error durante el seed de la base de datos:', error);
    throw error;
  }
}

// Ejecutar seed si se llama directamente
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('✅ Seed completado');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Error en seed:', error);
      process.exit(1);
    });
}

export default seedDatabase;