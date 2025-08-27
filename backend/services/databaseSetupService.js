const mongodbClient = require('../lib/mongodbClient');

class DatabaseSetupService {
    constructor() {
        this.mongodbClient = mongodbClient;
    }

    /**
     * Crear tabla personalizada
     */
    async createTable(tableName, columns) {
        try {
            const columnDefinitions = columns.map(col => 
                `${col.name} ${col.type}${col.primary ? ' PRIMARY KEY' : ''}${col.autoIncrement ? ' AUTOINCREMENT' : ''}${col.notNull ? ' NOT NULL' : ''}${col.unique ? ' UNIQUE' : ''}${col.default ? ` DEFAULT ${col.default}` : ''}`
            ).join(', ');

            const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions})`;
            
            const result = await this.mongodbClient.execute(query);
            return {
                success: true,
                message: `Tabla ${tableName} creada exitosamente`,
                result
            };
        } catch (error) {
            console.error('Error creando tabla:', error);
            return {
                success: false,
                message: `Error creando tabla ${tableName}: ${error.message}`,
                error: error.message
            };
        }
    }

    /**
     * Crear índice
     */
    async createIndex(tableName, indexName, columns) {
        try {
            const columnList = Array.isArray(columns) ? columns.join(', ') : columns;
            const query = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName} (${columnList})`;
            
            const result = await this.mongodbClient.execute(query);
            return {
                success: true,
                message: `Índice ${indexName} creado exitosamente`,
                result
            };
        } catch (error) {
            console.error('Error creando índice:', error);
            return {
                success: false,
                message: `Error creando índice ${indexName}: ${error.message}`,
                error: error.message
            };
        }
    }

    /**
     * Insertar datos
     */
    async insertData(tableName, data) {
        try {
            const columns = Object.keys(data);
            const values = Object.values(data);
            const placeholders = values.map(() => '?').join(', ');
            
            const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
            
            const result = await this.mongodbClient.execute(query, values);
            return {
                success: true,
                message: `Datos insertados en ${tableName} exitosamente`,
                result
            };
        } catch (error) {
            console.error('Error insertando datos:', error);
            return {
                success: false,
                message: `Error insertando datos en ${tableName}: ${error.message}`,
                error: error.message
            };
        }
    }

    /**
     * Verificar si tabla existe
     */
    async tableExists(tableName) {
        try {
            const query = `SELECT name FROM sqlite_master WHERE type='table' AND name=?`;
            const result = await this.mongodbClient.query(query, [tableName]);
            return {
                exists: result.length > 0,
                success: true,
                message: result.length > 0 ? `Tabla ${tableName} existe` : `Tabla ${tableName} no existe`
            };
        } catch (error) {
            console.error('Error verificando tabla:', error);
            return {
                exists: false,
                success: false,
                message: `Error verificando tabla ${tableName}: ${error.message}`,
                error: error.message
            };
        }
    }

    /**
     * Obtener estructura de tabla
     */
    async getTableStructure(tableName) {
        try {
            const query = `PRAGMA table_info(${tableName})`;
            const result = await this.mongodbClient.query(query);
            return {
                success: true,
                structure: result,
                message: `Estructura de tabla ${tableName} obtenida`
            };
        } catch (error) {
            console.error('Error obteniendo estructura:', error);
            return {
                success: false,
                message: `Error obteniendo estructura de ${tableName}: ${error.message}`,
                error: error.message
            };
        }
    }

    /**
     * Configuración predefinida para CRM
     */
    async setupCRM() {
        const results = [];

        // Verificar tablas existentes antes de crear
        const tablesToCheck = ['clientes_agro', 'oportunidades_agro', 'contactos', 'crm_analisis_riesgo'];
        
        for (const tableName of tablesToCheck) {
            const exists = await this.tableExists(tableName);
            if (exists.exists) {
                console.log(`✅ Tabla ${tableName} ya existe, saltando creación`);
                results.push({
                    success: true,
                    message: `Tabla ${tableName} ya existe`,
                    skipped: true
                });
                continue;
            }
        }

        // 1. Crear tabla clientes_agro (solo si no existe)
        const clientesExists = await this.tableExists('clientes_agro');
        if (!clientesExists.exists) {
            const clientesColumns = [
                { name: 'id', type: 'INTEGER', primary: true, autoIncrement: true },
                { name: 'nombre', type: 'TEXT', notNull: true },
                { name: 'tipo_cliente', type: 'TEXT', notNull: true },
                { name: 'sector', type: 'TEXT' },
                { name: 'tamanio', type: 'TEXT' },
                { name: 'ubicacion', type: 'TEXT' },
                { name: 'contacto_principal', type: 'TEXT' },
                { name: 'telefono', type: 'TEXT' },
                { name: 'email', type: 'TEXT' },
                { name: 'estado', type: 'TEXT', default: "'Activo'" },
                { name: 'fecha_registro', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
                { name: 'notas', type: 'TEXT' }
            ];
            results.push(await this.createTable('clientes_agro', clientesColumns));
        }

        // 2. Crear tabla oportunidades_agro (solo si no existe)
        const oportunidadesExists = await this.tableExists('oportunidades_agro');
        if (!oportunidadesExists.exists) {
            const oportunidadesColumns = [
                { name: 'id', type: 'INTEGER', primary: true, autoIncrement: true },
                { name: 'cliente_id', type: 'INTEGER', notNull: true },
                { name: 'titulo', type: 'TEXT', notNull: true },
                { name: 'descripcion', type: 'TEXT' },
                { name: 'valor_estimado', type: 'REAL' },
                { name: 'etapa', type: 'TEXT', notNull: true },
                { name: 'probabilidad', type: 'INTEGER' },
                { name: 'fecha_cierre_esperada', type: 'DATE' },
                { name: 'fuente', type: 'TEXT' },
                { name: 'estado', type: 'TEXT', default: "'Activa'" },
                { name: 'fecha_creacion', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
                { name: 'notas', type: 'TEXT' }
            ];
            results.push(await this.createTable('oportunidades_agro', oportunidadesColumns));
        }

        // 3. Crear tabla contactos (solo si no existe)
        const contactosExists = await this.tableExists('contactos');
        if (!contactosExists.exists) {
            const contactosColumns = [
                { name: 'id', type: 'INTEGER', primary: true, autoIncrement: true },
                { name: 'cliente_id', type: 'INTEGER', notNull: true },
                { name: 'nombre', type: 'TEXT', notNull: true },
                { name: 'cargo', type: 'TEXT' },
                { name: 'telefono', type: 'TEXT' },
                { name: 'email', type: 'TEXT' },
                { name: 'tipo_contacto', type: 'TEXT' },
                { name: 'es_decision_maker', type: 'BOOLEAN', default: '0' },
                { name: 'fecha_registro', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
                { name: 'notas', type: 'TEXT' }
            ];
            results.push(await this.createTable('contactos', contactosColumns));
        }

        // 4. Crear tabla crm_analisis_riesgo (solo si no existe)
        const analisisRiesgoExists = await this.tableExists('crm_analisis_riesgo');
        if (!analisisRiesgoExists.exists) {
            const analisisRiesgoColumns = [
                { name: 'id', type: 'INTEGER', primary: true, autoIncrement: true },
                { name: 'organization_id', type: 'TEXT', notNull: true },
                { name: 'cliente_id', type: 'INTEGER', notNull: true },
                { name: 'fecha_analisis', type: 'DATE', notNull: true },
                { name: 'periodo_analisis', type: 'TEXT', notNull: true },
                { name: 'puntaje_riesgo', type: 'INTEGER', notNull: true },
                { name: 'categoria_riesgo', type: 'TEXT', notNull: true },
                { name: 'capacidad_pago', type: 'REAL', default: '0' },
                { name: 'ingresos_mensuales', type: 'REAL', default: '0' },
                { name: 'gastos_mensuales', type: 'REAL', default: '0' },
                { name: 'margen_utilidad', type: 'REAL', default: '0' },
                { name: 'liquidez', type: 'REAL', default: '0' },
                { name: 'solvencia', type: 'REAL', default: '0' },
                { name: 'endeudamiento', type: 'REAL', default: '0' },
                { name: 'recomendaciones', type: 'TEXT' },
                { name: 'observaciones', type: 'TEXT' },
                { name: 'estado', type: 'TEXT', default: "'identificado'" },
                { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
                { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
                { name: 'created_by', type: 'TEXT' },
                { name: 'updated_by', type: 'TEXT' },
                { name: 'is_active', type: 'INTEGER', default: '1' }
            ];
            results.push(await this.createTable('crm_analisis_riesgo', analisisRiesgoColumns));
        }

        // 5. Crear índices
        results.push(await this.createIndex('clientes_agro', 'idx_clientes_nombre', 'nombre'));
        results.push(await this.createIndex('oportunidades_agro', 'idx_oportunidades_cliente', 'cliente_id'));
        results.push(await this.createIndex('contactos', 'idx_contactos_cliente', 'cliente_id'));
        results.push(await this.createIndex('crm_analisis_riesgo', 'idx_analisis_cliente', 'cliente_id'));
        results.push(await this.createIndex('crm_analisis_riesgo', 'idx_analisis_fecha', 'fecha_analisis'));

        return {
            success: results.every(r => r.success),
            results,
            message: 'Configuración CRM completada'
        };
    }

    /**
     * Insertar datos de ejemplo CRM
     */
    async insertCRMData() {
        const results = [];

        // Datos de clientes
        const clientes = [
            {
                nombre: 'Agroindustrias del Norte S.A.',
                tipo_cliente: 'Empresa',
                sector: 'Agricultura',
                tamanio: 'Grande',
                ubicacion: 'Norte del país',
                contacto_principal: 'Juan Pérez',
                telefono: '+54 11 1234-5678',
                email: 'juan.perez@agronorte.com',
                notas: 'Gran productor de maíz, 2500 hectáreas'
            },
            {
                nombre: 'Hortalizas Frescas del Valle',
                tipo_cliente: 'Empresa',
                sector: 'Horticultura',
                tamanio: 'Mediano',
                ubicacion: 'Valle Central',
                contacto_principal: 'María González',
                telefono: '+54 11 2345-6789',
                email: 'maria@hortalizasvalle.com',
                notas: 'Productor de hortalizas, 150 hectáreas'
            },
            {
                nombre: 'Cooperativa Campesina Unidos',
                tipo_cliente: 'Cooperativa',
                sector: 'Agricultura',
                tamanio: 'Mediano',
                ubicacion: 'Zona Sur',
                contacto_principal: 'Carlos Rodríguez',
                telefono: '+54 11 3456-7890',
                email: 'carlos@coopunidos.org',
                notas: 'Cooperativa con 25 socios, 500 hectáreas'
            }
        ];

        for (const cliente of clientes) {
            results.push(await this.insertData('clientes_agro', cliente));
        }

        // Datos de oportunidades
        const oportunidades = [
            {
                cliente_id: 1,
                titulo: 'Sistema de Riego Inteligente',
                descripcion: 'Implementación de sistema de riego automatizado con sensores',
                valor_estimado: 2500000,
                etapa: 'Negociación',
                probabilidad: 75,
                fecha_cierre_esperada: '2024-06-30',
                fuente: 'Referencia',
                notas: 'Proyecto de alta prioridad para el cliente'
            },
            {
                cliente_id: 2,
                titulo: 'Fertilizantes Orgánicos',
                descripcion: 'Suministro de fertilizantes orgánicos certificados',
                valor_estimado: 450000,
                etapa: 'Propuesta Técnica',
                probabilidad: 60,
                fecha_cierre_esperada: '2024-05-15',
                fuente: 'Feria Agrícola',
                notas: 'Cliente interesado en productos orgánicos'
            }
        ];

        for (const oportunidad of oportunidades) {
            results.push(await this.insertData('oportunidades_agro', oportunidad));
        }

        return {
            success: results.every(r => r.success),
            results,
            message: 'Datos de ejemplo CRM insertados'
        };
    }
}

module.exports = DatabaseSetupService;
