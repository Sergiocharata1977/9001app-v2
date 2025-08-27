import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

// Configuración de variables de entorno
dotenv.config();

// Importaciones de servicios y utilidades
import databaseManager from './config/database';
import logger, { httpLogger } from './utils/logger';
import AIRoutes from './routes/ai-routes';

// Configuración de la aplicación
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// CONFIGURACIÓN DE MIDDLEWARE
// ============================================================================

// Seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-id']
}));

// Compresión
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite por IP
  message: {
    error: 'Too many requests from this IP',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Logging de requests HTTP
app.use((req, res, next) => {
  httpLogger.info(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// CONFIGURACIÓN DE SOCKET.IO
// ============================================================================

io.on('connection', (socket) => {
  logger.info(`Cliente conectado: ${socket.id}`);

  // Unirse a sala de organización
  socket.on('join-organization', (organizationId: string) => {
    socket.join(`org-${organizationId}`);
    logger.info(`Cliente ${socket.id} se unió a la organización ${organizationId}`);
  });

  // Eventos de IA en tiempo real
  socket.on('ai-suggestion-request', async (data) => {
    try {
      // Aquí se procesaría la solicitud de sugerencia de IA
      socket.emit('ai-suggestion-response', {
        success: true,
        suggestions: [],
        timestamp: new Date()
      });
    } catch (error) {
      socket.emit('ai-suggestion-error', {
        error: 'Error processing AI suggestion',
        timestamp: new Date()
      });
    }
  });

  // Eventos de proceso en tiempo real
  socket.on('process-update', (data) => {
    // Broadcast a todos los clientes de la organización
    socket.to(`org-${data.organizationId}`).emit('process-updated', data);
  });

  socket.on('disconnect', () => {
    logger.info(`Cliente desconectado: ${socket.id}`);
  });
});

// ============================================================================
// RUTAS DE LA API
// ============================================================================

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await databaseManager.healthCheck();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      database: dbHealth,
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
});

// Métricas del sistema
app.get('/metrics', async (req, res) => {
  try {
    const dbHealth = await databaseManager.healthCheck();
    
    res.status(200).json({
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      database: dbHealth,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Metrics endpoint failed:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// Rutas de IA
app.use('/api/org/:orgId', AIRoutes);

// Ruta para servir archivos estáticos (si es necesario)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================================================
// MANEJO DE ERRORES
// ============================================================================

// Error handler para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl
  });
});

// Error handler global
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);

  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: error.message
    });
  }

  // Error de autenticación
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
  }

  // Error de permisos
  if (error.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Forbidden',
      code: 'FORBIDDEN'
    });
  }

  // Error de base de datos
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    return res.status(500).json({
      error: 'Database error',
      code: 'DATABASE_ERROR'
    });
  }

  // Error genérico
  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : error.message,
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// ============================================================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================================================

async function startServer() {
  try {
    // Conectar a las bases de datos
    await databaseManager.connect();
    logger.info('✅ Bases de datos conectadas exitosamente');

    // Iniciar servidor
    server.listen(PORT, () => {
      logger.info(`🚀 Servidor iniciado en puerto ${PORT}`);
      logger.info(`📊 Ambiente: ${NODE_ENV}`);
      logger.info(`🔗 URL: http://localhost:${PORT}`);
      logger.info(`📈 Health check: http://localhost:${PORT}/health`);
      logger.info(`📊 Métricas: http://localhost:${PORT}/metrics`);
      
      if (NODE_ENV === 'development') {
        logger.info(`🔧 Modo desarrollo activo`);
        logger.info(`📝 Logs detallados habilitados`);
      }
    });

    // Manejo de señales de terminación
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Función de apagado graceful
async function gracefulShutdown() {
  logger.info('🔄 Iniciando apagado graceful...');
  
  try {
    // Cerrar servidor HTTP
    server.close(() => {
      logger.info('✅ Servidor HTTP cerrado');
    });

    // Desconectar bases de datos
    await databaseManager.disconnect();
    logger.info('✅ Bases de datos desconectadas');

    // Salir del proceso
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error durante apagado graceful:', error);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Iniciar servidor
startServer();

export default app;
