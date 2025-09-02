const { Router  } = require('express');

const router = Router();

// Rutas temporales para evaluaciones-grupales
// Estas rutas son placeholders hasta que se implemente la funcionalidad completa

// Listar todas las evaluaciones grupales
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: [],
    message: 'Listado de evaluaciones grupales (placeholder)'
  });
});

// Obtener una evaluación grupal por ID
router.get('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    data: { id: req.params.id, nombre: 'Evaluación grupal de ejemplo' },
    message: `Detalle de evaluación grupal ID: ${req.params.id} (placeholder)`
  });
});

// Crear una evaluación grupal
router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    data: { id: 'nuevo-id', ...req.body },
    message: 'Evaluación grupal creada (placeholder)'
  });
});

// Actualizar una evaluación grupal
router.put('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    data: { id: req.params.id, ...req.body },
    message: `Evaluación grupal ID: ${req.params.id} actualizada (placeholder)`
  });
});

// Eliminar una evaluación grupal
router.delete('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    data: null,
    message: `Evaluación grupal ID: ${req.params.id} eliminada (placeholder)`
  });
});

module.exports = router;
