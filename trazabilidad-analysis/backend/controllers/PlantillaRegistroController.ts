import { Request, Response, NextFunction } from 'express';
import PlantillaRegistro, { IPlantillaRegistro } from '../models/PlantillaRegistro';
import Registro from '../models/Registro';
import { v4 as uuidv4 } from 'uuid';

export class PlantillaRegistroController {
  /**
   * Crear nueva plantilla de registro
   */
  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nombre, descripcion, estados, configuracion_visual, configuracion_avanzada, permisos } = req.body;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      if (!organizacion_id) {
        res.status(400).json({ error: 'Organización no identificada' });
        return;
      }
      
      // Generar código único para la plantilla
      const codigo = await this.generarCodigoPlantilla(nombre);
      
      // Asegurar que cada estado y campo tenga un ID único
      const estadosProcesados = estados.map((estado: any) => ({
        ...estado,
        id: estado.id || uuidv4(),
        campos: estado.campos.map((campo: any) => ({
          ...campo,
          id: campo.id || uuidv4(),
          codigo: campo.codigo || `CAMPO_${uuidv4().substring(0, 8)}`
        }))
      }));
      
      const nuevaPlantilla = new PlantillaRegistro({
        codigo,
        nombre,
        descripcion,
        organizacion_id,
        estados: estadosProcesados,
        configuracion_visual: configuracion_visual || {
          icono: 'document',
          color_primario: '#3B82F6',
          vista_default: 'kanban'
        },
        configuracion_avanzada: configuracion_avanzada || {
          numeracion_automatica: {
            activa: true,
            prefijo: codigo,
            longitud_numero: 4,
            reiniciar_anual: false,
            reiniciar_mensual: false
          }
        },
        permisos: permisos || {
          crear: ['admin', 'usuario'],
          ver: ['admin', 'usuario', 'invitado'],
          editar: ['admin', 'usuario'],
          eliminar: ['admin']
        },
        auditoria: {
          creado_por: usuario_id,
          fecha_creacion: new Date(),
          version: 1,
          cambios_historial: []
        }
      });
      
      const plantillaGuardada = await nuevaPlantilla.save();
      
      res.status(201).json({
        success: true,
        data: plantillaGuardada,
        message: 'Plantilla creada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Listar plantillas de la organización
   */
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizacion_id = req.user?.organizacion_id;
      const { activo, categoria, modulo, busqueda, pagina = 1, limite = 10 } = req.query;
      
      const filtro: any = {
        organizacion_id,
        eliminado: false
      };
      
      if (activo !== undefined) {
        filtro.activo = activo === 'true';
      }
      
      if (categoria) {
        filtro.categoria = categoria;
      }
      
      if (modulo) {
        filtro.modulo = modulo;
      }
      
      if (busqueda) {
        filtro.$or = [
          { nombre: { $regex: busqueda, $options: 'i' } },
          { descripcion: { $regex: busqueda, $options: 'i' } },
          { codigo: { $regex: busqueda, $options: 'i' } }
        ];
      }
      
      const skip = (Number(pagina) - 1) * Number(limite);
      
      const [plantillas, total] = await Promise.all([
        PlantillaRegistro.find(filtro)
          .select('-estados.campos.configuracion -estados.acciones_automaticas')
          .populate('auditoria.creado_por', 'nombre email')
          .sort({ 'auditoria.fecha_creacion': -1 })
          .skip(skip)
          .limit(Number(limite)),
        PlantillaRegistro.countDocuments(filtro)
      ]);
      
      res.json({
        success: true,
        data: plantillas,
        pagination: {
          total,
          pagina: Number(pagina),
          limite: Number(limite),
          paginas: Math.ceil(total / Number(limite))
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Obtener plantilla por ID
   */
  async obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const organizacion_id = req.user?.organizacion_id;
      
      const plantilla = await PlantillaRegistro.findOne({
        _id: id,
        organizacion_id,
        eliminado: false
      })
      .populate('auditoria.creado_por', 'nombre email')
      .populate('auditoria.modificado_por', 'nombre email');
      
      if (!plantilla) {
        res.status(404).json({ error: 'Plantilla no encontrada' });
        return;
      }
      
      // Obtener estadísticas de uso
      const registrosCount = await Registro.countDocuments({
        plantilla_id: id,
        'metadata.eliminado': false
      });
      
      res.json({
        success: true,
        data: {
          ...plantilla.toObject(),
          estadisticas: {
            ...plantilla.estadisticas,
            registros_creados: registrosCount
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Actualizar plantilla
   */
  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      const actualizaciones = req.body;
      
      const plantilla = await PlantillaRegistro.findOne({
        _id: id,
        organizacion_id,
        eliminado: false
      });
      
      if (!plantilla) {
        res.status(404).json({ error: 'Plantilla no encontrada' });
        return;
      }
      
      // Guardar cambios en el historial
      const cambiosHistorial = {
        fecha: new Date(),
        usuario: usuario_id,
        tipo_cambio: 'actualizacion',
        descripcion: 'Actualización de plantilla',
        datos_anteriores: {
          nombre: plantilla.nombre,
          descripcion: plantilla.descripcion,
          estados: plantilla.estados.length
        },
        datos_nuevos: {
          nombre: actualizaciones.nombre || plantilla.nombre,
          descripcion: actualizaciones.descripcion || plantilla.descripcion,
          estados: actualizaciones.estados?.length || plantilla.estados.length
        }
      };
      
      // Actualizar campos
      Object.assign(plantilla, actualizaciones);
      
      // Actualizar auditoría
      plantilla.auditoria.modificado_por = usuario_id;
      plantilla.auditoria.fecha_modificacion = new Date();
      plantilla.auditoria.version += 1;
      plantilla.auditoria.cambios_historial.push(cambiosHistorial);
      
      const plantillaActualizada = await plantilla.save();
      
      res.json({
        success: true,
        data: plantillaActualizada,
        message: 'Plantilla actualizada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Eliminar plantilla (soft delete)
   */
  async eliminar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      // Verificar si hay registros activos
      const registrosActivos = await Registro.countDocuments({
        plantilla_id: id,
        'metadata.eliminado': false
      });
      
      if (registrosActivos > 0) {
        res.status(400).json({ 
          error: `No se puede eliminar la plantilla. Hay ${registrosActivos} registros activos asociados.` 
        });
        return;
      }
      
      const plantilla = await PlantillaRegistro.findOneAndUpdate(
        {
          _id: id,
          organizacion_id,
          eliminado: false
        },
        {
          eliminado: true,
          fecha_eliminacion: new Date(),
          eliminado_por: usuario_id,
          activo: false
        },
        { new: true }
      );
      
      if (!plantilla) {
        res.status(404).json({ error: 'Plantilla no encontrada' });
        return;
      }
      
      res.json({
        success: true,
        message: 'Plantilla eliminada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Clonar plantilla
   */
  async clonar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, codigo } = req.body;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      const plantillaOriginal = await PlantillaRegistro.findOne({
        _id: id,
        organizacion_id,
        eliminado: false
      });
      
      if (!plantillaOriginal) {
        res.status(404).json({ error: 'Plantilla no encontrada' });
        return;
      }
      
      const nuevoCodigo = codigo || await this.generarCodigoPlantilla(nombre || plantillaOriginal.nombre);
      
      const plantillaClonada = new PlantillaRegistro({
        ...plantillaOriginal.toObject(),
        _id: undefined,
        codigo: nuevoCodigo,
        nombre: nombre || `${plantillaOriginal.nombre} (Copia)`,
        estadisticas: {
          registros_creados: 0,
          ultimo_uso: null,
          usuarios_activos: 0
        },
        auditoria: {
          creado_por: usuario_id,
          fecha_creacion: new Date(),
          version: 1,
          cambios_historial: [{
            fecha: new Date(),
            usuario: usuario_id,
            tipo_cambio: 'clonacion',
            descripcion: `Clonado desde plantilla ${plantillaOriginal.codigo}`,
            datos_anteriores: null,
            datos_nuevos: { plantilla_origen: plantillaOriginal._id }
          }]
        }
      });
      
      const plantillaGuardada = await plantillaClonada.save();
      
      res.status(201).json({
        success: true,
        data: plantillaGuardada,
        message: 'Plantilla clonada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Activar/Desactivar plantilla
   */
  async toggleActivo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const organizacion_id = req.user?.organizacion_id;
      
      const plantilla = await PlantillaRegistro.findOne({
        _id: id,
        organizacion_id,
        eliminado: false
      });
      
      if (!plantilla) {
        res.status(404).json({ error: 'Plantilla no encontrada' });
        return;
      }
      
      plantilla.activo = !plantilla.activo;
      await plantilla.save();
      
      res.json({
        success: true,
        data: { activo: plantilla.activo },
        message: `Plantilla ${plantilla.activo ? 'activada' : 'desactivada'} exitosamente`
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Agregar estado a plantilla
   */
  async agregarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const nuevoEstado = req.body;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      const plantilla = await PlantillaRegistro.findOne({
        _id: id,
        organizacion_id,
        eliminado: false
      });
      
      if (!plantilla) {
        res.status(404).json({ error: 'Plantilla no encontrada' });
        return;
      }
      
      // Asignar ID único al estado y sus campos
      nuevoEstado.id = nuevoEstado.id || uuidv4();
      nuevoEstado.campos = nuevoEstado.campos.map((campo: any) => ({
        ...campo,
        id: campo.id || uuidv4(),
        codigo: campo.codigo || `CAMPO_${uuidv4().substring(0, 8)}`
      }));
      
      // Determinar orden si no se especifica
      if (!nuevoEstado.orden) {
        nuevoEstado.orden = plantilla.estados.length + 1;
      }
      
      plantilla.estados.push(nuevoEstado);
      
      // Actualizar auditoría
      plantilla.auditoria.modificado_por = usuario_id;
      plantilla.auditoria.fecha_modificacion = new Date();
      plantilla.auditoria.cambios_historial.push({
        fecha: new Date(),
        usuario: usuario_id,
        tipo_cambio: 'agregar_estado',
        descripcion: `Estado "${nuevoEstado.nombre}" agregado`,
        datos_anteriores: null,
        datos_nuevos: nuevoEstado
      });
      
      await plantilla.save();
      
      res.status(201).json({
        success: true,
        data: nuevoEstado,
        message: 'Estado agregado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Actualizar estado de plantilla
   */
  async actualizarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, estadoId } = req.params;
      const actualizaciones = req.body;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      const plantilla = await PlantillaRegistro.findOne({
        _id: id,
        organizacion_id,
        eliminado: false
      });
      
      if (!plantilla) {
        res.status(404).json({ error: 'Plantilla no encontrada' });
        return;
      }
      
      const estadoIndex = plantilla.estados.findIndex(e => e.id === estadoId);
      
      if (estadoIndex === -1) {
        res.status(404).json({ error: 'Estado no encontrado' });
        return;
      }
      
      const estadoAnterior = { ...plantilla.estados[estadoIndex] };
      Object.assign(plantilla.estados[estadoIndex], actualizaciones);
      
      // Actualizar auditoría
      plantilla.auditoria.modificado_por = usuario_id;
      plantilla.auditoria.fecha_modificacion = new Date();
      plantilla.auditoria.cambios_historial.push({
        fecha: new Date(),
        usuario: usuario_id,
        tipo_cambio: 'actualizar_estado',
        descripcion: `Estado "${plantilla.estados[estadoIndex].nombre}" actualizado`,
        datos_anteriores: estadoAnterior,
        datos_nuevos: plantilla.estados[estadoIndex]
      });
      
      await plantilla.save();
      
      res.json({
        success: true,
        data: plantilla.estados[estadoIndex],
        message: 'Estado actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Eliminar estado de plantilla
   */
  async eliminarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, estadoId } = req.params;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      const plantilla = await PlantillaRegistro.findOne({
        _id: id,
        organizacion_id,
        eliminado: false
      });
      
      if (!plantilla) {
        res.status(404).json({ error: 'Plantilla no encontrada' });
        return;
      }
      
      // Verificar si hay registros en este estado
      const registrosEnEstado = await Registro.countDocuments({
        plantilla_id: id,
        'estado_actual.id': estadoId,
        'metadata.eliminado': false
      });
      
      if (registrosEnEstado > 0) {
        res.status(400).json({ 
          error: `No se puede eliminar el estado. Hay ${registrosEnEstado} registros en este estado.` 
        });
        return;
      }
      
      const estadoIndex = plantilla.estados.findIndex(e => e.id === estadoId);
      
      if (estadoIndex === -1) {
        res.status(404).json({ error: 'Estado no encontrado' });
        return;
      }
      
      const estadoEliminado = plantilla.estados[estadoIndex];
      plantilla.estados.splice(estadoIndex, 1);
      
      // Reordenar estados restantes
      plantilla.estados.forEach((estado, index) => {
        estado.orden = index + 1;
      });
      
      // Actualizar auditoría
      plantilla.auditoria.modificado_por = usuario_id;
      plantilla.auditoria.fecha_modificacion = new Date();
      plantilla.auditoria.cambios_historial.push({
        fecha: new Date(),
        usuario: usuario_id,
        tipo_cambio: 'eliminar_estado',
        descripcion: `Estado "${estadoEliminado.nombre}" eliminado`,
        datos_anteriores: estadoEliminado,
        datos_nuevos: null
      });
      
      await plantilla.save();
      
      res.json({
        success: true,
        message: 'Estado eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Reordenar estados
   */
  async reordenarEstados(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { estadosOrdenados } = req.body; // Array de IDs en el nuevo orden
      const organizacion_id = req.user?.organizacion_id;
      
      const plantilla = await PlantillaRegistro.findOne({
        _id: id,
        organizacion_id,
        eliminado: false
      });
      
      if (!plantilla) {
        res.status(404).json({ error: 'Plantilla no encontrada' });
        return;
      }
      
      // Reordenar estados según el nuevo orden
      const estadosReordenados = estadosOrdenados.map((estadoId: string, index: number) => {
        const estado = plantilla.estados.find(e => e.id === estadoId);
        if (estado) {
          estado.orden = index + 1;
        }
        return estado;
      }).filter(Boolean);
      
      plantilla.estados = estadosReordenados;
      await plantilla.save();
      
      res.json({
        success: true,
        data: plantilla.estados,
        message: 'Estados reordenados exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Validar plantilla
   */
  async validar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const organizacion_id = req.user?.organizacion_id;
      
      const plantilla = await PlantillaRegistro.findOne({
        _id: id,
        organizacion_id,
        eliminado: false
      });
      
      if (!plantilla) {
        res.status(404).json({ error: 'Plantilla no encontrada' });
        return;
      }
      
      const errores: string[] = [];
      const advertencias: string[] = [];
      
      // Validar que hay al menos un estado
      if (plantilla.estados.length === 0) {
        errores.push('La plantilla debe tener al menos un estado');
      }
      
      // Validar que hay un estado inicial
      const tieneInicial = plantilla.estados.some(e => e.es_inicial);
      if (!tieneInicial && plantilla.estados.length > 0) {
        advertencias.push('No hay un estado marcado como inicial. Se usará el primero por defecto.');
      }
      
      // Validar que hay al menos un estado final
      const tieneFinal = plantilla.estados.some(e => e.es_final);
      if (!tieneFinal) {
        advertencias.push('No hay estados marcados como finales');
      }
      
      // Validar transiciones
      plantilla.estados.forEach(estado => {
        if (estado.transiciones_permitidas.length === 0 && !estado.es_final) {
          advertencias.push(`El estado "${estado.nombre}" no tiene transiciones definidas`);
        }
        
        // Validar que cada transición apunta a un estado válido
        estado.transiciones_permitidas.forEach(transicion => {
          const estadoDestino = plantilla.estados.find(e => e.id === transicion.estado_destino_id);
          if (!estadoDestino) {
            errores.push(`Transición inválida en estado "${estado.nombre}": estado destino no existe`);
          }
        });
        
        // Validar campos
        if (estado.campos.length === 0) {
          advertencias.push(`El estado "${estado.nombre}" no tiene campos definidos`);
        }
      });
      
      const esValida = errores.length === 0;
      
      res.json({
        success: true,
        data: {
          valida: esValida,
          errores,
          advertencias
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Preview de formulario
   */
  async preview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { estadoId } = req.query;
      const organizacion_id = req.user?.organizacion_id;
      
      const plantilla = await PlantillaRegistro.findOne({
        _id: id,
        organizacion_id,
        eliminado: false
      });
      
      if (!plantilla) {
        res.status(404).json({ error: 'Plantilla no encontrada' });
        return;
      }
      
      let campos;
      
      if (estadoId) {
        const estado = plantilla.estados.find(e => e.id === estadoId);
        campos = estado ? estado.campos : [];
      } else {
        // Devolver todos los campos de todos los estados
        campos = plantilla.estados.flatMap(e => e.campos);
      }
      
      res.json({
        success: true,
        data: {
          plantilla: {
            nombre: plantilla.nombre,
            descripcion: plantilla.descripcion,
            codigo: plantilla.codigo
          },
          campos
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Generar código único para plantilla
   */
  private async generarCodigoPlantilla(nombre: string): Promise<string> {
    const base = nombre
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10);
    
    let codigo = `PLANT-${base}`;
    let contador = 1;
    
    while (await PlantillaRegistro.findOne({ codigo })) {
      codigo = `PLANT-${base}-${contador}`;
      contador++;
    }
    
    return codigo;
  }
}

export default new PlantillaRegistroController();