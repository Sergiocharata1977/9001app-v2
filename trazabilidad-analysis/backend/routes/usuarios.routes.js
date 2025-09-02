const express = require('express');
const mongoClient = require('../lib/mongoClient.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const router = express.Router();

// Obtener todos los usuarios de la organización
router.get('/', async (req, res) => {
  try {
    const organization_id = req.user?.organization_id;

    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    console.log(`🔍 Obteniendo usuarios para organización: ${organization_id}`);

    const collection = mongoClient.collection('usuarios');
    const result = await collection.find(
      { organization_id: organization_id },
      {
        projection: {
          id: 1,
          name: 1,
          email: 1,
          role: 1,
          organization_id: 1,
          created_at: 1,
          updated_at: 1
        },
        sort: { name: 1 }
      }
    ).toArray();

    console.log(`✅ Encontrados ${result.length} usuarios para organización ${organization_id}`);

    res.json({
      success: true,
      data: result,
      total: result.length
    });

  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
});

// Obtener usuario específico por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organization_id = req.user?.organization_id;

    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    const collection = mongoClient.collection('usuarios');
    const result = await collection.findOne(
      { 
        id: id, 
        organization_id: organization_id 
      },
      {
        projection: {
          id: 1,
          name: 1,
          email: 1,
          role: 1,
          organization_id: 1,
          created_at: 1,
          updated_at: 1
        }
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
});

// Crear nuevo usuario
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      email,
      password,
      role = 'user'
    } = req.body;

    const organization_id = req.user?.organization_id;

    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Los campos nombre, email y password son obligatorios.'
      });
    }

    const collection = mongoClient.collection('usuarios');

    // Verificar si el email ya existe
    const existingResult = await collection.findOne({ 
      email: email,
      organization_id: organization_id
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con ese email en la organización.'
      });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario
    const nuevoUsuario = {
      id: crypto.randomUUID(),
      name: nombre,
      email: email,
      password: hashedPassword,
      role: role,
      organization_id: organization_id,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await collection.insertOne(nuevoUsuario);

    // Retornar usuario sin contraseña
    const { password: _, ...usuarioSinPassword } = nuevoUsuario;

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: usuarioSinPassword
    });

  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      email,
      password,
      role
    } = req.body;

    const organization_id = req.user?.organization_id;

    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    const collection = mongoClient.collection('usuarios');

    // Verificar si el usuario existe
    const existingResult = await collection.findOne({ 
      id: id,
      organization_id: organization_id
    });

    if (!existingResult) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Preparar datos para actualización
    const updateData = {
      updated_at: new Date()
    };

    if (nombre) updateData.name = nombre;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    // Si se proporciona nueva contraseña, hashearla
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    // Verificar si el email ya existe en otro usuario
    if (email && email !== existingResult.email) {
      const emailExists = await collection.findOne({ 
        email: email,
        organization_id: organization_id,
        id: { $ne: id }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con ese email en la organización.'
        });
      }
    }

    // Actualizar usuario
    const result = await collection.updateOne(
      { 
        id: id,
        organization_id: organization_id
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Obtener usuario actualizado
    const updatedUser = await collection.findOne(
      { id: id },
      {
        projection: {
          id: 1,
          name: 1,
          email: 1,
          role: 1,
          organization_id: 1,
          created_at: 1,
          updated_at: 1
        }
      }
    );

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updatedUser
    });

  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organization_id = req.user?.organization_id;

    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    const collection = mongoClient.collection('usuarios');

    // Verificar si el usuario existe
    const existingResult = await collection.findOne({ 
      id: id,
      organization_id: organization_id
    });

    if (!existingResult) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar el último administrador
    if (existingResult.role === 'admin') {
      const adminCount = await collection.countDocuments({
        organization_id: organization_id,
        role: 'admin'
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar el último administrador de la organización.'
        });
      }
    }

    // Eliminar usuario
    const result = await collection.deleteOne({ 
      id: id,
      organization_id: organization_id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
});

module.exports = router; 