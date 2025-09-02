const express = require('express');
const { getProductos,
  getProducto,
  createProducto,
  updateProducto,
  deleteProducto,
  getHistorialProducto
 } = require('../controllers/productosController.js');

const router = express.Router();

// Rutas de productos
router.get('/', getProductos);
router.get('/:id', getProducto);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);
router.get('/:id/historial', getHistorialProducto);

module.exports = router;
