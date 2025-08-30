import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';

// Importar middleware de autenticación
import authMiddleware from '../middleware/authMiddleware.js';

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== RUTAS PÚBLICAS (SIN AUTENTICACIÓN) =====

// Ruta de salud (pública)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    mongodb: 'connected' // Placeholder
  });
});

// Ruta de prueba
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Backend funcionando correctamente!' });
});

// ===== FIN RUTAS PÚBLICAS =====

// Importar rutas
import accionesRoutes from '../routes/acciones.routes.js';
import adminRoutes from '../routes/admin.routes.js';
import auditoriasRoutes from '../routes/auditorias.routes.js';
import authRoutes from '../routes/authRoutes.js';
import capacitacionesRoutes from '../routes/capacitaciones.routes.js';
import competenciasRoutes from '../routes/competencias.routes.js';
import coordinacionRoutes from '../routes/coordinacion.routes.js';
import crmRoutes from '../routes/crm.routes.js';
import databaseRoutes from '../routes/database.routes.js';
import departamentosRoutes from '../routes/departamentos.routes.js';
import documentosRoutes from '../routes/documentos.routes.js';
import eventsRoutes from '../routes/events.routes.js';
import fileStructureRoutes from '../routes/fileStructure.routes.js';
import hallazgosRoutes from '../routes/hallazgos.routes.js';
import indicadoresRoutes from '../routes/indicadores.routes.js';
import medicionesRoutes from '../routes/mediciones.routes.js';
import minutasRoutes from '../routes/minutas.routes.js';
import normasRoutes from '../routes/normas.routes.js';
import objetivosCalidadRoutes from '../routes/objetivos-calidad.routes.js';
import personalRoutes from '../routes/personal.routes.js';
import planesRoutes from '../routes/planes.js';
import politicaCalidadRoutes from '../routes/politica-calidad.routes.js';
import procesosRoutes from '../routes/procesos.routes.js';
import productosRoutes from '../routes/productos.routes.js';
import puestosRoutes from '../routes/puestos.routes.js';
import suscripcionesRoutes from '../routes/suscripciones.js';
import userRoutes from '../routes/userRoutes.js';

// ===== RUTAS CON AUTENTICACIÓN =====

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de administración (requieren autenticación)
app.use('/api/admin', authMiddleware, adminRoutes);

// Rutas de planes
app.use('/api/planes', planesRoutes);

// Rutas de suscripciones
app.use('/api/suscripciones', suscripcionesRoutes);

// Rutas de usuarios (requieren autenticación)
app.use('/api/usuarios', authMiddleware, userRoutes);

// Rutas de departamentos
app.use('/api/departamentos', departamentosRoutes);

// Rutas de personal
app.use('/api/personal', personalRoutes);

// Rutas de puestos
app.use('/api/puestos', puestosRoutes);

// Rutas de capacitaciones
app.use('/api/capacitaciones', capacitacionesRoutes);

// Rutas de competencias
app.use('/api/competencias', competenciasRoutes);

// Rutas de documentos (con subida y descarga)
app.use('/api/documentos', documentosRoutes);

// Rutas de puntos de la norma ISO
app.use('/api/normas', normasRoutes);

// Rutas de procesos
app.use('/api/procesos', procesosRoutes);

// Rutas de objetivos de calidad
app.use('/api/objetivos-calidad', objetivosCalidadRoutes);

// Rutas de indicadores
app.use('/api/indicadores', indicadoresRoutes);

// Rutas de mediciones
app.use('/api/mediciones', medicionesRoutes);

// Rutas de auditorías
app.use('/api/auditorias', auditoriasRoutes);

// Rutas de hallazgos
app.use('/api/hallazgos', hallazgosRoutes);

// Rutas de acciones
app.use('/api/acciones', accionesRoutes);

// Rutas de minutas
app.use('/api/minutas', minutasRoutes);

// Rutas de política de calidad
app.use('/api/politica-calidad', politicaCalidadRoutes);

// Rutas de eventos
app.use('/api/events', eventsRoutes);

// Rutas de coordinación de agentes
app.use('/api', coordinacionRoutes);

// Rutas de CRM
app.use('/api/crm', crmRoutes);

// Rutas de base de datos
app.use('/api/database', databaseRoutes);

// Rutas de estructura de archivos
app.use('/api/file-structure', fileStructureRoutes);

// Rutas de productos (requieren autenticación)
app.use('/api/productos', authMiddleware, productosRoutes);

// ===== FIN RUTAS CON AUTENTICACIÓN =====

// Manejo de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
});

// Ruta 404
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
});
