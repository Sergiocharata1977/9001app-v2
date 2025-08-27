#!/usr/bin/env ts-node

/**
 * Script de inserción de datos en MongoDB Local
 * Sistema de Gestión de Calidad ISO 9001
 * 
 * Este script inserta datos de ejemplo en MongoDB local para pruebas
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Importar modelos
import Organizacion from '../models/Organizacion';
import Usuario from '../models/Usuario';
import Departamento from '../models/Departamento';
import Proceso from '../models/Proceso';

// Importar tipos
import {
  IOrganizacion,
  IUsuario,
  IDepartamento,
  IProceso
} from '../types/database.types';

// Configurar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configuración de MongoDB Local
const MONGODB_URI = 'mongodb://localhost:27017/9001app-v2-local';

class DataInserterLocal {
  private logger: Console;

  constructor() {
    this.logger = console;
  }

  async connect(): Promise<void> {
    try {
      this.logger.log('🔌 Conectando a MongoDB Local...');
      await mongoose.connect(MONGODB_URI);
      this.logger.log('✅ MongoDB Local conectado exitosamente');
    } catch (error) {
      this.logger.error('❌ Error conectando a MongoDB Local:', error);
      this.logger.log('💡 Asegúrate de tener MongoDB ejecutándose localmente');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this.logger.log('🔌 MongoDB desconectado');
    } catch (error) {
      this.logger.error('❌ Error desconectando MongoDB:', error);
    }
  }

  async limpiarBaseDatos(): Promise<void> {
    try {
      this.logger.log('🧹 Limpiando base de datos...');
      
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Base de datos no conectada');
      }
      
      const collections = await db.listCollections().toArray();
      
      for (const collection of collections) {
        await db.collection(collection.name).deleteMany({});
        this.logger.log(`🗑️  Colección ${collection.name} limpiada`);
      }
      
      this.logger.log('✅ Base de datos limpiada exitosamente');
    } catch (error) {
      this.logger.error('❌ Error limpiando base de datos:', error);
      throw error;
    }
  }

  async insertarOrganizaciones(): Promise<IOrganizacion[]> {
    try {
      this.logger.log('🏢 Insertando organizaciones...');

      const organizaciones: Partial<IOrganizacion>[] = [
        {
          nombre: 'TechCorp Solutions S.A.',
          ruc: '20123456789',
          direccion: 'Av. Arequipa 123, Lima',
          telefono: '+51 1 234-5678',
          email: 'contacto@techcorp.com',
          representante: 'Ing. Carlos Mendoza',
          estado: 'activo',
          plan: 'enterprise',
          configuracion: {
            colores: {
              primario: '#2563eb',
              secundario: '#64748b'
            },
            modulos: [
              'usuarios', 'procesos', 'documentos', 'auditorias',
              'hallazgos', 'acciones', 'indicadores', 'mediciones',
              'capacitaciones', 'evaluaciones', 'productos', 'encuestas', 'minutas'
            ]
          }
        },
        {
          nombre: 'Industrias del Norte E.I.R.L.',
          ruc: '20187654321',
          direccion: 'Calle Los Pinos 456, Trujillo',
          telefono: '+51 44 987-6543',
          email: 'info@industriasnorte.com',
          representante: 'Lic. María González',
          estado: 'activo',
          plan: 'premium',
          configuracion: {
            colores: {
              primario: '#059669',
              secundario: '#6b7280'
            },
            modulos: [
              'usuarios', 'procesos', 'documentos', 'auditorias',
              'hallazgos', 'acciones', 'indicadores', 'mediciones'
            ]
          }
        },
        {
          nombre: 'Servicios Integrales del Sur S.A.C.',
          ruc: '20111222333',
          direccion: 'Jr. San Martín 789, Arequipa',
          telefono: '+51 54 123-4567',
          email: 'ventas@serviciosur.com',
          representante: 'Dr. Roberto Silva',
          estado: 'activo',
          plan: 'basico',
          configuracion: {
            colores: {
              primario: '#dc2626',
              secundario: '#9ca3af'
            },
            modulos: [
              'usuarios', 'procesos', 'documentos', 'auditorias'
            ]
          }
        }
      ];

      const organizacionesInsertadas = await Organizacion.insertMany(organizaciones);
      this.logger.log(`✅ ${organizacionesInsertadas.length} organizaciones insertadas`);
      
      return organizacionesInsertadas as IOrganizacion[];
    } catch (error) {
      this.logger.error('❌ Error insertando organizaciones:', error);
      throw error;
    }
  }

  async insertarDepartamentos(organizaciones: IOrganizacion[]): Promise<IDepartamento[]> {
    try {
      this.logger.log('🏢 Insertando departamentos...');

      const departamentos: Partial<IDepartamento>[] = [];

      for (const org of organizaciones) {
        const deptosPorOrg = [
          {
            nombre: 'Dirección General',
            descripcion: 'Dirección estratégica de la organización',
            jerarquia: 1,
            color: '#1e40af'
          },
          {
            nombre: 'Recursos Humanos',
            descripcion: 'Gestión del capital humano',
            jerarquia: 2,
            color: '#059669'
          },
          {
            nombre: 'Operaciones',
            descripcion: 'Gestión de operaciones principales',
            jerarquia: 3,
            color: '#dc2626'
          },
          {
            nombre: 'Calidad',
            descripcion: 'Sistema de gestión de calidad',
            jerarquia: 4,
            color: '#7c3aed'
          },
          {
            nombre: 'Finanzas',
            descripcion: 'Gestión financiera y contable',
            jerarquia: 5,
            color: '#ea580c'
          },
          {
            nombre: 'Tecnología',
            descripcion: 'Sistemas y tecnología de la información',
            jerarquia: 6,
            color: '#0891b2'
          },
          {
            nombre: 'Comercial',
            descripcion: 'Ventas y marketing',
            jerarquia: 7,
            color: '#be185d'
          }
        ];

        deptosPorOrg.forEach(depto => {
          departamentos.push({
            ...depto,
            organizacionId: org._id,
            estado: 'activo'
          });
        });
      }

      const departamentosInsertados = await Departamento.insertMany(departamentos);
      this.logger.log(`✅ ${departamentosInsertados.length} departamentos insertados`);
      
      return departamentosInsertados as IDepartamento[];
    } catch (error) {
      this.logger.error('❌ Error insertando departamentos:', error);
      throw error;
    }
  }

  async insertarUsuarios(organizaciones: IOrganizacion[], departamentos: IDepartamento[]): Promise<IUsuario[]> {
    try {
      this.logger.log('👥 Insertando usuarios...');

      const usuarios: Partial<IUsuario>[] = [];
      const passwordHash = await bcrypt.hash('password123', 10);

      for (const org of organizaciones) {
        const deptosOrg = departamentos.filter(d => d.organizacionId.toString() === org._id?.toString());
        
        // Usuario administrador
        usuarios.push({
          organizacionId: org._id,
          nombre: 'Admin',
          apellido: org.nombre.split(' ')[0],
          email: `admin@${org.nombre.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          password: passwordHash,
          rol: 'admin',
          departamentoId: deptosOrg.find(d => d.nombre === 'Dirección General')?._id,
          puesto: 'Administrador del Sistema',
          telefono: '+51 999 999 999',
          estado: 'activo',
          permisos: [
            'usuarios.crear', 'usuarios.editar', 'usuarios.eliminar', 'usuarios.ver',
            'procesos.crear', 'procesos.editar', 'procesos.eliminar', 'procesos.ver',
            'documentos.crear', 'documentos.editar', 'documentos.eliminar', 'documentos.ver',
            'auditorias.crear', 'auditorias.editar', 'auditorias.eliminar', 'auditorias.ver',
            'hallazgos.crear', 'hallazgos.editar', 'hallazgos.eliminar', 'hallazgos.ver',
            'acciones.crear', 'acciones.editar', 'acciones.eliminar', 'acciones.ver',
            'indicadores.crear', 'indicadores.editar', 'indicadores.eliminar', 'indicadores.ver',
            'mediciones.crear', 'mediciones.editar', 'mediciones.eliminar', 'mediciones.ver',
            'capacitaciones.crear', 'capacitaciones.editar', 'capacitaciones.eliminar', 'capacitaciones.ver',
            'evaluaciones.crear', 'evaluaciones.editar', 'evaluaciones.eliminar', 'evaluaciones.ver',
            'productos.crear', 'productos.editar', 'productos.eliminar', 'productos.ver',
            'encuestas.crear', 'encuestas.editar', 'encuestas.eliminar', 'encuestas.ver',
            'minutas.crear', 'minutas.editar', 'minutas.eliminar', 'minutas.ver',
            'reportes.ver', 'configuracion.editar'
          ]
        });

        // Usuarios adicionales
        const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Roberto', 'Patricia'];
        const apellidos = ['García', 'López', 'Martínez', 'Rodríguez', 'González', 'Pérez', 'Sánchez', 'Ramírez'];
        const puestos = ['Supervisor', 'Analista', 'Coordinador', 'Especialista', 'Técnico'];

        for (let i = 0; i < 5; i++) {
          const nombre = nombres[Math.floor(Math.random() * nombres.length)];
          const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
          const puesto = puestos[Math.floor(Math.random() * puestos.length)];
          const depto = deptosOrg[Math.floor(Math.random() * deptosOrg.length)];
          const rol = i === 0 ? 'supervisor' : 'usuario';

          usuarios.push({
            organizacionId: org._id,
            nombre,
            apellido,
            email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@${org.nombre.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            password: passwordHash,
            rol,
            departamentoId: depto._id,
            puesto,
            telefono: `+51 9${Math.floor(Math.random() * 90000000) + 10000000}`,
            estado: 'activo',
            permisos: [
              'procesos.ver', 'documentos.ver', 'auditorias.ver', 'hallazgos.ver',
              'acciones.ver', 'indicadores.ver', 'mediciones.ver', 'capacitaciones.ver',
              'evaluaciones.ver', 'productos.ver', 'encuestas.ver', 'minutas.ver'
            ]
          });
        }
      }

      const usuariosInsertados = await Usuario.insertMany(usuarios);
      this.logger.log(`✅ ${usuariosInsertados.length} usuarios insertados`);
      
      return usuariosInsertados as IUsuario[];
    } catch (error) {
      this.logger.error('❌ Error insertando usuarios:', error);
      throw error;
    }
  }

  async insertarProcesos(organizaciones: IOrganizacion[], departamentos: IDepartamento[], usuarios: IUsuario[]): Promise<IProceso[]> {
    try {
      this.logger.log('⚙️ Insertando procesos...');

      const procesos: Partial<IProceso>[] = [];

      const tiposProcesos = [
        {
          nombre: 'Gestión de Recursos Humanos',
          codigo: 'RH-001',
          tipo: 'soporte' as const,
          descripcion: 'Proceso de gestión integral del capital humano',
          entrada: ['Solicitudes de personal', 'Evaluaciones de desempeño'],
          salida: ['Contratos laborales', 'Reportes de personal'],
          recursos: ['Sistema de RRHH', 'Personal especializado'],
          riesgos: ['Rotación alta de personal', 'Falta de capacitación']
        },
        {
          nombre: 'Gestión de Calidad',
          codigo: 'CAL-001',
          tipo: 'gestión' as const,
          descripcion: 'Sistema de gestión de calidad ISO 9001',
          entrada: ['Requisitos del cliente', 'Normas aplicables'],
          salida: ['Productos conformes', 'Mejoras continuas'],
          recursos: ['Sistema de calidad', 'Auditores internos'],
          riesgos: ['No conformidades', 'Incumplimiento de normas']
        },
        {
          nombre: 'Desarrollo de Productos',
          codigo: 'PROD-001',
          tipo: 'principal' as const,
          descripcion: 'Proceso de diseño y desarrollo de productos',
          entrada: ['Especificaciones del cliente', 'Requisitos técnicos'],
          salida: ['Productos terminados', 'Documentación técnica'],
          recursos: ['Equipos de desarrollo', 'Especialistas técnicos'],
          riesgos: ['Retrasos en entregas', 'Defectos en productos']
        },
        {
          nombre: 'Ventas y Marketing',
          codigo: 'VENT-001',
          tipo: 'principal' as const,
          descripcion: 'Proceso de comercialización y promoción',
          entrada: ['Leads comerciales', 'Estrategias de mercado'],
          salida: ['Ventas realizadas', 'Clientes satisfechos'],
          recursos: ['Equipo comercial', 'Herramientas de marketing'],
          riesgos: ['Pérdida de clientes', 'Competencia agresiva']
        },
        {
          nombre: 'Gestión Financiera',
          codigo: 'FIN-001',
          tipo: 'soporte' as const,
          descripcion: 'Proceso de gestión financiera y contable',
          entrada: ['Transacciones comerciales', 'Presupuestos'],
          salida: ['Estados financieros', 'Reportes contables'],
          recursos: ['Sistema contable', 'Personal financiero'],
          riesgos: ['Errores contables', 'Falta de liquidez']
        }
      ];

      for (const org of organizaciones) {
        const deptosOrg = departamentos.filter(d => d.organizacionId.toString() === org._id?.toString());
        const usuariosOrg = usuarios.filter(u => u.organizacionId.toString() === org._id?.toString());

        tiposProcesos.forEach((proceso, index) => {
          const depto = deptosOrg.find(d => d.nombre.includes(proceso.tipo === 'principal' ? 'Operaciones' : proceso.tipo === 'gestión' ? 'Calidad' : 'Recursos Humanos')) || deptosOrg[0];
          const responsable = usuariosOrg.find(u => u.rol === 'supervisor') || usuariosOrg[0];

          procesos.push({
            organizacionId: org._id,
            nombre: proceso.nombre,
            descripcion: proceso.descripcion,
            codigo: `${proceso.codigo}-${org.nombre.substring(0, 3).toUpperCase()}`,
            departamentoId: depto._id,
            responsableId: responsable._id,
            tipo: proceso.tipo,
            estado: 'activo',
            version: '1.0',
            entrada: proceso.entrada,
            salida: proceso.salida,
            recursos: proceso.recursos,
            riesgos: proceso.riesgos,
            indicadores: [],
            documentos: []
          });
        });
      }

      const procesosInsertados = await Proceso.insertMany(procesos);
      this.logger.log(`✅ ${procesosInsertados.length} procesos insertados`);
      
      return procesosInsertados as IProceso[];
    } catch (error) {
      this.logger.error('❌ Error insertando procesos:', error);
      throw error;
    }
  }

  async ejecutar(): Promise<void> {
    try {
      this.logger.log('🚀 Iniciando inserción de datos en MongoDB Local...');
      this.logger.log('📊 Base de datos: MongoDB Local');
      this.logger.log('🔧 Lenguaje: TypeScript');
      this.logger.log('❌ Turso: ELIMINADO COMPLETAMENTE');

      // Conectar a MongoDB
      await this.connect();

      // Limpiar base de datos
      await this.limpiarBaseDatos();

      // Insertar datos en orden
      const organizaciones = await this.insertarOrganizaciones();
      const departamentos = await this.insertarDepartamentos(organizaciones);
      const usuarios = await this.insertarUsuarios(organizaciones, departamentos);
      const procesos = await this.insertarProcesos(organizaciones, departamentos, usuarios);

      // Mostrar resumen
      this.logger.log('\n📈 RESUMEN DE INSERCIÓN:');
      this.logger.log(`🏢 Organizaciones: ${organizaciones.length}`);
      this.logger.log(`🏢 Departamentos: ${departamentos.length}`);
      this.logger.log(`👥 Usuarios: ${usuarios.length}`);
      this.logger.log(`⚙️ Procesos: ${procesos.length}`);
      this.logger.log('\n✅ Inserción completada exitosamente');
      this.logger.log('🎯 MongoDB Local configurado y funcionando correctamente');
      this.logger.log('❌ Turso eliminado completamente del sistema');

    } catch (error) {
      this.logger.error('❌ Error durante la inserción:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  const inserter = new DataInserterLocal();
  inserter.ejecutar()
    .then(() => {
      console.log('🎉 Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el script:', error);
      process.exit(1);
    });
}

export default DataInserterLocal;