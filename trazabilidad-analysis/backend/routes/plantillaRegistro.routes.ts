import { Router } from 'express';
import PlantillaRegistroController from '../controllers/PlantillaRegistroController';
import { authenticateToken } from '../middleware/auth';
import { checkRole } from '../middleware/roleCheck';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// CRUD básico de plantillas
router.post('/', checkRole(['admin', 'supervisor']), PlantillaRegistroController.crear);
router.get('/', PlantillaRegistroController.listar);
router.get('/:id', PlantillaRegistroController.obtenerPorId);
router.put('/:id', checkRole(['admin', 'supervisor']), PlantillaRegistroController.actualizar);
router.delete('/:id', checkRole(['admin']), PlantillaRegistroController.eliminar);

// Operaciones especiales de plantillas
router.post('/:id/clonar', checkRole(['admin', 'supervisor']), PlantillaRegistroController.clonar);
router.post('/:id/activar', checkRole(['admin', 'supervisor']), PlantillaRegistroController.toggleActivo);
router.post('/:id/validar', PlantillaRegistroController.validar);
router.get('/:id/preview', PlantillaRegistroController.preview);

// Gestión de estados
router.post('/:id/estados', checkRole(['admin', 'supervisor']), PlantillaRegistroController.agregarEstado);
router.put('/:id/estados/:estadoId', checkRole(['admin', 'supervisor']), PlantillaRegistroController.actualizarEstado);
router.delete('/:id/estados/:estadoId', checkRole(['admin']), PlantillaRegistroController.eliminarEstado);
router.put('/:id/estados/reordenar', checkRole(['admin', 'supervisor']), PlantillaRegistroController.reordenarEstados);

export default router;