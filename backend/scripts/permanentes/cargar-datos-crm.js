#!/usr/bin/env node

// ===============================================
// SCRIPT: CARGAR DATOS DE PRUEBA CRM
// Fecha: 19-08-2025
// Objetivo: Cargar datos de prueba para el sistema CRM
// ===============================================

const mongoClient = require('../../lib/mongoClient.js');
const crypto = require('crypto');

console.log('🚀 Iniciando carga de datos de prueba para CRM...\n');

// Función para generar UUID
const generateUUID = () => crypto.randomUUID();

// Función para generar fecha aleatoria
const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Función para obtener vendedores existentes
const getVendedores = async () => {
  try {
    const result = await mongoClient.execute({
      sql: 'SELECT id, nombres, apellidos FROM personal WHERE organization_id = 1 AND is_active = 1 LIMIT 5',
      args: []
    });
    
    if (result.rows.length === 0) {
      // Si no hay vendedores, crear uno por defecto
      const vendedorId = generateUUID();
      await mongoClient.execute({
        sql: `INSERT INTO personal (
          id, organization_id, nombres, apellidos, email, telefono, 
          documento_identidad, fecha_nacimiento, nacionalidad, direccion, 
          telefono_emergencia, fecha_contratacion, numero_legajo, estado, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          vendedorId, 1, 'Vendedor', 'Demo', 'vendedor@demo.com', '+52 55 1234 5678',
          'VEND001', '1990-01-01', 'Mexicana', 'Av. Demo 123, CDMX',
          '+52 55 9876 5432', '2024-01-01', 'V001', 'Activo',
          new Date().toISOString(), new Date().toISOString()
        ]
      });
      
      return [{ id: vendedorId, nombres: 'Vendedor', apellidos: 'Demo' }];
    }
    
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo vendedores:', error);
    throw error;
  }
};

// Función para generar datos de clientes
const generateClientes = (count = 20) => {
  const clientes = [];
  const nombres = [
    'Empresa Tecnológica Innovadora',
    'Consultoría Estratégica Global',
    'Manufactura Industrial Avanzada',
    'Servicios Financieros Premium',
    'Logística y Distribución Express',
    'Desarrollo de Software Especializado',
    'Consultoría en Calidad ISO',
    'Servicios de Mantenimiento Industrial',
    'Comercialización de Productos',
    'Servicios de Capacitación Empresarial',
    'Gestión de Proyectos Integral',
    'Servicios de Auditoría Externa',
    'Desarrollo de Aplicaciones Web',
    'Consultoría en Procesos',
    'Servicios de Outsourcing',
    'Gestión de Recursos Humanos',
    'Servicios de Marketing Digital',
    'Consultoría en Seguridad',
    'Desarrollo de Productos',
    'Servicios de Soporte Técnico'
  ];

  const ciudades = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro', 'Tijuana', 'Mérida', 'Cancún'];
  const estados = ['CDMX', 'Jalisco', 'Nuevo León', 'Puebla', 'Querétaro', 'Baja California', 'Yucatán', 'Quintana Roo'];
  const tipos = ['potencial', 'activo', 'inactivo'];
  const categorias = ['A', 'B', 'C'];

  for (let i = 0; i < count; i++) {
    const tipo = tipos[i % tipos.length];
    const categoria = categorias[i % categorias.length];
    const ciudad = ciudades[i % ciudades.length];
    const estado = estados[i % estados.length];

    clientes.push({
      id: generateUUID(),
      organization_id: 1,
      nombre: nombres[i % nombres.length] + (i > 0 ? ` ${i + 1}` : ''),
      razon_social: nombres[i % nombres.length] + (i > 0 ? ` ${i + 1}` : '') + ' S.A. de C.V.',
      rfc: `ABC${String(i + 1).padStart(6, '0')}XYZ`,
      tipo_cliente: tipo,
      categoria: categoria,
      direccion: `Av. Principal ${i + 1}, Col. Centro`,
      ciudad: ciudad,
      estado: estado,
      codigo_postal: `${String(10000 + i).padStart(5, '0')}`,
      pais: 'México',
      telefono: `+52 55 ${String(1000 + i).padStart(4, '0')} ${String(1000 + i).padStart(4, '0')}`,
      email: `contacto@${nombres[i % nombres.length].toLowerCase().replace(/\s+/g, '')}${i + 1}.com`,
      sitio_web: `https://www.${nombres[i % nombres.length].toLowerCase().replace(/\s+/g, '')}${i + 1}.com`,
      representante_legal: `Lic. Juan Pérez ${i + 1}`,
      fecha_registro: generateRandomDate(new Date('2024-01-01'), new Date()),
      fecha_ultimo_contacto: generateRandomDate(new Date('2024-06-01'), new Date()),
      vendedor_asignado_id: null, // Se asignará después
      supervisor_comercial_id: null,
      zona_venta: `${estado} - Zona ${i % 3 + 1}`,
      especialidad_interes: ['Tecnología', 'Consultoría', 'Manufactura', 'Servicios'][i % 4],
      observaciones: `Cliente ${tipo} de categoría ${categoria}. Interesado en servicios de calidad.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'Sistema',
      updated_by: 'Sistema',
      is_active: 1
    });
  }

  return clientes;
};

// Función para generar datos de oportunidades
const generateOportunidades = (clientes, vendedores, count = 30) => {
  const oportunidades = [];
  const titulos = [
    'Implementación de Sistema de Calidad ISO 9001',
    'Consultoría en Procesos de Mejora Continua',
    'Auditoría de Sistema de Gestión',
    'Capacitación en Normas ISO',
    'Desarrollo de Documentación de Calidad',
    'Implementación de Indicadores de Gestión',
    'Optimización de Procesos Productivos',
    'Certificación de Sistema de Calidad',
    'Consultoría en Gestión de Riesgos',
    'Implementación de Mejoras de Calidad'
  ];

  const etapas = ['prospeccion', 'calificacion', 'propuesta', 'negociacion', 'cerrada_ganada', 'cerrada_perdida'];
  const tipos = ['nueva', 'renovacion', 'ampliacion', 'referido'];

  for (let i = 0; i < count; i++) {
    const cliente = clientes[i % clientes.length];
    const vendedor = vendedores[i % vendedores.length];
    const etapa = etapas[i % etapas.length];
    const tipo = tipos[i % tipos.length];
    const probabilidad = [10, 25, 50, 75, 90, 100][i % 6];
    const valor = [50000, 75000, 100000, 150000, 200000, 300000][i % 6];

    oportunidades.push({
      id: generateUUID(),
      organization_id: 1,
      cliente_id: cliente.id,
      vendedor_id: vendedor.id, // Asignar vendedor válido
      supervisor_id: null,
      titulo: titulos[i % titulos.length] + (i > 0 ? ` - Cliente ${i + 1}` : ''),
      descripcion: `Oportunidad de ${tipo} para ${cliente.nombre}. ${titulos[i % titulos.length]}.`,
      tipo_oportunidad: tipo,
      etapa: etapa,
      probabilidad: probabilidad,
      valor_estimado: valor,
      moneda: 'MXN',
      fecha_cierre_esperada: generateRandomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
      fecha_cierre_real: etapa.includes('cerrada') ? generateRandomDate(new Date(), new Date()) : null,
      motivo_cierre: etapa.includes('cerrada') ? ['Ganada por propuesta', 'Perdida por precio', 'Cliente no interesado'][i % 3] : null,
      productos_servicios: 'Servicios de consultoría en calidad ISO 9001',
      competencia: ['Competidor A', 'Competidor B', 'Sin competencia directa'][i % 3],
      recursos_requeridos: 'Consultor senior + 2 consultores junior',
      riesgos: ['Cambio de prioridades del cliente', 'Restricciones presupuestales', 'Timing de implementación'][i % 3],
      estrategia_venta: 'Enfoque en valor agregado y ROI',
      observaciones: `Oportunidad ${etapa} con ${probabilidad}% de probabilidad.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'Sistema',
      updated_by: 'Sistema',
      is_active: 1
    });
  }

  return oportunidades;
};

// Función para generar datos de actividades
const generateActividades = (clientes, oportunidades, vendedores, count = 50) => {
  const actividades = [];
  const tipos = ['llamada', 'email', 'reunion', 'visita', 'propuesta', 'seguimiento'];
  const estados = ['programada', 'en_proceso', 'completada', 'cancelada'];
  const prioridades = ['baja', 'media', 'alta', 'urgente'];

  for (let i = 0; i < count; i++) {
    const cliente = clientes[i % clientes.length];
    const oportunidad = oportunidades[i % oportunidades.length];
    const vendedor = vendedores[i % vendedores.length];
    const tipo = tipos[i % tipos.length];
    const estado = estados[i % estados.length];
    const prioridad = prioridades[i % prioridades.length];

    actividades.push({
      id: generateUUID(),
      organization_id: 1,
      oportunidad_id: oportunidad.id,
      cliente_id: cliente.id,
      vendedor_id: vendedor.id, // Asignar vendedor válido
      tipo_actividad: tipo,
      titulo: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} con ${cliente.nombre}`,
      descripcion: `Actividad de ${tipo} para seguimiento de oportunidad: ${oportunidad.titulo}`,
      fecha_actividad: generateRandomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      duracion_minutos: [15, 30, 45, 60, 90, 120][i % 6],
      estado: estado,
      resultado: estado === 'completada' ? 'Actividad completada exitosamente' : null,
      proxima_accion: estado === 'completada' ? 'Programar siguiente seguimiento' : 'Completar actividad programada',
      fecha_proxima_accion: estado === 'completada' ? generateRandomDate(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) : null,
      prioridad: prioridad,
      ubicacion: tipo === 'visita' ? cliente.direccion : 'Oficina / Remoto',
      participantes: `Vendedor + ${cliente.representante_legal}`,
      adjuntos: tipo === 'propuesta' ? 'Propuesta comercial v1.0.pdf' : null,
      observaciones: `Actividad ${estado} de prioridad ${prioridad}.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'Sistema',
      updated_by: 'Sistema',
      is_active: 1
    });
  }

  return actividades;
};

// Función principal
async function cargarDatosCRM() {
  try {
    console.log('📊 1. Obteniendo vendedores existentes...');
    const vendedores = await getVendedores();
    console.log(`✅ Obtenidos ${vendedores.length} vendedores`);

    console.log('\n📊 2. Generando datos de clientes...');
    const clientes = generateClientes(20);
    console.log(`✅ Generados ${clientes.length} clientes`);

    console.log('\n📊 3. Generando datos de oportunidades...');
    const oportunidades = generateOportunidades(clientes, vendedores, 30);
    console.log(`✅ Generadas ${oportunidades.length} oportunidades`);

    console.log('\n📊 4. Generando datos de actividades...');
    const actividades = generateActividades(clientes, oportunidades, vendedores, 50);
    console.log(`✅ Generadas ${actividades.length} actividades`);

    console.log('\n📊 5. Insertando clientes en base de datos...');
    for (const cliente of clientes) {
      await mongoClient.execute({
        sql: `INSERT INTO clientes (
          id, organization_id, nombre, razon_social, rfc, tipo_cliente, categoria,
          direccion, ciudad, estado, codigo_postal, pais, telefono, email, sitio_web,
          representante_legal, fecha_registro, fecha_ultimo_contacto, vendedor_asignado_id,
          supervisor_comercial_id, zona_venta, especialidad_interes, observaciones,
          created_at, updated_at, created_by, updated_by, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          cliente.id, cliente.organization_id, cliente.nombre, cliente.razon_social,
          cliente.rfc, cliente.tipo_cliente, cliente.categoria, cliente.direccion,
          cliente.ciudad, cliente.estado, cliente.codigo_postal, cliente.pais,
          cliente.telefono, cliente.email, cliente.sitio_web, cliente.representante_legal,
          cliente.fecha_registro, cliente.fecha_ultimo_contacto, cliente.vendedor_asignado_id,
          cliente.supervisor_comercial_id, cliente.zona_venta, cliente.especialidad_interes,
          cliente.observaciones, cliente.created_at, cliente.updated_at,
          cliente.created_by, cliente.updated_by, cliente.is_active
        ]
      });
    }
    console.log(`✅ Insertados ${clientes.length} clientes`);

    console.log('\n📊 6. Insertando oportunidades en base de datos...');
    for (const oportunidad of oportunidades) {
      await mongoClient.execute({
        sql: `INSERT INTO oportunidades (
          id, organization_id, cliente_id, vendedor_id, supervisor_id, titulo,
          descripcion, tipo_oportunidad, etapa, probabilidad, valor_estimado, moneda,
          fecha_cierre_esperada, fecha_cierre_real, motivo_cierre, productos_servicios,
          competencia, recursos_requeridos, riesgos, estrategia_venta, observaciones,
          created_at, updated_at, created_by, updated_by, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          oportunidad.id, oportunidad.organization_id, oportunidad.cliente_id,
          oportunidad.vendedor_id, oportunidad.supervisor_id, oportunidad.titulo,
          oportunidad.descripcion, oportunidad.tipo_oportunidad, oportunidad.etapa,
          oportunidad.probabilidad, oportunidad.valor_estimado, oportunidad.moneda,
          oportunidad.fecha_cierre_esperada, oportunidad.fecha_cierre_real,
          oportunidad.motivo_cierre, oportunidad.productos_servicios, oportunidad.competencia,
          oportunidad.recursos_requeridos, oportunidad.riesgos, oportunidad.estrategia_venta,
          oportunidad.observaciones, oportunidad.created_at, oportunidad.updated_at,
          oportunidad.created_by, oportunidad.updated_by, oportunidad.is_active
        ]
      });
    }
    console.log(`✅ Insertadas ${oportunidades.length} oportunidades`);

    console.log('\n📊 7. Insertando actividades en base de datos...');
    for (const actividad of actividades) {
      await mongoClient.execute({
        sql: `INSERT INTO actividades_crm (
          id, organization_id, oportunidad_id, cliente_id, vendedor_id, tipo_actividad,
          titulo, descripcion, fecha_actividad, duracion_minutos, estado, resultado,
          proxima_accion, fecha_proxima_accion, prioridad, ubicacion, participantes,
          adjuntos, observaciones, created_at, updated_at, created_by, updated_by, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          actividad.id, actividad.organization_id, actividad.oportunidad_id,
          actividad.cliente_id, actividad.vendedor_id, actividad.tipo_actividad,
          actividad.titulo, actividad.descripcion, actividad.fecha_actividad,
          actividad.duracion_minutos, actividad.estado, actividad.resultado,
          actividad.proxima_accion, actividad.fecha_proxima_accion, actividad.prioridad,
          actividad.ubicacion, actividad.participantes, actividad.adjuntos,
          actividad.observaciones, actividad.created_at, actividad.updated_at,
          actividad.created_by, actividad.updated_by, actividad.is_active
        ]
      });
    }
    console.log(`✅ Insertadas ${actividades.length} actividades`);

    console.log('\n📊 8. Verificando datos insertados...');
    
    // Verificar clientes
    const clientesCount = await mongoClient.execute({
      sql: 'SELECT COUNT(*) as count FROM clientes WHERE organization_id = 1 AND is_active = 1',
      args: []
    });
    console.log(`📋 Total clientes en BD: ${clientesCount.rows[0].count}`);

    // Verificar oportunidades
    const oportunidadesCount = await mongoClient.execute({
      sql: 'SELECT COUNT(*) as count FROM oportunidades WHERE organization_id = 1 AND is_active = 1',
      args: []
    });
    console.log(`📋 Total oportunidades en BD: ${oportunidadesCount.rows[0].count}`);

    // Verificar actividades
    const actividadesCount = await mongoClient.execute({
      sql: 'SELECT COUNT(*) as count FROM actividades_crm WHERE organization_id = 1 AND is_active = 1',
      args: []
    });
    console.log(`📋 Total actividades en BD: ${actividadesCount.rows[0].count}`);

    // Estadísticas por tipo de cliente
    const statsClientes = await mongoClient.execute({
      sql: `SELECT tipo_cliente, COUNT(*) as count 
            FROM clientes 
            WHERE organization_id = 1 AND is_active = 1 
            GROUP BY tipo_cliente`,
      args: []
    });
    console.log('\n📊 Distribución de clientes por tipo:');
    statsClientes.rows.forEach(row => {
      console.log(`   - ${row.tipo_cliente}: ${row.count}`);
    });

    // Estadísticas por etapa de oportunidad
    const statsOportunidades = await mongoClient.execute({
      sql: `SELECT etapa, COUNT(*) as count, SUM(valor_estimado) as valor_total
            FROM oportunidades 
            WHERE organization_id = 1 AND is_active = 1 
            GROUP BY etapa`,
      args: []
    });
    console.log('\n📊 Distribución de oportunidades por etapa:');
    statsOportunidades.rows.forEach(row => {
      console.log(`   - ${row.etapa}: ${row.count} ($${row.valor_total?.toLocaleString() || 0})`);
    });

    console.log('\n🎉 ¡Carga de datos CRM completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`   - Clientes: ${clientes.length}`);
    console.log(`   - Oportunidades: ${oportunidades.length}`);
    console.log(`   - Actividades: ${actividades.length}`);
    console.log('\n🚀 El CRM ahora tiene datos de prueba para funcionar correctamente.');

  } catch (error) {
    console.error('❌ Error durante la carga de datos:', error);
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  cargarDatosCRM()
    .then(() => {
      console.log('\n✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { cargarDatosCRM, generateClientes, generateOportunidades, generateActividades };
