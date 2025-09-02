import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Registro, { IRegistro } from '../models/Registro';
import PlantillaRegistro from '../models/PlantillaRegistro';
import NumeracionService from '../services/NumeracionService';
import { v4 as uuidv4 } from 'uuid';

export class RegistroController {
  /**
   * Crear nuevo registro
   */
  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plantilla_id, datos_iniciales, responsable_principal, fecha_limite } = req.body;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      if (!organizacion_id) {
        res.status(400).json({ error: 'Organización no identificada' });
        return;
      }
      
      // Obtener la plantilla
      const plantilla = await PlantillaRegistro.findOne({
        _id: plantilla_id,
        organizacion_id,
        activo: true,
        eliminado: false
      });
      
      if (!plantilla) {
        res.status(404).json({ error: 'Plantilla no encontrada o inactiva' });
        return;
      }
      
      // Generar código único
      const codigo = await NumeracionService.generarCodigoRegistro(plantilla_id, organizacion_id);
      
      // Obtener estado inicial
      const estadoInicial = plantilla.estados.find(e => e.es_inicial) || plantilla.estados[0];
      
      if (!estadoInicial) {
        res.status(400).json({ error: 'La plantilla no tiene estados definidos' });
        return;
      }
      
      // Crear el registro
      const nuevoRegistro = new Registro({
        codigo,
        plantilla_id,
        organizacion_id,
        estado_actual: {
          id: estadoInicial.id,
          nombre: estadoInicial.nombre,
          color: estadoInicial.color,
          fecha_entrada: new Date(),
          usuario_cambio: usuario_id
        },
        datos: new Map(Object.entries(datos_iniciales || {})),
        responsable_principal: responsable_principal || usuario_id,
        fecha_limite,
        metadata: {
          creado_por: usuario_id,
          fecha_creacion: new Date()
        },
        actividad: [{
          tipo: 'creacion',
          descripcion: 'Registro creado',
          usuario: usuario_id,
          fecha: new Date(),
          detalles: {
            plantilla: plantilla.nombre,
            estado_inicial: estadoInicial.nombre
          }
        }]
      });
      
      const registroGuardado = await nuevoRegistro.save();
      
      // Actualizar estadísticas de la plantilla
      await PlantillaRegistro.findByIdAndUpdate(plantilla_id, {
        $inc: { 'estadisticas.registros_creados': 1 },
        $set: { 'estadisticas.ultimo_uso': new Date() }
      });
      
      // Ejecutar acciones automáticas del estado inicial
      await this.ejecutarAccionesAutomaticas(registroGuardado, estadoInicial, 'al_crear');
      
      res.status(201).json({
        success: true,
        data: registroGuardado,
        message: 'Registro creado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Listar registros con filtros
   */
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizacion_id = req.user?.organizacion_id;
      const { 
        plantilla_id,
        estado,
        responsable,
        prioridad,
        vencidos,
        busqueda,
        fecha_desde,
        fecha_hasta,
        pagina = 1,
        limite = 20,
        ordenar_por = 'fecha_creacion',
        orden = 'desc'
      } = req.query;
      
      const filtro: any = {
        organizacion_id,
        'metadata.eliminado': false
      };
      
      if (plantilla_id) {
        filtro.plantilla_id = plantilla_id;
      }
      
      if (estado) {
        filtro['estado_actual.id'] = estado;
      }
      
      if (responsable) {
        filtro.responsable_principal = responsable;
      }
      
      if (prioridad) {
        filtro.prioridad = prioridad;
      }
      
      if (vencidos === 'true') {
        filtro.esta_vencido = true;
      }
      
      if (busqueda) {
        filtro.$or = [
          { codigo: { $regex: busqueda, $options: 'i' } },
          { 'estado_actual.nombre': { $regex: busqueda, $options: 'i' } }
        ];
      }
      
      if (fecha_desde || fecha_hasta) {
        filtro['metadata.fecha_creacion'] = {};
        if (fecha_desde) {
          filtro['metadata.fecha_creacion'].$gte = new Date(fecha_desde as string);
        }
        if (fecha_hasta) {
          filtro['metadata.fecha_creacion'].$lte = new Date(fecha_hasta as string);
        }
      }
      
      const skip = (Number(pagina) - 1) * Number(limite);
      const ordenamiento: any = {};
      ordenamiento[ordenar_por as string] = orden === 'asc' ? 1 : -1;
      
      const [registros, total] = await Promise.all([
        Registro.find(filtro)
          .populate('plantilla_id', 'nombre codigo configuracion_visual')
          .populate('responsable_principal', 'nombre email avatar')
          .populate('metadata.creado_por', 'nombre')
          .sort(ordenamiento)
          .skip(skip)
          .limit(Number(limite)),
        Registro.countDocuments(filtro)
      ]);
      
      res.json({
        success: true,
        data: registros,
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
   * Obtener vista Kanban (agrupado por estados)
   */
  async vistaKanban(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plantillaId } = req.params;
      const organizacion_id = req.user?.organizacion_id;
      const { filtros } = req.query;
      
      // Obtener la plantilla
      const plantilla = await PlantillaRegistro.findOne({
        _id: plantillaId,
        organizacion_id,
        eliminado: false
      });
      
      if (!plantilla) {
        res.status(404).json({ error: 'Plantilla no encontrada' });
        return;
      }
      
      // Preparar la estructura de columnas (estados)
      const columnas = plantilla.estados.map(estado => ({
        id: estado.id,
        nombre: estado.nombre,
        color: estado.color,
        orden: estado.orden,
        registros: [] as any[]
      }));
      
      // Obtener todos los registros de esta plantilla
      const filtroRegistros: any = {
        plantilla_id: plantillaId,
        organizacion_id,
        'metadata.eliminado': false
      };
      
      // Aplicar filtros adicionales si existen
      if (filtros) {
        const filtrosObj = JSON.parse(filtros as string);
        Object.assign(filtroRegistros, filtrosObj);
      }
      
      const registros = await Registro.find(filtroRegistros)
        .populate('responsable_principal', 'nombre email avatar')
        .populate('responsables_secundarios', 'nombre email avatar')
        .sort({ 'metadata.fecha_creacion': -1 });
      
      // Agrupar registros por estado
      registros.forEach(registro => {
        const columna = columnas.find(c => c.id === registro.estado_actual.id);
        if (columna) {
          // Preparar datos para la tarjeta
          const tarjeta = {
            _id: registro._id,
            codigo: registro.codigo,
            estado_actual: registro.estado_actual,
            responsable_principal: registro.responsable_principal,
            prioridad: registro.prioridad,
            fecha_limite: registro.fecha_limite,
            esta_vencido: registro.esta_vencido,
            progreso: registro.progreso,
            etiquetas: registro.etiquetas,
            // Campos visibles en tarjeta
            campos_tarjeta: this.obtenerCamposTarjeta(registro, plantilla, registro.estado_actual.id),
            // Métricas
            dias_abierto: registro.dias_abierto,
            comentarios_count: registro.comentarios.length,
            archivos_count: registro.archivos.length,
            checklist_completado: this.calcularChecklistCompletado(registro.checklist)
          };
          
          columna.registros.push(tarjeta);
        }
      });
      
      // Estadísticas por columna
      const estadisticas = columnas.map(columna => ({
        estado_id: columna.id,
        total: columna.registros.length,
        vencidos: columna.registros.filter(r => r.esta_vencido).length,
        urgentes: columna.registros.filter(r => r.prioridad === 'urgente').length
      }));
      
      res.json({
        success: true,
        data: {
          columnas,
          estadisticas,
          total_registros: registros.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Obtener registro por ID
   */
  async obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const organizacion_id = req.user?.organizacion_id;
      
      const registro = await Registro.findOne({
        _id: id,
        organizacion_id,
        'metadata.eliminado': false
      })
      .populate('plantilla_id')
      .populate('responsable_principal', 'nombre email avatar telefono')
      .populate('responsables_secundarios', 'nombre email avatar')
      .populate('observadores', 'nombre email')
      .populate('metadata.creado_por', 'nombre email')
      .populate('metadata.modificado_por', 'nombre email')
      .populate('comentarios.usuario', 'nombre email avatar')
      .populate('actividad.usuario', 'nombre');
      
      if (!registro) {
        res.status(404).json({ error: 'Registro no encontrado' });
        return;
      }
      
      res.json({
        success: true,
        data: registro
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Actualizar datos del registro
   */
  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { datos, responsable_principal, fecha_limite, prioridad, etiquetas } = req.body;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      const registro = await Registro.findOne({
        _id: id,
        organizacion_id,
        'metadata.eliminado': false
      });
      
      if (!registro) {
        res.status(404).json({ error: 'Registro no encontrado' });
        return;
      }
      
      // Verificar si el registro está bloqueado
      if (registro.bloqueado && registro.bloqueado_por?.toString() !== usuario_id) {
        res.status(423).json({ 
          error: 'Registro bloqueado por otro usuario',
          bloqueado_por: registro.bloqueado_por
        });
        return;
      }
      
      // Actualizar datos
      if (datos) {
        Object.entries(datos).forEach(([key, value]) => {
          registro.datos.set(key, value);
        });
      }
      
      if (responsable_principal !== undefined) {
        const responsableAnterior = registro.responsable_principal;
        registro.responsable_principal = responsable_principal;
        
        // Registrar cambio de asignación
        registro.actividad.push({
          tipo: 'asignacion',
          descripcion: `Responsable cambiado`,
          usuario: usuario_id,
          fecha: new Date(),
          detalles: {
            responsable_anterior: responsableAnterior,
            responsable_nuevo: responsable_principal
          }
        });
      }
      
      if (fecha_limite !== undefined) {
        registro.fecha_limite = fecha_limite;
      }
      
      if (prioridad !== undefined) {
        registro.prioridad = prioridad;
      }
      
      if (etiquetas !== undefined) {
        registro.etiquetas = etiquetas;
      }
      
      // Actualizar metadata
      registro.metadata.modificado_por = usuario_id;
      registro.metadata.fecha_modificacion = new Date();
      registro.fecha_ultimo_cambio = new Date();
      
      // Registrar actividad
      registro.actividad.push({
        tipo: 'edicion',
        descripcion: 'Datos actualizados',
        usuario: usuario_id,
        fecha: new Date(),
        detalles: {
          campos_modificados: Object.keys(datos || {})
        }
      });
      
      // Validar datos según el estado actual
      const esValido = await registro.validarDatos();
      
      const registroActualizado = await registro.save();
      
      res.json({
        success: true,
        data: registroActualizado,
        validacion: { valido: esValido },
        message: 'Registro actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Cambiar estado del registro (mover entre columnas)
   */
  async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { nuevo_estado_id, comentario, validar_transicion = true } = req.body;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      const registro = await Registro.findOne({
        _id: id,
        organizacion_id,
        'metadata.eliminado': false
      }).populate('plantilla_id');
      
      if (!registro) {
        res.status(404).json({ error: 'Registro no encontrado' });
        return;
      }
      
      const plantilla = registro.plantilla_id as any;
      
      // Validar que el nuevo estado existe
      const nuevoEstado = plantilla.estados.find((e: any) => e.id === nuevo_estado_id);
      
      if (!nuevoEstado) {
        res.status(400).json({ error: 'Estado destino no válido' });
        return;
      }
      
      // Validar transición si se requiere
      if (validar_transicion) {
        const esTransicionValida = plantilla.validarTransicion(
          registro.estado_actual.id,
          nuevo_estado_id,
          Object.fromEntries(registro.datos)
        );
        
        if (!esTransicionValida) {
          res.status(400).json({ 
            error: 'Transición no permitida',
            estado_actual: registro.estado_actual.nombre,
            estado_destino: nuevoEstado.nombre
          });
          return;
        }
      }
      
      // Cambiar estado
      await registro.cambiarEstado(nuevo_estado_id, comentario, usuario_id);
      
      // Ejecutar acciones automáticas
      await this.ejecutarAccionesAutomaticas(registro, nuevoEstado, 'al_entrar');
      
      // Si el estado es final, marcar como completado
      if (nuevoEstado.es_final) {
        registro.fecha_completado = new Date();
        await registro.save();
      }
      
      res.json({
        success: true,
        data: registro,
        message: `Estado cambiado a ${nuevoEstado.nombre}`
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Obtener estados permitidos para transición
   */
  async obtenerEstadosPermitidos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const organizacion_id = req.user?.organizacion_id;
      
      const registro = await Registro.findOne({
        _id: id,
        organizacion_id,
        'metadata.eliminado': false
      }).populate('plantilla_id');
      
      if (!registro) {
        res.status(404).json({ error: 'Registro no encontrado' });
        return;
      }
      
      const plantilla = registro.plantilla_id as any;
      const estadoActual = plantilla.estados.find((e: any) => e.id === registro.estado_actual.id);
      
      if (!estadoActual) {
        res.status(500).json({ error: 'Estado actual no encontrado en plantilla' });
        return;
      }
      
      // Obtener estados permitidos según las transiciones
      const estadosPermitidos = estadoActual.transiciones_permitidas
        .map((t: any) => {
          const estado = plantilla.estados.find((e: any) => e.id === t.estado_destino_id);
          if (estado) {
            return {
              id: estado.id,
              nombre: estado.nombre,
              color: estado.color,
              requiere_comentario: t.requiere_comentario,
              condiciones: t.condiciones
            };
          }
          return null;
        })
        .filter(Boolean);
      
      res.json({
        success: true,
        data: {
          estado_actual: {
            id: estadoActual.id,
            nombre: estadoActual.nombre,
            color: estadoActual.color
          },
          estados_permitidos: estadosPermitidos
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Agregar comentario
   */
  async agregarComentario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { texto, archivos, menciones, respuesta_a } = req.body;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      const registro = await Registro.findOne({
        _id: id,
        organizacion_id,
        'metadata.eliminado': false
      });
      
      if (!registro) {
        res.status(404).json({ error: 'Registro no encontrado' });
        return;
      }
      
      const nuevoComentario = {
        id: uuidv4(),
        texto,
        usuario: usuario_id,
        fecha: new Date(),
        editado: false,
        archivos: archivos || [],
        menciones: menciones || [],
        respuesta_a
      };
      
      registro.comentarios.push(nuevoComentario);
      
      // Registrar actividad
      registro.actividad.push({
        tipo: 'comentario',
        descripcion: 'Comentario agregado',
        usuario: usuario_id,
        fecha: new Date(),
        detalles: {
          comentario_id: nuevoComentario.id,
          tiene_archivos: archivos?.length > 0,
          tiene_menciones: menciones?.length > 0
        }
      });
      
      await registro.save();
      
      // Notificar a los mencionados
      if (menciones && menciones.length > 0) {
        await registro.notificar('mencion_comentario', menciones);
      }
      
      res.status(201).json({
        success: true,
        data: nuevoComentario,
        message: 'Comentario agregado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Subir archivo
   */
  async subirArchivo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { campo_id, descripcion } = req.body;
      const archivo = req.file;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      if (!archivo) {
        res.status(400).json({ error: 'No se proporcionó archivo' });
        return;
      }
      
      const registro = await Registro.findOne({
        _id: id,
        organizacion_id,
        'metadata.eliminado': false
      });
      
      if (!registro) {
        res.status(404).json({ error: 'Registro no encontrado' });
        return;
      }
      
      const nuevoArchivo = {
        campo_id,
        nombre: archivo.filename,
        nombre_original: archivo.originalname,
        url: `/uploads/${archivo.filename}`,
        tipo: archivo.mimetype,
        tamaño: archivo.size,
        fecha_carga: new Date(),
        usuario_carga: usuario_id,
        descripcion
      };
      
      registro.archivos.push(nuevoArchivo);
      
      // Registrar actividad
      registro.actividad.push({
        tipo: 'archivo',
        descripcion: 'Archivo subido',
        usuario: usuario_id,
        fecha: new Date(),
        detalles: {
          nombre_archivo: archivo.originalname,
          tipo: archivo.mimetype,
          tamaño: archivo.size
        }
      });
      
      await registro.save();
      
      res.status(201).json({
        success: true,
        data: nuevoArchivo,
        message: 'Archivo subido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Gestionar checklist
   */
  async actualizarChecklist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { checklist } = req.body;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      const registro = await Registro.findOne({
        _id: id,
        organizacion_id,
        'metadata.eliminado': false
      });
      
      if (!registro) {
        res.status(404).json({ error: 'Registro no encontrado' });
        return;
      }
      
      // Actualizar o agregar items del checklist
      checklist.forEach((item: any) => {
        const existente = registro.checklist.find(c => c.id === item.id);
        
        if (existente) {
          // Actualizar existente
          Object.assign(existente, item);
          if (item.completado && !existente.completado) {
            existente.usuario_completo = usuario_id;
            existente.fecha_completo = new Date();
          }
        } else {
          // Agregar nuevo
          registro.checklist.push({
            ...item,
            id: item.id || uuidv4(),
            usuario_completo: item.completado ? usuario_id : undefined,
            fecha_completo: item.completado ? new Date() : undefined
          });
        }
      });
      
      // Recalcular progreso
      registro.calcularMetricas();
      
      await registro.save();
      
      res.json({
        success: true,
        data: registro.checklist,
        progreso: registro.progreso,
        message: 'Checklist actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Bloquear/Desbloquear registro
   */
  async toggleBloqueo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      const registro = await Registro.findOne({
        _id: id,
        organizacion_id,
        'metadata.eliminado': false
      });
      
      if (!registro) {
        res.status(404).json({ error: 'Registro no encontrado' });
        return;
      }
      
      if (registro.bloqueado) {
        // Desbloquear
        registro.bloqueado = false;
        registro.bloqueado_por = undefined;
        registro.fecha_bloqueo = undefined;
        registro.motivo_bloqueo = undefined;
        
        res.json({
          success: true,
          message: 'Registro desbloqueado exitosamente'
        });
      } else {
        // Bloquear
        registro.bloqueado = true;
        registro.bloqueado_por = usuario_id;
        registro.fecha_bloqueo = new Date();
        registro.motivo_bloqueo = motivo;
        
        res.json({
          success: true,
          message: 'Registro bloqueado exitosamente'
        });
      }
      
      await registro.save();
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Clonar registro
   */
  async clonar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { codigo_personalizado } = req.body;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      const registroOriginal = await Registro.findOne({
        _id: id,
        organizacion_id,
        'metadata.eliminado': false
      });
      
      if (!registroOriginal) {
        res.status(404).json({ error: 'Registro no encontrado' });
        return;
      }
      
      // Generar nuevo código
      const codigo = codigo_personalizado || 
        await NumeracionService.generarCodigoRegistro(
          registroOriginal.plantilla_id.toString(),
          organizacion_id
        );
      
      const registroClonado = new Registro({
        ...registroOriginal.toObject(),
        _id: undefined,
        codigo,
        estado_actual: {
          ...registroOriginal.estado_actual,
          fecha_entrada: new Date(),
          usuario_cambio: usuario_id
        },
        historial_estados: [],
        comentarios: [],
        actividad: [{
          tipo: 'creacion',
          descripcion: `Clonado desde registro ${registroOriginal.codigo}`,
          usuario: usuario_id,
          fecha: new Date(),
          detalles: {
            registro_origen: registroOriginal._id
          }
        }],
        archivos: [],
        checklist: registroOriginal.checklist.map(item => ({
          ...item,
          completado: false,
          usuario_completo: undefined,
          fecha_completo: undefined
        })),
        metricas: {
          tiempo_total_dias: 0,
          tiempo_total_horas: 0,
          tiempo_por_estado: new Map(),
          veces_reenviado: 0,
          veces_rechazado: 0,
          cumplimiento_tiempo: true,
          porcentaje_completado: 0,
          campos_completados: 0,
          campos_totales: 0,
          eficiencia: 100
        },
        metadata: {
          creado_por: usuario_id,
          fecha_creacion: new Date(),
          eliminado: false
        },
        version: 1,
        versiones_anteriores: [],
        bloqueado: false,
        progreso: 0,
        dias_abierto: 0,
        esta_vencido: false
      });
      
      const registroGuardado = await registroClonado.save();
      
      res.status(201).json({
        success: true,
        data: registroGuardado,
        message: 'Registro clonado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Archivar registro (soft delete)
   */
  async archivar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const organizacion_id = req.user?.organizacion_id;
      const usuario_id = req.user?.id;
      
      const registro = await Registro.findOne({
        _id: id,
        organizacion_id,
        'metadata.eliminado': false
      });
      
      if (!registro) {
        res.status(404).json({ error: 'Registro no encontrado' });
        return;
      }
      
      await registro.archivar();
      registro.metadata.eliminado_por = usuario_id;
      await registro.save();
      
      res.json({
        success: true,
        message: 'Registro archivado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Exportar registros
   */
  async exportar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizacion_id = req.user?.organizacion_id;
      const { formato = 'excel', plantilla_id, filtros } = req.query;
      
      const filtro: any = {
        organizacion_id,
        'metadata.eliminado': false
      };
      
      if (plantilla_id) {
        filtro.plantilla_id = plantilla_id;
      }
      
      if (filtros) {
        Object.assign(filtro, JSON.parse(filtros as string));
      }
      
      const registros = await Registro.find(filtro)
        .populate('plantilla_id', 'nombre')
        .populate('responsable_principal', 'nombre email')
        .sort({ 'metadata.fecha_creacion': -1 });
      
      if (formato === 'excel') {
        // Implementar exportación a Excel
        // Usar librería como exceljs
        res.json({
          success: true,
          message: 'Exportación a Excel en desarrollo',
          total: registros.length
        });
      } else if (formato === 'pdf') {
        // Implementar exportación a PDF
        // Usar librería como puppeteer o pdfkit
        res.json({
          success: true,
          message: 'Exportación a PDF en desarrollo',
          total: registros.length
        });
      } else {
        // Exportar como JSON
        res.json({
          success: true,
          data: registros,
          total: registros.length
        });
      }
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Métodos auxiliares privados
   */
  
  private obtenerCamposTarjeta(registro: any, plantilla: any, estadoId: string): any {
    const estado = plantilla.estados.find((e: any) => e.id === estadoId);
    if (!estado) return {};
    
    const camposTarjeta: any = {};
    
    estado.campos
      .filter((campo: any) => campo.visible_tarjeta)
      .sort((a: any, b: any) => a.orden_tarjeta - b.orden_tarjeta)
      .forEach((campo: any) => {
        const valor = registro.datos.get(campo.id);
        if (valor !== undefined && valor !== null) {
          camposTarjeta[campo.etiqueta] = valor;
        }
      });
    
    return camposTarjeta;
  }
  
  private calcularChecklistCompletado(checklist: any[]): number {
    if (!checklist || checklist.length === 0) return 0;
    
    const completados = checklist.filter(item => item.completado).length;
    return Math.round((completados / checklist.length) * 100);
  }
  
  private async ejecutarAccionesAutomaticas(
    registro: any,
    estado: any,
    trigger: string
  ): Promise<void> {
    const acciones = estado.acciones_automaticas?.filter(
      (a: any) => a.trigger === trigger && a.activa
    ) || [];
    
    for (const accion of acciones) {
      try {
        switch (accion.tipo) {
          case 'enviar_email':
            // Implementar envío de email
            console.log(`Email enviado para registro ${registro.codigo}`);
            break;
            
          case 'asignar_usuario':
            if (accion.configuracion.usuario_id) {
              registro.responsable_principal = accion.configuracion.usuario_id;
              await registro.save();
            }
            break;
            
          case 'calcular_campo':
            // Implementar cálculo de campo
            break;
            
          case 'crear_tarea':
            // Implementar creación de tarea
            break;
            
          case 'webhook':
            // Implementar llamada a webhook
            if (accion.configuracion.url) {
              // await axios.post(accion.configuracion.url, { registro });
            }
            break;
        }
      } catch (error) {
        console.error(`Error ejecutando acción automática: ${error}`);
      }
    }
  }
}

export default new RegistroController();