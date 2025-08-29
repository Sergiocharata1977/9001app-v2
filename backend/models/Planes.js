const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || '9001app';

class PlanesModel {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  async connect() {
    if (!this.client) {
      this.client = new MongoClient(MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      this.collection = this.db.collection('planes');
    }
    return this.collection;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.collection = null;
    }
  }

  // Obtener todos los planes activos
  async getAllPlanes() {
    try {
      const collection = await this.connect();
      const planes = await collection.find({ is_active: true }).sort({ precio_mensual: 1 }).toArray();
      return planes;
    } catch (error) {
      console.error('Error obteniendo planes:', error);
      throw error;
    }
  }

  // Obtener plan por ID
  async getPlanById(planId) {
    try {
      const collection = await this.connect();
      const plan = await collection.findOne({ id: parseInt(planId) });
      return plan;
    } catch (error) {
      console.error('Error obteniendo plan por ID:', error);
      throw error;
    }
  }

  // Obtener planes por rango de precio
  async getPlanesByPriceRange(minPrice, maxPrice) {
    try {
      const collection = await this.connect();
      const planes = await collection.find({
        is_active: true,
        precio_mensual: { $gte: minPrice, $lte: maxPrice }
      }).sort({ precio_mensual: 1 }).toArray();
      return planes;
    } catch (error) {
      console.error('Error obteniendo planes por rango de precio:', error);
      throw error;
    }
  }

  // Crear nuevo plan
  async createPlan(planData) {
    try {
      const collection = await this.connect();
      
      // Generar nuevo ID
      const lastPlan = await collection.findOne({}, { sort: { id: -1 } });
      const newId = lastPlan ? lastPlan.id + 1 : 1;
      
      const newPlan = {
        _id: new ObjectId(),
        id: newId,
        nombre: planData.nombre,
        descripcion: planData.descripcion,
        precio_mensual: parseFloat(planData.precio_mensual),
        precio_anual: parseFloat(planData.precio_anual),
        max_usuarios: parseInt(planData.max_usuarios),
        max_departamentos: parseInt(planData.max_departamentos),
        max_documentos: parseInt(planData.max_documentos),
        caracteristicas: planData.caracteristicas || [],
        is_active: planData.is_active !== false,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const result = await collection.insertOne(newPlan);
      return { ...newPlan, _id: result.insertedId };
    } catch (error) {
      console.error('Error creando plan:', error);
      throw error;
    }
  }

  // Actualizar plan
  async updatePlan(planId, planData) {
    try {
      const collection = await this.connect();
      
      const updateData = {
        ...planData,
        updated_at: new Date()
      };
      
      // Remover campos que no deben actualizarse
      delete updateData._id;
      delete updateData.id;
      delete updateData.created_at;
      
      const result = await collection.updateOne(
        { id: parseInt(planId) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        throw new Error('Plan no encontrado');
      }
      
      return await this.getPlanById(planId);
    } catch (error) {
      console.error('Error actualizando plan:', error);
      throw error;
    }
  }

  // Desactivar plan (soft delete)
  async deactivatePlan(planId) {
    try {
      const collection = await this.connect();
      
      const result = await collection.updateOne(
        { id: parseInt(planId) },
        { 
          $set: { 
            is_active: false,
            updated_at: new Date()
          }
        }
      );
      
      if (result.matchedCount === 0) {
        throw new Error('Plan no encontrado');
      }
      
      return { success: true, message: 'Plan desactivado correctamente' };
    } catch (error) {
      console.error('Error desactivando plan:', error);
      throw error;
    }
  }

  // Activar plan
  async activatePlan(planId) {
    try {
      const collection = await this.connect();
      
      const result = await collection.updateOne(
        { id: parseInt(planId) },
        { 
          $set: { 
            is_active: true,
            updated_at: new Date()
          }
        }
      );
      
      if (result.matchedCount === 0) {
        throw new Error('Plan no encontrado');
      }
      
      return { success: true, message: 'Plan activado correctamente' };
    } catch (error) {
      console.error('Error activando plan:', error);
      throw error;
    }
  }

  // Obtener estadísticas de planes
  async getPlanesStats() {
    try {
      const collection = await this.connect();
      
      const stats = await collection.aggregate([
        {
          $group: {
            _id: null,
            total_planes: { $sum: 1 },
            planes_activos: { $sum: { $cond: ['$is_active', 1, 0] } },
            precio_promedio: { $avg: '$precio_mensual' },
            precio_minimo: { $min: '$precio_mensual' },
            precio_maximo: { $max: '$precio_mensual' }
          }
        }
      ]).toArray();
      
      return stats[0] || {
        total_planes: 0,
        planes_activos: 0,
        precio_promedio: 0,
        precio_minimo: 0,
        precio_maximo: 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de planes:', error);
      throw error;
    }
  }
}

module.exports = PlanesModel;