// ===============================================
// SCRIPT PARA CARGAR DATOS DE PRUEBA CRM
// ===============================================

import { TursoClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const mongodbClient = new TursoClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// Datos de prueba para clientes
const clientesPrueba = [
    {
        nombre: 'Empresa Tecnológica Innovadora S.A.',
        razon_social: 'Empresa Tecnológica Innovadora S.A. de C.V.',
        rfc: 'ETI123456789',
        tipo_cliente: 'activo',
        categoria: 'A',
        direccion: 'Av. Insurgentes Sur 1234',
        ciudad: 'Ciudad de México',
        estado: 'CDMX',
        codigo_postal: '03100',
        pais: 'México',
        telefono: '(55) 1234-5678',
        email: 'contacto@eti.com.mx',
        sitio_web: 'https://www.eti.com.mx',
        representante_legal: 'Ing. Carlos Mendoza',
        zona_venta: 'Centro',
        especialidad_interes: 'Software empresarial',
        observaciones: 'Cliente premium con alto potencial de crecimiento'
    },
    {
        nombre: 'Distribuidora Comercial del Norte',
        razon_social: 'Distribuidora Comercial del Norte S.A.',
        rfc: 'DCN987654321',
        tipo_cliente: 'potencial',
        categoria: 'B',
        direccion: 'Blvd. Constitución 567',
        ciudad: 'Monterrey',
        estado: 'Nuevo León',
        codigo_postal: '64000',
        pais: 'México',
        telefono: '(81) 9876-5432',
        email: 'ventas@dcn.com.mx',
        sitio_web: 'https://www.dcn.com.mx',
        representante_legal: 'Lic. Ana Rodríguez',
        zona_venta: 'Norte',
        especialidad_interes: 'Logística y distribución',
        observaciones: 'Prospecto interesado en soluciones de logística'
    },
    {
        nombre: 'Servicios Profesionales Integrales',
        razon_social: 'Servicios Profesionales Integrales S.C.',
        rfc: 'SPI456789123',
        tipo_cliente: 'activo',
        categoria: 'A',
        direccion: 'Calle Reforma 890',
        ciudad: 'Guadalajara',
        estado: 'Jalisco',
        codigo_postal: '44100',
        pais: 'México',
        telefono: '(33) 4567-8901',
        email: 'info@spi.com.mx',
        sitio_web: 'https://www.spi.com.mx',
        representante_legal: 'C.P. Roberto Silva',
        zona_venta: 'Occidente',
        especialidad_interes: 'Consultoría empresarial',
        observaciones: 'Cliente establecido con proyectos recurrentes'
    },
    {
        nombre: 'Manufacturas del Sureste',
        razon_social: 'Manufacturas del Sureste S.A. de C.V.',
        rfc: 'MDS321654987',
        tipo_cliente: 'potencial',
        categoria: 'C',
        direccion: 'Carretera Mérida-Cancún Km 15',
        ciudad: 'Mérida',
        estado: 'Yucatán',
        codigo_postal: '97000',
        pais: 'México',
        telefono: '(999) 2345-6789',
        email: 'contacto@mds.com.mx',
        sitio_web: 'https://www.mds.com.mx',
        representante_legal: 'Ing. María González',
        zona_venta: 'Sureste',
        especialidad_interes: 'Manufactura y producción',
        observaciones: 'Nuevo prospecto en evaluación'
    },
    {
        nombre: 'Consultores Asociados del Pacífico',
        razon_social: 'Consultores Asociados del Pacífico S.C.',
        rfc: 'CAP789123456',
        tipo_cliente: 'inactivo',
        categoria: 'B',
        direccion: 'Av. Costera Miguel Alemán 234',
        ciudad: 'Acapulco',
        estado: 'Guerrero',
        codigo_postal: '39300',
        pais: 'México',
        telefono: '(744) 3456-7890',
        email: 'admin@cap.com.mx',
        sitio_web: 'https://www.cap.com.mx',
        representante_legal: 'Lic. Fernando Torres',
        zona_venta: 'Pacífico',
        especialidad_interes: 'Consultoría turística',
        observaciones: 'Cliente inactivo por falta de respuesta'
    }
];

// Función para generar ID único
function generarId() {
    return 'CLI-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Función para cargar clientes de prueba
async function cargarClientesPrueba() {
    try {
        console.log('🚀 Iniciando carga de datos de prueba CRM...');

        // Verificar si ya existen clientes
        const clientesExistentes = await mongodbClient.execute({
            sql: 'SELECT COUNT(*) as count FROM clientes WHERE organization_id = 1'
        });

        if (clientesExistentes.rows[0].count > 0) {
            console.log('⚠️ Ya existen clientes en la base de datos. Saltando carga...');
            return;
        }

        console.log('📝 Insertando clientes de prueba...');

        for (const cliente of clientesPrueba) {
            const clienteId = generarId();
            const now = new Date().toISOString();

            await mongodbClient.execute({
                sql: `INSERT INTO clientes (
          id, organization_id, nombre, razon_social, rfc, tipo_cliente, categoria,
          direccion, ciudad, estado, codigo_postal, pais, telefono, email, sitio_web,
          representante_legal, zona_venta, especialidad_interes, observaciones,
          fecha_registro, created_at, updated_at, created_by, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    clienteId, 1, cliente.nombre, cliente.razon_social, cliente.rfc,
                    cliente.tipo_cliente, cliente.categoria, cliente.direccion, cliente.ciudad,
                    cliente.estado, cliente.codigo_postal, cliente.pais, cliente.telefono,
                    cliente.email, cliente.sitio_web, cliente.representante_legal,
                    cliente.zona_venta, cliente.especialidad_interes, cliente.observaciones,
                    now, now, now, 'Sistema', 1
                ]
            });

            console.log(`✅ Cliente creado: ${cliente.nombre}`);
        }

        console.log('🎉 Carga de clientes de prueba completada exitosamente');

        // Mostrar estadísticas
        const totalClientes = await mongodbClient.execute({
            sql: 'SELECT COUNT(*) as total FROM clientes WHERE organization_id = 1'
        });

        const clientesPorTipo = await mongodbClient.execute({
            sql: `SELECT tipo_cliente, COUNT(*) as count 
            FROM clientes 
            WHERE organization_id = 1 
            GROUP BY tipo_cliente`
        });

        const clientesPorCategoria = await mongodbClient.execute({
            sql: `SELECT categoria, COUNT(*) as count 
            FROM clientes 
            WHERE organization_id = 1 
            GROUP BY categoria`
        });

        console.log('\n📊 Estadísticas de clientes cargados:');
        console.log(`Total de clientes: ${totalClientes.rows[0].total}`);

        console.log('\nPor tipo de cliente:');
        clientesPorTipo.rows.forEach(row => {
            console.log(`  ${row.tipo_cliente}: ${row.count}`);
        });

        console.log('\nPor categoría:');
        clientesPorCategoria.rows.forEach(row => {
            console.log(`  ${row.categoria}: ${row.count}`);
        });

    } catch (error) {
        console.error('❌ Error cargando datos de prueba:', error);
        throw error;
    }
}

// Función principal
async function main() {
    try {
        await cargarClientesPrueba();
        console.log('\n✅ Script de carga de datos CRM completado');
    } catch (error) {
        console.error('❌ Error en el script:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { cargarClientesPrueba };
