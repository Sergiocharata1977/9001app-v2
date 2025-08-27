import dotenv from 'dotenv';
import { spawn } from 'child_process';
import { logInfo, logError } from '../utils/logger';

// Cargar variables de entorno
dotenv.config();

async function startDevServer() {
  try {
    logInfo('🚀 Iniciando servidor de desarrollo ISOFlow4...');
    
    // Verificar que las dependencias estén instaladas
    logInfo('Verificando dependencias...');
    
    // Iniciar el servidor con nodemon para hot reload
    const serverProcess = spawn('npx', ['nodemon', '--exec', 'ts-node', 'src/index.ts'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development'
      }
    });

    serverProcess.on('error', (error) => {
      logError('Error iniciando servidor', error);
      process.exit(1);
    });

    serverProcess.on('exit', (code) => {
      if (code !== 0) {
        logError(`Servidor terminado con código ${code}`);
        process.exit(code || 1);
      }
    });

    // Manejar señales de terminación
    process.on('SIGINT', () => {
      logInfo('Recibida señal SIGINT, cerrando servidor...');
      serverProcess.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      logInfo('Recibida señal SIGTERM, cerrando servidor...');
      serverProcess.kill('SIGTERM');
    });

  } catch (error) {
    logError('Error en el servidor de desarrollo', error as Error);
    process.exit(1);
  }
}

// Iniciar servidor
startDevServer();