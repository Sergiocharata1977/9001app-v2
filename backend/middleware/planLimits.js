const mongoClient = require('../lib/mongoClient.js');

/**
 * Middleware para validar límites del plan de la organización
 * @param {string} resourceType - Tipo de recurso a validar (usuarios, departamentos, documentos, etc.)
 * @param {number} currentCount - Cantidad actual del recurso
 */
const validatePlanLimit = (resourceType, currentCount = null) => {
  return async (req, res, next) => {
    try {
      const { organization_id } = req.user;

      // Obtener la suscripción activa de la organización
      const { rows: subscription } = await mongoClient.execute({
        sql: `
          SELECT 
            s.id, s.estado, s.fecha_fin,
            p.max_usuarios, p.max_departamentos, p.max_documentos,
            p.max_auditorias, p.max_hallazgos, p.max_acciones
          FROM suscripciones s
          LEFT JOIN planes p ON s.plan_id = p.id
          WHERE s.organization_id = ? AND s.estado = 'activa'
          ORDER BY s.created_at DESC
          LIMIT 1
        `,
        args: [organization_id]
      });

      // Si no hay suscripción activa, permitir acceso (plan gratuito por defecto)
      if (subscription.length === 0) {
        console.log(`⚠️  Organización ${organization_id} sin suscripción activa - usando límites por defecto`);
        return next();
      }

      const suscripcion = subscription[0];

      // Verificar si la suscripción está vencida
      if (suscripcion.fecha_fin && new Date(suscripcion.fecha_fin) < new Date()) {
        return res.status(403).json({
          success: false,
          message: 'Su suscripción ha vencido. Por favor, renueve su plan para continuar.',
          error: 'SUBSCRIPTION_EXPIRED'
        });
      }

      // Si no se proporciona currentCount, obtener el conteo actual
      let actualCount = currentCount;
      if (actualCount === null) {
        const { rows: countResult } = await mongoClient.execute({
          sql: `SELECT COUNT(*) as count FROM ${resourceType} WHERE organization_id = ?`,
          args: [organization_id]
        });
        actualCount = countResult[0].count;
      }

      // Obtener el límite del plan para este tipo de recurso
      const limitMap = {
        'usuarios': suscripcion.max_usuarios,
        'personal': suscripcion.max_usuarios,
        'departamentos': suscripcion.max_departamentos,
        'documentos': suscripcion.max_documentos,
        'auditorias': suscripcion.max_auditorias,
        'hallazgos': suscripcion.max_hallazgos,
        'acciones': suscripcion.max_acciones
      };

      const planLimit = limitMap[resourceType];

      if (planLimit === undefined) {
        console.warn(`⚠️  Tipo de recurso no reconocido: ${resourceType}`);
        return next();
      }

      // Verificar si se ha alcanzado el límite
      if (actualCount >= planLimit) {
        return res.status(403).json({
          success: false,
          message: `Ha alcanzado el límite de ${resourceType} de su plan actual (${actualCount}/${planLimit}).`,
          error: 'PLAN_LIMIT_REACHED',
          data: {
            resourceType,
            currentCount: actualCount,
            planLimit,
            remaining: 0
          }
        });
      }

      // Agregar información de límites al request para uso posterior
      req.planLimits = {
        resourceType,
        currentCount: actualCount,
        planLimit,
        remaining: planLimit - actualCount
      };

      next();
    } catch (error) {
      console.error('Error al validar límites del plan:', error);
      // En caso de error, permitir el acceso para no bloquear la aplicación
      next();
    }
  };
};

/**
 * Middleware para validar límites antes de crear un nuevo recurso
 * @param {string} resourceType - Tipo de recurso a validar
 */
const validateCreateLimit = (resourceType) => {
  return validatePlanLimit(resourceType, null);
};

/**
 * Middleware para validar límites con conteo personalizado
 * @param {string} resourceType - Tipo de recurso a validar
 * @param {Function} countFunction - Función que retorna el conteo actual
 */
const validateCustomLimit = (resourceType, countFunction) => {
  return async (req, res, next) => {
    try {
      const currentCount = await countFunction(req);
      return validatePlanLimit(resourceType, currentCount)(req, res, next);
    } catch (error) {
      console.error('Error en validación personalizada de límites:', error);
      next();
    }
  };
};

/**
 * Función para obtener estadísticas de uso de la organización
 */
const getOrganizationUsage = async (organization_id) => {
  try {
    // Obtener la suscripción activa
    const { rows: subscription } = await mongoClient.execute({
      sql: `
        SELECT 
          s.id, s.estado, s.fecha_fin,
          p.nombre as plan_nombre, p.max_usuarios, p.max_departamentos,
          p.max_documentos, p.max_auditorias, p.max_hallazgos, p.max_acciones
        FROM suscripciones s
        LEFT JOIN planes p ON s.plan_id = p.id
        WHERE s.organization_id = ? AND s.estado = 'activa'
        ORDER BY s.created_at DESC
        LIMIT 1
      `,
      args: [organization_id]
    });

    if (subscription.length === 0) {
      return {
        hasActiveSubscription: false,
        planName: 'Gratuito',
        usage: {}
      };
    }

    const suscripcion = subscription[0];

    // Obtener conteos actuales
    const [
      { rows: usuariosCount },
      { rows: departamentosCount },
      { rows: documentosCount },
      { rows: auditoriasCount },
      { rows: hallazgosCount },
      { rows: accionesCount }
    ] = await Promise.all([
      mongoClient.execute({
        sql: 'SELECT COUNT(*) as count FROM personal WHERE organization_id = ?',
        args: [organization_id]
      }),
      mongoClient.execute({
        sql: 'SELECT COUNT(*) as count FROM departamentos WHERE organization_id = ?',
        args: [organization_id]
      }),
      mongoClient.execute({
        sql: 'SELECT COUNT(*) as count FROM documentos WHERE organization_id = ?',
        args: [organization_id]
      }),
      mongoClient.execute({
        sql: 'SELECT COUNT(*) as count FROM auditorias WHERE organization_id = ?',
        args: [organization_id]
      }),
      mongoClient.execute({
        sql: 'SELECT COUNT(*) as count FROM hallazgos WHERE organization_id = ?',
        args: [organization_id]
      }),
      mongoClient.execute({
        sql: 'SELECT COUNT(*) as count FROM acciones WHERE organization_id = ?',
        args: [organization_id]
      })
    ]);

    return {
      hasActiveSubscription: true,
      planName: suscripcion.plan_nombre,
      subscriptionExpired: suscripcion.fecha_fin && new Date(suscripcion.fecha_fin) < new Date(),
      usage: {
        usuarios: {
          current: usuariosCount[0].count,
          limit: suscripcion.max_usuarios,
          remaining: suscripcion.max_usuarios - usuariosCount[0].count
        },
        departamentos: {
          current: departamentosCount[0].count,
          limit: suscripcion.max_departamentos,
          remaining: suscripcion.max_departamentos - departamentosCount[0].count
        },
        documentos: {
          current: documentosCount[0].count,
          limit: suscripcion.max_documentos,
          remaining: suscripcion.max_documentos - documentosCount[0].count
        },
        auditorias: {
          current: auditoriasCount[0].count,
          limit: suscripcion.max_auditorias,
          remaining: suscripcion.max_auditorias - auditoriasCount[0].count
        },
        hallazgos: {
          current: hallazgosCount[0].count,
          limit: suscripcion.max_hallazgos,
          remaining: suscripcion.max_hallazgos - hallazgosCount[0].count
        },
        acciones: {
          current: accionesCount[0].count,
          limit: suscripcion.max_acciones,
          remaining: suscripcion.max_acciones - accionesCount[0].count
        }
      }
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de uso:', error);
    throw error;
  }
}; 