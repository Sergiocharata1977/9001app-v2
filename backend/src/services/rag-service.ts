import { ObjectId } from 'mongodb';
import OpenAI from 'openai';
import { RAGDocument, RAGQuery, RAGQueryResult } from '../types';
import { logAI, logError } from '../utils/logger';
import databaseManager from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION
});

// Configuración de embeddings
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

class RAGService {
  private static instance: RAGService;
  private documentCache: Map<string, RAGDocument> = new Map();
  private embeddingCache: Map<string, number[]> = new Map();

  private constructor() {}

  public static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  /**
   * Ingestionar un documento
   */
  public async ingestDocument(
    organizationId: string,
    title: string,
    content: string,
    type: RAGDocument['type'],
    source: RAGDocument['source'],
    metadata?: Partial<RAGDocument['metadata']>
  ): Promise<RAGDocument> {
    try {
      const mainDb = databaseManager.getMainDatabase();
      
      // Crear documento base
      const document: RAGDocument = {
        _id: new ObjectId(),
        organization_id: new ObjectId(organizationId),
        title,
        content,
        type,
        source,
        metadata: {
          author: metadata?.author,
          date_created: metadata?.date_created || new Date(),
          tags: metadata?.tags || [],
          category: metadata?.category || 'general',
          language: metadata?.language || 'es',
          file_size: Buffer.byteLength(content, 'utf8'),
          pages: metadata?.pages,
          ...metadata
        },
        embeddings: [],
        status: 'processing',
        created_at: new Date(),
        updated_at: new Date()
      };

      // Insertar documento
      await mainDb.collection('rag_documents').insertOne(document);

      // Procesar documento en background
      this.processDocument(document).catch(error => {
        logError('Error processing document', error as Error, { documentId: document._id.toString() });
      });

      logAI(`Documento ${title} ingestionado exitosamente`, {
        organization: organizationId,
        type,
        source,
        size: document.metadata.file_size
      });

      return document;
    } catch (error) {
      logError('Error ingesting document', error as Error, { organizationId, title });
      throw error;
    }
  }

  /**
   * Procesar documento para generar embeddings
   */
  private async processDocument(document: RAGDocument): Promise<void> {
    try {
      const mainDb = databaseManager.getMainDatabase();
      
      // Dividir contenido en chunks
      const chunks = this.splitIntoChunks(document.content);
      
      // Generar embeddings para cada chunk
      const embeddings = await this.generateEmbeddings(chunks);
      
      // Actualizar documento con embeddings
      const documentEmbeddings = chunks.map((chunk, index) => ({
        vector: embeddings[index],
        chunk_id: `${document._id}_${index}`,
        chunk_text: chunk
      }));

      await mainDb.collection('rag_documents').updateOne(
        { _id: document._id },
        {
          $set: {
            embeddings: documentEmbeddings,
            status: 'ready',
            processing_metadata: {
              chunks_count: chunks.length,
              processing_time: Date.now() - document.created_at.getTime(),
              error_message: null
            },
            updated_at: new Date()
          }
        }
      );

      logAI(`Documento ${document.title} procesado exitosamente`, {
        documentId: document._id.toString(),
        chunksCount: chunks.length,
        organization: document.organization_id.toString()
      });
    } catch (error) {
      // Marcar documento como error
      const mainDb = databaseManager.getMainDatabase();
      await mainDb.collection('rag_documents').updateOne(
        { _id: document._id },
        {
          $set: {
            status: 'error',
            processing_metadata: {
              chunks_count: 0,
              processing_time: Date.now() - document.created_at.getTime(),
              error_message: error instanceof Error ? error.message : 'Unknown error'
            },
            updated_at: new Date()
          }
        }
      );

      throw error;
    }
  }

  /**
   * Dividir contenido en chunks
   */
  private splitIntoChunks(content: string): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < content.length) {
      const end = Math.min(start + CHUNK_SIZE, content.length);
      let chunk = content.substring(start, end);

      // Intentar cortar en un punto o espacio
      if (end < content.length) {
        const lastPeriod = chunk.lastIndexOf('.');
        const lastSpace = chunk.lastIndexOf(' ');
        
        if (lastPeriod > CHUNK_SIZE * 0.8) {
          chunk = chunk.substring(0, lastPeriod + 1);
          start = start + lastPeriod + 1;
        } else if (lastSpace > CHUNK_SIZE * 0.8) {
          chunk = chunk.substring(0, lastSpace);
          start = start + lastSpace + 1;
        } else {
          start = end;
        }
      } else {
        start = end;
      }

      if (chunk.trim()) {
        chunks.push(chunk.trim());
      }
    }

    return chunks;
  }

  /**
   * Generar embeddings para un array de textos
   */
  private async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: texts
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      logError('Error generating embeddings', error as Error, { textsCount: texts.length });
      throw error;
    }
  }

  /**
   * Realizar búsqueda semántica
   */
  public async searchDocuments(
    organizationId: string,
    query: string,
    limit: number = 5,
    filters?: {
      category?: string;
      tags?: string[];
      type?: string;
    }
  ): Promise<RAGQueryResult[]> {
    try {
      const startTime = Date.now();
      
      // Generar embedding para la query
      const queryEmbedding = await this.generateEmbeddings([query]);
      
      // Buscar documentos en la organización
      const mainDb = databaseManager.getMainDatabase();
      const filter: any = {
        organization_id: new ObjectId(organizationId),
        status: 'ready'
      };

      if (filters?.category) {
        filter['metadata.category'] = filters.category;
      }
      if (filters?.tags && filters.tags.length > 0) {
        filter['metadata.tags'] = { $in: filters.tags };
      }
      if (filters?.type) {
        filter.type = filters.type;
      }

      const documents = await mainDb.collection('rag_documents').find(filter).toArray();
      
      // Calcular similitud coseno para cada chunk
      const results: Array<{
        document: RAGDocument;
        chunk: any;
        similarity: number;
      }> = [];

      for (const document of documents) {
        for (const embedding of document.embeddings) {
          const similarity = this.cosineSimilarity(queryEmbedding[0], embedding.vector);
          results.push({
            document: document as RAGDocument,
            chunk: embedding,
            similarity
          });
        }
      }

      // Ordenar por similitud y tomar los mejores
      results.sort((a, b) => b.similarity - a.similarity);
      const topResults = results.slice(0, limit);

      // Formatear resultados
      const formattedResults: RAGQueryResult[] = topResults.map(result => ({
        document_id: result.document._id,
        chunk_id: result.chunk.chunk_id,
        content: result.chunk.chunk_text,
        relevance_score: result.similarity,
        metadata: {
          document_title: result.document.title,
          document_type: result.document.type,
          category: result.document.metadata.category,
          tags: result.document.metadata.tags
        }
      }));

      // Registrar query
      await this.logQuery(organizationId, query, formattedResults, Date.now() - startTime);

      logAI(`Búsqueda RAG completada`, {
        organization: organizationId,
        query,
        resultsCount: formattedResults.length,
        responseTime: Date.now() - startTime
      });

      return formattedResults;
    } catch (error) {
      logError('Error searching documents', error as Error, { organizationId, query });
      throw error;
    }
  }

  /**
   * Calcular similitud coseno entre dos vectores
   */
  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Generar respuesta basada en documentos recuperados
   */
  public async generateResponse(
    organizationId: string,
    query: string,
    context: string,
    maxTokens: number = 500
  ): Promise<string> {
    try {
      const prompt = `Basándote en el siguiente contexto y la pregunta del usuario, proporciona una respuesta precisa y útil.

Contexto:
${context}

Pregunta: ${query}

Responde de manera clara y concisa, citando información específica del contexto cuando sea relevante.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente especializado en ISO 9001 que proporciona respuestas basadas en documentación específica.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('Empty response from AI model');
      }

      logAI(`Respuesta RAG generada exitosamente`, {
        organization: organizationId,
        query,
        responseLength: response.length,
        tokensUsed: completion.usage?.total_tokens
      });

      return response;
    } catch (error) {
      logError('Error generating RAG response', error as Error, { organizationId, query });
      throw error;
    }
  }

  /**
   * Consulta RAG completa (búsqueda + generación)
   */
  public async queryRAG(
    organizationId: string,
    query: string,
    userId: string,
    options?: {
      limit?: number;
      filters?: any;
      maxTokens?: number;
    }
  ): Promise<{
    answer: string;
    sources: RAGQueryResult[];
    metadata: {
      response_time: number;
      tokens_used: number;
      confidence_score: number;
    };
  }> {
    const startTime = Date.now();

    try {
      // Buscar documentos relevantes
      const sources = await this.searchDocuments(
        organizationId,
        query,
        options?.limit || 5,
        options?.filters
      );

      if (sources.length === 0) {
        return {
          answer: 'No encontré información relevante para responder tu pregunta.',
          sources: [],
          metadata: {
            response_time: Date.now() - startTime,
            tokens_used: 0,
            confidence_score: 0
          }
        };
      }

      // Construir contexto
      const context = sources.map(source => 
        `Documento: ${source.metadata.document_title}\nContenido: ${source.content}`
      ).join('\n\n');

      // Generar respuesta
      const answer = await this.generateResponse(
        organizationId,
        query,
        context,
        options?.maxTokens || 500
      );

      // Calcular score de confianza basado en relevancia de fuentes
      const confidenceScore = sources.reduce((sum, source) => sum + source.relevance_score, 0) / sources.length;

      return {
        answer,
        sources,
        metadata: {
          response_time: Date.now() - startTime,
          tokens_used: 0, // Se calcularía del response de OpenAI
          confidence_score: confidenceScore
        }
      };
    } catch (error) {
      logError('Error in RAG query', error as Error, { organizationId, query });
      throw error;
    }
  }

  /**
   * Registrar query para análisis
   */
  private async logQuery(
    organizationId: string,
    query: string,
    results: RAGQueryResult[],
    responseTime: number
  ): Promise<void> {
    try {
      const mainDb = databaseManager.getMainDatabase();
      
      const ragQuery: RAGQuery = {
        id: new ObjectId().toString(),
        organization_id: new ObjectId(organizationId),
        query,
        context: {},
        results,
        created_at: new Date(),
        user_id: new ObjectId(), // Se debería obtener del contexto de autenticación
        metadata: {
          response_time: responseTime,
          tokens_used: 0,
          confidence_score: results.length > 0 ? 
            results.reduce((sum, r) => sum + r.relevance_score, 0) / results.length : 0
        }
      };

      await mainDb.collection('rag_queries').insertOne(ragQuery);
    } catch (error) {
      logError('Error logging RAG query', error as Error, { organizationId, query });
    }
  }

  /**
   * Listar documentos de una organización
   */
  public async listDocuments(
    organizationId: string,
    filters?: {
      status?: string;
      type?: string;
      category?: string;
    }
  ): Promise<RAGDocument[]> {
    try {
      const mainDb = databaseManager.getMainDatabase();
      const filter: any = { organization_id: new ObjectId(organizationId) };

      if (filters?.status) {
        filter.status = filters.status;
      }
      if (filters?.type) {
        filter.type = filters.type;
      }
      if (filters?.category) {
        filter['metadata.category'] = filters.category;
      }

      const documents = await mainDb.collection('rag_documents').find(filter).toArray();
      return documents as RAGDocument[];
    } catch (error) {
      logError('Error listing RAG documents', error as Error, { organizationId });
      return [];
    }
  }

  /**
   * Eliminar documento
   */
  public async deleteDocument(documentId: string, organizationId: string): Promise<void> {
    try {
      const mainDb = databaseManager.getMainDatabase();
      
      await mainDb.collection('rag_documents').deleteOne({
        _id: new ObjectId(documentId),
        organization_id: new ObjectId(organizationId)
      });

      // Limpiar cache
      this.documentCache.delete(documentId);

      logAI(`Documento RAG eliminado`, {
        documentId,
        organization: organizationId
      });
    } catch (error) {
      logError('Error deleting RAG document', error as Error, { documentId, organizationId });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de RAG
   */
  public async getRAGStats(organizationId: string): Promise<{
    totalDocuments: number;
    totalChunks: number;
    totalQueries: number;
    avgResponseTime: number;
    avgConfidenceScore: number;
  }> {
    try {
      const mainDb = databaseManager.getMainDatabase();
      
      const documents = await mainDb.collection('rag_documents').find({
        organization_id: new ObjectId(organizationId)
      }).toArray();

      const queries = await mainDb.collection('rag_queries').find({
        organization_id: new ObjectId(organizationId)
      }).toArray();

      const totalChunks = documents.reduce((sum, doc) => sum + doc.embeddings.length, 0);
      const avgResponseTime = queries.length > 0 ? 
        queries.reduce((sum, q) => sum + q.metadata.response_time, 0) / queries.length : 0;
      const avgConfidenceScore = queries.length > 0 ?
        queries.reduce((sum, q) => sum + q.metadata.confidence_score, 0) / queries.length : 0;

      return {
        totalDocuments: documents.length,
        totalChunks,
        totalQueries: queries.length,
        avgResponseTime,
        avgConfidenceScore
      };
    } catch (error) {
      logError('Error getting RAG stats', error as Error, { organizationId });
      return {
        totalDocuments: 0,
        totalChunks: 0,
        totalQueries: 0,
        avgResponseTime: 0,
        avgConfidenceScore: 0
      };
    }
  }
}

export default RAGService.getInstance();