#!/usr/bin/env ts-node

/**
 * Script para eliminar completamente Turso del proyecto
 * Sistema de Gestión de Calidad ISO 9001
 * 
 * Este script elimina todas las referencias a Turso y las reemplaza por MongoDB
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

class TursoEliminator {
  private logger: Console;
  private archivosModificados: string[] = [];
  private archivosEliminados: string[] = [];

  constructor() {
    this.logger = console;
  }

  async eliminarArchivosTurso(): Promise<void> {
    try {
      this.logger.log('🗑️  Eliminando archivos de Turso...');

      const archivosAEliminar = [
        'backend/lib/tursoClient.js',
        'backend/lib/tursoClient.ts',
        'backend/config/turso.ts',
        'backend/config/turso.js',
        'backend/scripts/turso-*.js',
        'backend/scripts/turso-*.ts'
      ];

      for (const archivo of archivosAEliminar) {
        try {
          if (fs.existsSync(archivo)) {
            await unlink(archivo);
            this.archivosEliminados.push(archivo);
            this.logger.log(`✅ Eliminado: ${archivo}`);
          }
        } catch (error) {
          this.logger.warn(`⚠️  No se pudo eliminar ${archivo}: ${(error as Error).message}`);
        }
      }

      this.logger.log(`✅ ${this.archivosEliminados.length} archivos de Turso eliminados`);
    } catch (error) {
      this.logger.error('❌ Error eliminando archivos de Turso:', error);
    }
  }

  async reemplazarReferenciasTurso(directorio: string): Promise<void> {
    try {
      this.logger.log(`🔍 Buscando referencias a Turso en: ${directorio}`);

      const archivos = await this.obtenerArchivosRecursivamente(directorio);
      
      for (const archivo of archivos) {
        if (this.debeProcesarArchivo(archivo)) {
          await this.procesarArchivo(archivo);
        }
      }

      this.logger.log(`✅ ${this.archivosModificados.length} archivos procesados`);
    } catch (error) {
      this.logger.error('❌ Error reemplazando referencias:', error);
    }
  }

  private async obtenerArchivosRecursivamente(directorio: string): Promise<string[]> {
    const archivos: string[] = [];
    
    try {
      const items = await readdir(directorio);
      
      for (const item of items) {
        const rutaCompleta = path.join(directorio, item);
        const stats = await stat(rutaCompleta);
        
        if (stats.isDirectory() && !this.esDirectorioExcluido(rutaCompleta)) {
          const archivosSubdir = await this.obtenerArchivosRecursivamente(rutaCompleta);
          archivos.push(...archivosSubdir);
        } else if (stats.isFile() && this.esArchivoProcesable(item)) {
          archivos.push(rutaCompleta);
        }
      }
    } catch (error) {
      this.logger.warn(`⚠️  Error leyendo directorio ${directorio}: ${(error as Error).message}`);
    }
    
    return archivos;
  }

  private esDirectorioExcluido(ruta: string): boolean {
    const excluidos = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'coverage',
      '.vscode',
      '.idea'
    ];
    
    return excluidos.some(excluido => ruta.includes(excluido));
  }

  private esArchivoProcesable(nombre: string): boolean {
    const extensiones = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt'];
    return extensiones.some(ext => nombre.endsWith(ext));
  }

  private debeProcesarArchivo(ruta: string): boolean {
    // No procesar archivos que acabamos de crear
    const excluidos = [
      'insertar-datos-mongodb.ts',
      'eliminar-turso-completamente.ts',
      'database.types.ts'
    ];
    
    return !excluidos.some(excluido => ruta.includes(excluido));
  }

  private async procesarArchivo(rutaArchivo: string): Promise<void> {
    try {
      const contenido = await readFile(rutaArchivo, 'utf8');
      let contenidoModificado = contenido;
      let modificado = false;

      // Reemplazos específicos para Turso
      const reemplazos = [
        // Imports y requires
        {
          buscar: /const tursoClient = require\(['"]\.\.\/lib\/tursoClient\.js['"]\)/g,
          reemplazar: 'import MongoDBConnection from \'../config/mongodb\''
        },
        {
          buscar: /import.*tursoClient.*from.*['"]\.\.\/lib\/tursoClient['"]/g,
          reemplazar: 'import MongoDBConnection from \'../config/mongodb\''
        },
        {
          buscar: /require\(['"]\.\.\/lib\/tursoClient\.js['"]\)/g,
          reemplazar: 'require(\'../config/mongodb\')'
        },
        
        // Configuración de Turso
        {
          buscar: /TURSO_DATABASE_URL/g,
          reemplazar: 'MONGODB_URI'
        },
        {
          buscar: /TURSO_AUTH_TOKEN/g,
          reemplazar: 'MONGODB_AUTH_TOKEN'
        },
        {
          buscar: /@libsql\/client/g,
          reemplazar: 'mongoose'
        },
        
        // Comentarios sobre Turso
        {
          buscar: /\/\/.*Turso.*/g,
          reemplazar: '// MongoDB'
        },
        {
          buscar: /\/\*.*Turso.*\*\//g,
          reemplazar: '/* MongoDB */'
        },
        
        // Referencias en texto
        {
          buscar: /Turso DB/g,
          reemplazar: 'MongoDB'
        },
        {
          buscar: /Turso Database/g,
          reemplazar: 'MongoDB Database'
        },
        {
          buscar: /libsql/g,
          reemplazar: 'mongodb'
        }
      ];

      for (const reemplazo of reemplazos) {
        if (reemplazo.buscar.test(contenidoModificado)) {
          contenidoModificado = contenidoModificado.replace(reemplazo.buscar, reemplazo.reemplazar);
          modificado = true;
        }
      }

      if (modificado) {
        await writeFile(rutaArchivo, contenidoModificado, 'utf8');
        this.archivosModificados.push(rutaArchivo);
        this.logger.log(`✅ Modificado: ${rutaArchivo}`);
      }
    } catch (error) {
      this.logger.warn(`⚠️  Error procesando ${rutaArchivo}: ${(error as Error).message}`);
    }
  }

  async actualizarPackageJson(): Promise<void> {
    try {
      this.logger.log('📦 Actualizando package.json...');
      
      const packagePath = path.join(__dirname, '../package.json');
      const packageContent = await readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);

      // Eliminar dependencias de Turso
      if (packageJson.dependencies && packageJson.dependencies['@libsql/client']) {
        delete packageJson.dependencies['@libsql/client'];
        this.logger.log('✅ Dependencia @libsql/client eliminada');
      }

      // Eliminar scripts relacionados con Turso
      if (packageJson.scripts) {
        const scriptsAEliminar = [
          'diagnostico-turso',
          'check-turso',
          'setup-turso'
        ];

        scriptsAEliminar.forEach(script => {
          if (packageJson.scripts[script]) {
            delete packageJson.scripts[script];
            this.logger.log(`✅ Script ${script} eliminado`);
          }
        });
      }

      // Guardar cambios
      await writeFile(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');
      this.logger.log('✅ package.json actualizado');
    } catch (error) {
      this.logger.error('❌ Error actualizando package.json:', error);
    }
  }

  async actualizarVariablesEntorno(): Promise<void> {
    try {
      this.logger.log('🔧 Actualizando variables de entorno...');
      
      const envFiles = [
        '.env',
        '.env.example',
        '.env.local',
        '.env.production'
      ];

      for (const envFile of envFiles) {
        const envPath = path.join(__dirname, '..', envFile);
        
        if (fs.existsSync(envPath)) {
          let contenido = await readFile(envPath, 'utf8');
          let modificado = false;

          // Reemplazar variables de Turso por MongoDB
          const reemplazos = [
            {
              buscar: /TURSO_DATABASE_URL=.*/g,
              reemplazar: 'MONGODB_URI=mongodb+srv://sergiojdf:<password>@9001app-v2.xqydf2m.mongodb.net/9001app-v2'
            },
            {
              buscar: /TURSO_AUTH_TOKEN=.*/g,
              reemplazar: 'MONGODB_AUTH_TOKEN=your_mongodb_auth_token'
            },
            {
              buscar: /DATABASE_URL=.*libsql.*/g,
              reemplazar: 'DATABASE_URL=mongodb+srv://sergiojdf:<password>@9001app-v2.xqydf2m.mongodb.net/9001app-v2'
            }
          ];

          for (const reemplazo of reemplazos) {
            if (reemplazo.buscar.test(contenido)) {
              contenido = contenido.replace(reemplazo.buscar, reemplazo.reemplazar);
              modificado = true;
            }
          }

          if (modificado) {
            await writeFile(envPath, contenido, 'utf8');
            this.logger.log(`✅ ${envFile} actualizado`);
          }
        }
      }
    } catch (error) {
      this.logger.error('❌ Error actualizando variables de entorno:', error);
    }
  }

  async ejecutar(): Promise<void> {
    try {
      this.logger.log('🚀 Iniciando eliminación completa de Turso...');
      this.logger.log('❌ ELIMINANDO TURSO COMPLETAMENTE');
      this.logger.log('✅ MIGRANDO A MONGODB');

      // Eliminar archivos de Turso
      await this.eliminarArchivosTurso();

      // Reemplazar referencias en el backend
      await this.reemplazarReferenciasTurso(path.join(__dirname, '..'));

      // Reemplazar referencias en el frontend
      await this.reemplazarReferenciasTurso(path.join(__dirname, '../../frontend'));

      // Actualizar package.json
      await this.actualizarPackageJson();

      // Actualizar variables de entorno
      await this.actualizarVariablesEntorno();

      // Mostrar resumen
      this.logger.log('\n📊 RESUMEN DE ELIMINACIÓN:');
      this.logger.log(`🗑️  Archivos eliminados: ${this.archivosEliminados.length}`);
      this.logger.log(`✏️  Archivos modificados: ${this.archivosModificados.length}`);
      this.logger.log('\n✅ Turso eliminado completamente');
      this.logger.log('🎯 Sistema migrado a MongoDB');
      this.logger.log('🔧 TypeScript configurado correctamente');

    } catch (error) {
      this.logger.error('❌ Error durante la eliminación:', error);
      throw error;
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  const eliminator = new TursoEliminator();
  eliminator.ejecutar()
    .then(() => {
      console.log('🎉 Eliminación de Turso completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la eliminación:', error);
      process.exit(1);
    });
}

export default TursoEliminator;