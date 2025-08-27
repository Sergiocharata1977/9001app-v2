import { ObjectId } from 'mongodb';
import OpenAI from 'openai';
import { AIAgent, AISuggestion, Process, ProcessInstance, AITrainingExample } from '../types';
import { logAI, logError, logMetrics } from '../utils/logger';
import databaseManager from '../config/database';

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION
});

// Tipos de agentes disponibles
export enum AgentType {
  VALIDATION = 'validation',
  SUGGESTION = 'suggestion',
  AUTOCOMPLETE = 'autocomplete',
  ANALYSIS = 'analysis',
  OPTIMIZATION = 'optimization',
  RECOMMENDATION = 'recommendation'
}

// Configuración base para agentes
const AGENT_CONFIGS = {
  [AgentType.VALIDATION]: {
    model: 'gpt-4',
    temperature: 0.1,
    max_tokens: 500,
    system_prompt: `Eres un agente especializado en validación de procesos ISO 9001. 
    Tu tarea es validar que los datos y transiciones de proceso cumplan con los estándares de calidad.
    Responde con un JSON que incluya: valid (boolean), errors (array), warnings (array), suggestions (array).`
  },
  [AgentType.SUGGESTION]: {
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 1000,
    system_prompt: `Eres un agente especializado en sugerencias para procesos ISO 9001.
    Analiza el contexto y proporciona sugerencias útiles para mejorar el proceso.
    Responde con un JSON que incluya: suggestions (array), confidence (number), reasoning (string).`
  },
  [AgentType.AUTOCOMPLETE]: {
    model: 'gpt-4',
    temperature: 0.3,
    max_tokens: 300,
    system_prompt: `Eres un agente especializado en autocompletado de campos en procesos ISO 9001.
    Completa los campos basándote en el contexto y patrones históricos.
    Responde solo con el valor completado, sin explicaciones adicionales.`
  },
  [AgentType.ANALYSIS]: {
    model: 'gpt-4',
    temperature: 0.2,
    max_tokens: 1500,
    system_prompt: `Eres un agente especializado en análisis de procesos ISO 9001.
    Analiza el proceso y proporciona insights sobre eficiencia, riesgos y oportunidades de mejora.
    Responde con un JSON que incluya: insights (array), risks (array), opportunities (array), metrics (object).`
  },
  [AgentType.OPTIMIZATION]: {
    model: 'gpt-4',
    temperature: 0.4,
    max_tokens: 1200,
    system_prompt: `Eres un agente especializado en optimización de procesos ISO 9001.
    Identifica oportunidades de optimización y sugiere mejoras específicas.
    Responde con un JSON que incluya: optimizations (array), impact (object), implementation_steps (array).`
  },
  [AgentType.RECOMMENDATION]: {
    model: 'gpt-4',
    temperature: 0.6,
    max_tokens: 800,
    system_prompt: `Eres un agente especializado en recomendaciones para procesos ISO 9001.
    Proporciona recomendaciones basadas en mejores prácticas y estándares de la industria.
    Responde con un JSON que incluya: recommendations (array), priority (string), rationale (string).`
  }
};

class AIAgentService {
  private static instance: AIAgentService;
  private agentCache: Map<string, AIAgent> = new Map();
  private requestQueue: Map<string, Promise<any>> = new Map();

  private constructor() {}

  public static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  /**
   * Crear un nuevo agente de IA
   */
  public async createAgent(
    organizationId: string,
    name: string,
    type: AgentType,
    capabilities: string[],
    configuration?: Record<string, any>
  ): Promise<AIAgent> {
    try {
      const mainDb = databaseManager.getMainDatabase();
      const config = AGENT_CONFIGS[type];

      const agent: AIAgent = {
        _id: new ObjectId(),
        organization_id: new ObjectId(organizationId),
        name,
        type: 'org',
        capabilities,
        configuration: {
          ...config,
          ...configuration
        },
        status: 'active',
        model_config: {
          provider: 'openai',
          model_name: config.model,
          temperature: config.temperature,
          max_tokens: config.max_tokens,
          system_prompt: config.system_prompt
        },
        metrics: {
          requests_total: 0,
          requests_success: 0,
          requests_failed: 0,
          avg_response_time: 0,
          last_activity: new Date(),
          tokens_used: 0,
          cost_total: 0
        },
        created_at: new Date(),
        updated_at: new Date()
      };

      await mainDb.collection('ai_agents').insertOne(agent);
      
      logAI(`Agente ${name} creado exitosamente`, {
        agent: name,
        organization: organizationId,
        type,
        capabilities
      });

      return agent;
    } catch (error) {
      logError('Error creating AI agent', error as Error, { organizationId, name, type });
      throw error;
    }
  }

  /**
   * Ejecutar un agente específico
   */
  public async executeAgent(
    agentId: string,
    organizationId: string,
    input: Record<string, any>,
    context?: Record<string, any>
  ): Promise<AISuggestion[]> {
    try {
      const agent = await this.getAgent(agentId, organizationId);
      if (!agent || agent.status !== 'active') {
        throw new Error(`Agent ${agentId} not found or inactive`);
      }

      // Crear clave única para la request
      const requestKey = `${agentId}_${JSON.stringify(input)}_${Date.now()}`;
      
      // Verificar si ya hay una request similar en progreso
      if (this.requestQueue.has(requestKey)) {
        return this.requestQueue.get(requestKey);
      }

      // Crear nueva request
      const requestPromise = this.executeAgentRequest(agent, input, context);
      this.requestQueue.set(requestKey, requestPromise);

      try {
        const result = await requestPromise;
        return result;
      } finally {
        this.requestQueue.delete(requestKey);
      }
    } catch (error) {
      logError('Error executing AI agent', error as Error, { agentId, organizationId });
      throw error;
    }
  }

  /**
   * Ejecutar la request del agente
   */
  private async executeAgentRequest(
    agent: AIAgent,
    input: Record<string, any>,
    context?: Record<string, any>
  ): Promise<AISuggestion[]> {
    const startTime = Date.now();
    
    try {
      const { model_config } = agent;
      
      // Preparar el prompt
      const prompt = this.buildPrompt(agent, input, context);
      
      // Ejecutar request a OpenAI
      const completion = await openai.chat.completions.create({
        model: model_config.model_name,
        messages: [
          {
            role: 'system',
            content: model_config.system_prompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: model_config.temperature,
        max_tokens: model_config.max_tokens
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('Empty response from AI model');
      }

      // Procesar respuesta
      const suggestions = this.processAgentResponse(agent, response, input);
      
      // Actualizar métricas
      const responseTime = Date.now() - startTime;
      await this.updateAgentMetrics(agent._id.toString(), {
        success: true,
        responseTime,
        tokensUsed: completion.usage?.total_tokens || 0
      });

      logAI(`Agente ${agent.name} ejecutado exitosamente`, {
        agent: agent.name,
        organization: agent.organization_id.toString(),
        responseTime,
        tokensUsed: completion.usage?.total_tokens,
        suggestionsCount: suggestions.length
      });

      return suggestions;
    } catch (error) {
      // Actualizar métricas de error
      const responseTime = Date.now() - startTime;
      await this.updateAgentMetrics(agent._id.toString(), {
        success: false,
        responseTime
      });

      logError('Error in agent request', error as Error, {
        agent: agent.name,
        organization: agent.organization_id.toString()
      });
      throw error;
    }
  }

  /**
   * Construir el prompt para el agente
   */
  private buildPrompt(agent: AIAgent, input: Record<string, any>, context?: Record<string, any>): string {
    const { type } = agent;
    
    let prompt = `Contexto del proceso:\n`;
    prompt += `- Tipo de agente: ${type}\n`;
    prompt += `- Organización: ${agent.organization_id}\n`;
    prompt += `- Capacidades: ${agent.capabilities.join(', ')}\n\n`;
    
    prompt += `Datos de entrada:\n${JSON.stringify(input, null, 2)}\n\n`;
    
    if (context) {
      prompt += `Contexto adicional:\n${JSON.stringify(context, null, 2)}\n\n`;
    }
    
    prompt += `Por favor, procesa esta información y responde según tu especialización.`;
    
    return prompt;
  }

  /**
   * Procesar la respuesta del agente
   */
  private processAgentResponse(
    agent: AIAgent,
    response: string,
    input: Record<string, any>
  ): AISuggestion[] {
    try {
      // Intentar parsear como JSON
      const parsed = JSON.parse(response);
      
      const suggestions: AISuggestion[] = [];
      
      // Procesar según el tipo de agente
      switch (agent.type as string) {
        case 'validation':
          if (parsed.suggestions) {
            parsed.suggestions.forEach((suggestion: any, index: number) => {
              suggestions.push({
                id: `${agent._id}_${Date.now()}_${index}`,
                type: 'validation',
                confidence: suggestion.confidence || 0.8,
                content: suggestion.content,
                metadata: {
                  field: suggestion.field,
                  rule: suggestion.rule,
                  severity: suggestion.severity
                },
                created_at: new Date()
              });
            });
          }
          break;
          
        case 'suggestion':
          if (parsed.suggestions) {
            parsed.suggestions.forEach((suggestion: any, index: number) => {
              suggestions.push({
                id: `${agent._id}_${Date.now()}_${index}`,
                type: 'next_action',
                confidence: parsed.confidence || 0.7,
                content: suggestion,
                metadata: {
                  reasoning: parsed.reasoning,
                  category: suggestion.category
                },
                created_at: new Date()
              });
            });
          }
          break;
          
        case 'autocomplete':
          suggestions.push({
            id: `${agent._id}_${Date.now()}`,
            type: 'field_completion',
            confidence: 0.9,
            content: response.trim(),
            metadata: {
              field: input.field,
              context: input.context
            },
            created_at: new Date()
          });
          break;
          
        case 'analysis':
          if (parsed.insights) {
            parsed.insights.forEach((insight: any, index: number) => {
              suggestions.push({
                id: `${agent._id}_${Date.now()}_${index}`,
                type: 'analysis',
                confidence: 0.8,
                content: insight,
                metadata: {
                  category: insight.category,
                  impact: insight.impact,
                  metrics: parsed.metrics
                },
                created_at: new Date()
              });
            });
          }
          break;
          
        case 'optimization':
          if (parsed.optimizations) {
            parsed.optimizations.forEach((optimization: any, index: number) => {
              suggestions.push({
                id: `${agent._id}_${Date.now()}_${index}`,
                type: 'optimization',
                confidence: optimization.confidence || 0.7,
                content: optimization.description,
                metadata: {
                  impact: optimization.impact,
                  effort: optimization.effort,
                  implementation_steps: parsed.implementation_steps
                },
                created_at: new Date()
              });
            });
          }
          break;
          
        case 'recommendation':
          if (parsed.recommendations) {
            parsed.recommendations.forEach((recommendation: any, index: number) => {
              suggestions.push({
                id: `${agent._id}_${Date.now()}_${index}`,
                type: 'recommendation',
                confidence: parsed.confidence || 0.8,
                content: recommendation,
                metadata: {
                  priority: parsed.priority,
                  rationale: parsed.rationale,
                  category: recommendation.category
                },
                created_at: new Date()
              });
            });
          }
          break;
      }
      
      return suggestions;
    } catch (error) {
      // Si no se puede parsear como JSON, crear una sugerencia simple
      return [{
        id: `${agent._id}_${Date.now()}`,
        type: 'next_action',
        confidence: 0.5,
        content: response,
        metadata: {
          raw_response: true,
          parse_error: error instanceof Error ? error.message : 'Unknown error'
        },
        created_at: new Date()
      }];
    }
  }

  /**
   * Obtener un agente por ID
   */
  public async getAgent(agentId: string, organizationId: string): Promise<AIAgent | null> {
    try {
      // Verificar cache
      const cacheKey = `${agentId}_${organizationId}`;
      if (this.agentCache.has(cacheKey)) {
        return this.agentCache.get(cacheKey)!;
      }

      const mainDb = databaseManager.getMainDatabase();
      const agent = await mainDb.collection('ai_agents').findOne({
        _id: new ObjectId(agentId),
        organization_id: new ObjectId(organizationId)
      });

      if (agent) {
        this.agentCache.set(cacheKey, agent as AIAgent);
      }

      return agent as AIAgent | null;
    } catch (error) {
      logError('Error getting AI agent', error as Error, { agentId, organizationId });
      return null;
    }
  }

  /**
   * Listar agentes de una organización
   */
  public async listAgents(organizationId: string, type?: string): Promise<AIAgent[]> {
    try {
      const mainDb = databaseManager.getMainDatabase();
      const filter: any = { organization_id: new ObjectId(organizationId) };
      
      if (type) {
        filter.type = type;
      }

      const agents = await mainDb.collection('ai_agents').find(filter).toArray();
      return agents as AIAgent[];
    } catch (error) {
      logError('Error listing AI agents', error as Error, { organizationId });
      return [];
    }
  }

  /**
   * Actualizar métricas del agente
   */
  private async updateAgentMetrics(
    agentId: string,
    metrics: {
      success: boolean;
      responseTime: number;
      tokensUsed?: number;
    }
  ): Promise<void> {
    try {
      const mainDb = databaseManager.getMainDatabase();
      const update: any = {
        $inc: {
          'metrics.requests_total': 1,
          'metrics.avg_response_time': metrics.responseTime
        },
        $set: {
          'metrics.last_activity': new Date(),
          updated_at: new Date()
        }
      };

      if (metrics.success) {
        update.$inc['metrics.requests_success'] = 1;
      } else {
        update.$inc['metrics.requests_failed'] = 1;
      }

      if (metrics.tokensUsed) {
        update.$inc['metrics.tokens_used'] = metrics.tokensUsed;
        // Calcular costo aproximado (GPT-4: $0.03/1K tokens input, $0.06/1K tokens output)
        const estimatedCost = (metrics.tokensUsed / 1000) * 0.045; // Promedio
        update.$inc['metrics.cost_total'] = estimatedCost;
      }

      await mainDb.collection('ai_agents').updateOne(
        { _id: new ObjectId(agentId) },
        update
      );

      // Limpiar cache
      this.agentCache.clear();
    } catch (error) {
      logError('Error updating agent metrics', error as Error, { agentId });
    }
  }

  /**
   * Entrenar un agente con ejemplos
   */
  public async trainAgent(
    agentId: string,
    organizationId: string,
    examples: AITrainingExample[]
  ): Promise<void> {
    try {
      const agent = await this.getAgent(agentId, organizationId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Actualizar estado del agente
      const mainDb = databaseManager.getMainDatabase();
      await mainDb.collection('ai_agents').updateOne(
        { _id: new ObjectId(agentId) },
        {
          $set: {
            status: 'training',
            updated_at: new Date()
          },
          $push: {
            'training_data.examples': { $each: examples as any[] }
          } as any
        }
      );

      // Simular entrenamiento (en un caso real, aquí se entrenaría el modelo)
      setTimeout(async () => {
        await mainDb.collection('ai_agents').updateOne(
          { _id: new ObjectId(agentId) },
          {
            $set: {
              status: 'active',
              'training_data.last_training': new Date(),
              'training_data.performance_score': 0.85,
              updated_at: new Date()
            }
          }
        );
        
        logAI(`Agente ${agent.name} entrenado exitosamente`, {
          agent: agent.name,
          organization: organizationId,
          examplesCount: examples.length
        });
      }, 5000);

      logAI(`Iniciando entrenamiento del agente ${agent.name}`, {
        agent: agent.name,
        organization: organizationId,
        examplesCount: examples.length
      });
    } catch (error) {
      logError('Error training AI agent', error as Error, { agentId, organizationId });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de agentes
   */
  public async getAgentStats(organizationId: string): Promise<{
    total: number;
    active: number;
    training: number;
    totalRequests: number;
    avgResponseTime: number;
    totalCost: number;
  }> {
    try {
      const mainDb = databaseManager.getMainDatabase();
      const agents = await mainDb.collection('ai_agents').find({
        organization_id: new ObjectId(organizationId)
      }).toArray();

      const stats = {
        total: agents.length,
        active: agents.filter(a => a.status === 'active').length,
        training: agents.filter(a => a.status === 'training').length,
        totalRequests: agents.reduce((sum, a) => sum + a.metrics.requests_total, 0),
        avgResponseTime: agents.reduce((sum, a) => sum + a.metrics.avg_response_time, 0) / agents.length || 0,
        totalCost: agents.reduce((sum, a) => sum + a.metrics.cost_total, 0)
      };

      return stats;
    } catch (error) {
      logError('Error getting agent stats', error as Error, { organizationId });
      return {
        total: 0,
        active: 0,
        training: 0,
        totalRequests: 0,
        avgResponseTime: 0,
        totalCost: 0
      };
    }
  }
}

export default AIAgentService.getInstance();