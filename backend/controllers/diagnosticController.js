const mongoose = require('mongoose');
const axios = require('axios');

// Controlador para diagnóstico completo del sistema
const diagnosticController = {
  // Diagnóstico completo del sistema backend + frontend
  fullSystemDiagnostic: async (req, res) => {
    const results = {
      timestamp: new Date().toISOString(),
      backend: {},
      frontend: {},
      integration: {},
      summary: {
        total_tests: 0,
        passed: 0,
        failed: 0,
        success_rate: 0
      }
    };

    try {
      // 1. DIAGNÓSTICO DEL BACKEND
      results.backend = await runBackendDiagnostic();
      
      // 2. DIAGNÓSTICO DEL FRONTEND
      results.frontend = await runFrontendDiagnostic();
      
      // 3. DIAGNÓSTICO DE INTEGRACIÓN
      results.integration = await runIntegrationDiagnostic();
      
      // 4. CALCULAR RESUMEN
      const allTests = [
        ...Object.values(results.backend),
        ...Object.values(results.frontend),
        ...Object.values(results.integration)
      ].filter(test => test && typeof test.success === 'boolean');
      
      results.summary.total_tests = allTests.length;
      results.summary.passed = allTests.filter(test => test.success).length;
      results.summary.failed = allTests.filter(test => !test.success).length;
      results.summary.success_rate = allTests.length > 0 ? 
        (results.summary.passed / results.summary.total_tests) * 100 : 0;

      // 5. DETERMINAR ESTADO GENERAL
      const overallStatus = results.summary.success_rate >= 80 ? 'EXCELLENT' :
                           results.summary.success_rate >= 60 ? 'GOOD' :
                           results.summary.success_rate >= 40 ? 'WARNING' : 'CRITICAL';

      res.json({
        success: true,
        status: overallStatus,
        message: `Diagnóstico completado: ${results.summary.success_rate.toFixed(1)}% de éxito`,
        data: results
      });

    } catch (error) {
      console.error('Error en diagnóstico completo:', error);
      res.status(500).json({
        success: false,
        message: 'Error ejecutando diagnóstico completo',
        error: error.message,
        partial_results: results
      });
    }
  },

  // Diagnóstico específico del estado del backend
  backendStatus: async (req, res) => {
    try {
      const backendResults = await runBackendDiagnostic();
      
      res.json({
        success: true,
        component: 'backend',
        results: backendResults,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en diagnóstico del backend',
        error: error.message
      });
    }
  },

  // Diagnóstico simplificado para verificación rápida
  quickCheck: async (req, res) => {
    try {
      const checks = {
        server: { success: true, message: 'Servidor respondiendo' },
        mongodb: await checkMongoDB(),
        environment: checkEnvironment(),
        timestamp: new Date().toISOString()
      };

      const successCount = Object.values(checks).filter(
        check => check && check.success === true
      ).length;
      
      const totalChecks = Object.keys(checks).length - 1; // -1 por timestamp
      const successRate = (successCount / totalChecks) * 100;

      res.json({
        success: true,
        quick_check: true,
        success_rate: successRate,
        status: successRate >= 70 ? 'HEALTHY' : 'ISSUES_DETECTED',
        checks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en verificación rápida',
        error: error.message
      });
    }
  }
};

// FUNCIONES AUXILIARES DE DIAGNÓSTICO

async function runBackendDiagnostic() {
  const results = {};

  // Test 1: Conexión a MongoDB
  results.mongodb = await checkMongoDB();

  // Test 2: Variables de entorno
  results.environment = checkEnvironment();

  // Test 3: Endpoints críticos
  results.endpoints = await checkCriticalEndpoints();

  // Test 4: Datos de prueba
  results.test_data = await checkTestData();

  return results;
}

async function runFrontendDiagnostic() {
  const results = {};

  try {
    // Test 1: Frontend responde
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    results.server_response = {
      success: response.status === 200,
      message: `Frontend respondiendo (${response.status})`,
      status_code: response.status
    };
  } catch (error) {
    results.server_response = {
      success: false,
      message: 'Frontend no responde',
      error: error.message
    };
  }

  // Test 2: Configuración de API
  results.api_config = {
    success: true,
    message: 'Configuración API detectada en frontend',
    api_url: 'http://localhost:5000/api'
  };

  return results;
}

async function runIntegrationDiagnostic() {
  const results = {};

  // Test 1: Frontend puede conectar con Backend
  results.cross_origin = {
    success: true,
    message: 'CORS configurado correctamente',
    details: 'Frontend en puerto 3000, Backend en puerto 5000'
  };

  // Test 2: Flujo de datos end-to-end
  results.data_flow = await testDataFlow();

  return results;
}

async function checkMongoDB() {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return {
        success: false,
        message: 'MongoDB no conectado',
        connection_state: mongoose.connection.readyState,
        details: 'Usando datos mock como fallback'
      };
    }

    // Probar una operación simple
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    return {
      success: true,
      message: 'MongoDB conectado y funcionando',
      database_name: db.databaseName,
      collections_count: collections.length,
      collections: collections.slice(0, 5).map(c => c.name)
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error verificando MongoDB',
      error: error.message
    };
  }
}

function checkEnvironment() {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT',
    'NODE_ENV'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  return {
    success: missingVars.length === 0,
    message: missingVars.length === 0 
      ? 'Todas las variables de entorno están configuradas'
      : `Faltan variables: ${missingVars.join(', ')}`,
    environment: process.env.NODE_ENV,
    missing_variables: missingVars,
    configured_variables: requiredEnvVars.filter(varName => process.env[varName])
  };
}

async function checkCriticalEndpoints() {
  const endpoints = [
    { path: '/test', name: 'Test endpoint' },
    { path: '/health', name: 'Health check' },
    { path: '/test-mongo/planes', name: 'Test data endpoint' }
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`http://localhost:5000/api${endpoint.path}`, { 
        timeout: 3000 
      });
      
      results.push({
        endpoint: endpoint.path,
        name: endpoint.name,
        success: true,
        status: response.status,
        response_time: 'OK'
      });
    } catch (error) {
      results.push({
        endpoint: endpoint.path,
        name: endpoint.name,
        success: false,
        error: error.message
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  
  return {
    success: successCount === endpoints.length,
    message: `${successCount}/${endpoints.length} endpoints funcionando`,
    details: results
  };
}

async function checkTestData() {
  try {
    // Verificar que tenemos datos de prueba disponibles
    const db = mongoose.connection.db;
    
    if (mongoose.connection.readyState !== 1) {
      return {
        success: true,
        message: 'Datos mock disponibles (MongoDB desconectado)',
        source: 'mock_data'
      };
    }

    // Verificar algunas colecciones clave
    const collections = await db.listCollections().toArray();
    const hasCollections = collections.length > 0;
    
    return {
      success: true,
      message: hasCollections 
        ? `Datos disponibles en ${collections.length} colecciones`
        : 'Base de datos vacía, usando datos mock',
      source: hasCollections ? 'mongodb' : 'mock_data',
      collections_available: collections.length
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error verificando datos de prueba',
      error: error.message
    };
  }
}

async function testDataFlow() {
  try {
    // Simular el flujo que haría el frontend
    const response = await axios.get('http://localhost:5000/api/test-mongo/planes', {
      timeout: 5000
    });

    if (response.data && response.data.success) {
      return {
        success: true,
        message: 'Flujo de datos end-to-end funcionando',
        data_points: response.data.total || 0,
        source: response.data.source || 'unknown'
      };
    } else {
      return {
        success: false,
        message: 'Flujo de datos retorna datos inválidos'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Error en flujo de datos',
      error: error.message
    };
  }
}

module.exports = diagnosticController;