import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import RegistroController from '../controllers/RegistroController';
import { authenticateToken } from '../middleware/auth';
import { checkRole } from '../middleware/roleCheck';

const router = Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/registros/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// CRUD básico de registros
router.post('/', RegistroController.crear);
router.get('/', RegistroController.listar);
router.get('/:id', RegistroController.obtenerPorId);
router.put('/:id', RegistroController.actualizar);
router.delete('/:id', checkRole(['admin', 'supervisor']), RegistroController.archivar);

// Vista Kanban
router.get('/kanban/:plantillaId', RegistroController.vistaKanban);

// Gestión de estados
router.put('/:id/cambiar-estado', RegistroController.cambiarEstado);
router.get('/:id/estados-permitidos', RegistroController.obtenerEstadosPermitidos);

// Comentarios
router.post('/:id/comentarios', RegistroController.agregarComentario);

// Archivos
router.post('/:id/archivos', upload.single('archivo'), RegistroController.subirArchivo);

// Checklist
router.put('/:id/checklist', RegistroController.actualizarChecklist);

// Operaciones especiales
router.post('/:id/bloquear', RegistroController.toggleBloqueo);
router.post('/:id/clonar', RegistroController.clonar);

// Exportación
router.get('/exportar', RegistroController.exportar);

export default router;