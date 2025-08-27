import dotenv from 'dotenv';
import databaseManager from '../config/database';
import AIAgentService from '../services/ai-agents';
import RAGService from '../services/rag-service';
import { logInfo, logError } from '../utils/logger';

// Cargar variables de entorno
dotenv.config();

async function testSystem() {
  try {
    logInfo('Iniciando pruebas del sistema ISOFlow4...');

    // 1. Conectar a la base de datos
    logInfo('Conectando a la base de datos...');
    await databaseManager.connect();
    logInfo('✅ Conexión a base de datos exitosa');

    // 2. Verificar conexión a MongoDB
    const mongoHealthy = databaseManager.mongodbHealthy();
    logInfo(`MongoDB Health: ${mongoHealthy ? '✅' : '❌'}`);

    // 3. Verificar conexión a Redis
    const redisHealthy = databaseManager.redisHealthy();
    logInfo(`Redis Health: ${redisHealthy ? '✅' : '❌'}`);

    // 4. Probar servicio de agentes de IA
    logInfo('Probando servicio de agentes de IA...');
    const aiService = AIAgentService.getInstance();
    
    // Listar agentes (debería estar vacío inicialmente)
    const agents = await aiService.listAgents('test-org-id');
    logInfo(`Agentes encontrados: ${agents.length}`);

    // 5. Probar servicio RAG
    logInfo('Probando servicio RAG...');
    const ragService = RAGService.getInstance();
    
    // Listar documentos (debería estar vacío inicialmente)
    const documents = await ragService.listDocuments('test-org-id');
    logInfo(`Documentos RAG encontrados: ${documents.length}`);

    // 6. Probar creación de un agente de ejemplo
    logInfo('Creando agente de prueba...');
    const testAgent = await aiService.createAgent({
      name: 'Agente de Validación de Prueba',
      type: 'validation',
      description: 'Agente para pruebas del sistema',
      configuration: {
        model: 'gpt-4',
        max_tokens: 1000,
        temperature: 0.7
      },
      organization_id: 'test-org-id',
      created_by: 'test-user-id'
    });
    logInfo(`✅ Agente creado: ${testAgent.name} (ID: ${testAgent._id})`);

    // 7. Probar ejecución del agente
    logInfo('Probando ejecución del agente...');
    const result = await aiService.executeAgent(
      testAgent._id.toString(),
      'test-org-id',
      {
        input: 'Validar este proceso de calidad',
        context: 'Proceso de desarrollo de software',
        metadata: {
          process_id: 'test-process-123',
          user_id: 'test-user-id'
        }
      }
    );
    logInfo(`✅ Resultado del agente: ${result.success ? 'Éxito' : 'Error'}`);

    // 8. Probar ingesta de documento RAG
    logInfo('Probando ingesta de documento RAG...');
    const testDocument = await ragService.ingestDocument({
      title: 'Manual de Calidad ISO 9001',
      content: 'Este es un manual de calidad que describe los procesos y procedimientos para cumplir con la norma ISO 9001.',
      type: 'manual',
      source: 'iso-9001-manual',
      organization_id: 'test-org-id',
      uploaded_by: 'test-user-id',
      metadata: {
        version: '1.0',
        department: 'Calidad'
      }
    });
    logInfo(`✅ Documento RAG ingerido: ${testDocument.title}`);

    // 9. Probar búsqueda RAG
    logInfo('Probando búsqueda RAG...');
    const searchResults = await ragService.searchDocuments(
      'test-org-id',
      'procesos de calidad',
      5
    );
    logInfo(`✅ Resultados de búsqueda: ${searchResults.length} documentos encontrados`);

    // 10. Probar consulta RAG
    logInfo('Probando consulta RAG...');
    const queryResult = await ragService.query(
      'test-org-id',
      '¿Cuáles son los requisitos principales de ISO 9001?',
      {
        max_results: 3,
        similarity_threshold: 0.7
      }
    );
    logInfo(`✅ Consulta RAG completada: ${queryResult.answer ? 'Respuesta generada' : 'Sin respuesta'}`);

    // 11. Obtener estadísticas
    logInfo('Obteniendo estadísticas...');
    const agentStats = await aiService.getAgentStats('test-org-id');
    const ragStats = await ragService.getStats('test-org-id');
    
    logInfo('📊 Estadísticas del sistema:');
    logInfo(`   - Agentes totales: ${agentStats.total}`);
    logInfo(`   - Agentes activos: ${agentStats.active}`);
    logInfo(`   - Documentos RAG: ${ragStats.totalDocuments}`);
    logInfo(`   - Consultas RAG: ${ragStats.totalQueries}`);

    logInfo('🎉 ¡Todas las pruebas completadas exitosamente!');
    logInfo('El sistema ISOFlow4 está funcionando correctamente.');

  } catch (error) {
    logError('Error durante las pruebas del sistema', error as Error);
    console.error('❌ Error en las pruebas:', error);
  } finally {
    // Cerrar conexiones
    await databaseManager.disconnect();
    logInfo('Conexiones cerradas');
    process.exit(0);
  }
}

// Ejecutar pruebas
testSystem();