const { Router  } = require('express');
const multer = require('multer');
const path = require('path');
const mongoClient = require('../lib/mongoClient.js');
const { fileURLToPath  } = require('url');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = Router();

// --- Configuración de Multer para la subida de archivos ---



// Crear directorio si no existe
const uploadsDir = path.join(__dirname, '../uploads/documentos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ubicación donde se guardarán los archivos subidos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Crear un nombre de archivo único para evitar colisiones
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo
  }
});

// --- Rutas de la API ---

// GET /api/documentos - Listar todos los documentos de una organización
router.get('/', authMiddleware, async (req, res) => {
  try {
    const organization_id = req.user?.organization_id;
    if (!organization_id) {
      return res.status(400).json({ message: 'La organización del usuario no fue encontrada.' });
    }

    const result = await mongoClient.execute({
      sql: 'SELECT * FROM documentos WHERE organization_id = ? ORDER BY created_at DESC',
      args: [organization_id],
    });

    // Convertir BigInt a Number en los resultados
    const documentos = result.rows.map(row => ({
      ...row,
      id: row.id ? Number(row.id) : null,
      organization_id: row.organization_id ? Number(row.organization_id) : null,
      tamaño: row.tamaño ? Number(row.tamaño) : null
    }));

    res.status(200).json(documentos);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener documentos.' });
  }
});

// GET /api/documentos/:id - Obtener un documento específico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const organization_id = req.user?.organization_id;

    const result = await mongoClient.execute({
      sql: 'SELECT * FROM documentos WHERE id = ? AND organization_id = ?',
      args: [id, organization_id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    const documento = result.rows[0];
    // Convertir BigInt a Number
    const documentoFormateado = {
      ...documento,
      id: documento.id ? Number(documento.id) : null,
      organization_id: documento.organization_id ? Number(documento.organization_id) : null,
      tamaño: documento.tamaño ? Number(documento.tamaño) : null
    };

    res.status(200).json(documentoFormateado);
  } catch (error) {
    console.error('Error al obtener documento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/documentos - Subir un nuevo documento
router.post('/', authMiddleware, upload.single('archivo'), async (req, res) => {
  try {
    console.log('📤 POST /api/documentos - Iniciando...');
    console.log('📋 Body recibido:', req.body);
    console.log('📁 Archivo recibido:', req.file ? req.file.originalname : 'NO HAY ARCHIVO');
    console.log('👤 Usuario:', req.user);
    
    const { titulo, descripcion, version } = req.body;
    const organization_id = req.user?.organization_id;

    // Validaciones básicas
    if (!titulo || !req.file) {
      console.log('❌ Validación fallida: título o archivo faltante');
      return res.status(400).json({ message: 'El título y el archivo son requeridos.' });
    }
    if (!organization_id) {
      console.log('❌ Validación fallida: organization_id faltante');
      return res.status(400).json({ message: 'La organización del usuario no fue encontrada.' });
    }

    const archivo = req.file;
    const archivo_nombre = archivo.originalname;
    const archivo_path = archivo.filename; // Solo guardamos el nombre del archivo, no la ruta completa
    const tipo_archivo = archivo.mimetype;
    const tamaño = archivo.size;

    console.log('💾 Intentando guardar en BD:', {
      titulo, descripcion, version, archivo_nombre, archivo_path, tipo_archivo, tamaño, organization_id
    });

    const result = await mongoClient.execute({
      sql: `INSERT INTO documentos (titulo, nombre, descripcion, version, archivo_nombre, archivo_path, tipo_archivo, tamaño, organization_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [titulo, titulo, descripcion || '', version || '1.0', archivo_nombre, archivo_path, tipo_archivo, tamaño, organization_id],
    });

    console.log('✅ Documento guardado con ID:', result.lastInsertRowid);

    // Convertir BigInt a Number para evitar error de serialización
    const documentoId = Number(result.lastInsertRowid);

    res.status(201).json({ 
      message: 'Documento creado exitosamente', 
      id: documentoId,
      titulo,
      archivo_nombre
    });
  } catch (error) {
    console.error('❌ Error al crear documento:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ message: 'Error interno del servidor al crear el documento.' });
  }
});

// GET /api/documentos/:id/download - Descargar un documento
router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const organization_id = req.user?.organization_id;

    // Obtener información del documento
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM documentos WHERE id = ? AND organization_id = ?',
      args: [id, organization_id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    const documento = result.rows[0];
    const filePath = path.join(uploadsDir, documento.archivo_path);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
    }

    // Enviar el archivo
    res.download(filePath, documento.archivo_nombre);
  } catch (error) {
    console.error('Error al descargar documento:', error);
    res.status(500).json({ message: 'Error al descargar el documento' });
  }
});

// DELETE /api/documentos/:id - Eliminar un documento
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const organization_id = req.user?.organization_id;

    // Primero obtener el documento para eliminar el archivo
    const selectResult = await mongoClient.execute({
      sql: 'SELECT archivo_path FROM documentos WHERE id = ? AND organization_id = ?',
      args: [id, organization_id],
    });

    if (selectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    const documento = selectResult.rows[0];

    // Eliminar el archivo físico
    try {
      const filePath = path.join(uploadsDir, documento.archivo_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('Error al eliminar archivo físico:', fileError);
      // Continuar con la eliminación del registro aunque falle el archivo
    }

    // Eliminar el registro de la base de datos
    await mongoClient.execute({
      sql: 'DELETE FROM documentos WHERE id = ? AND organization_id = ?',
      args: [id, organization_id],
    });

    res.status(200).json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ message: 'Error al eliminar el documento' });
  }
});

module.exports = router;
