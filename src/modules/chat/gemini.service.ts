import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderService, ChatMessage } from '../ai-provider';
import { RAGService } from '../rag';

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);

  constructor(
    private configService: ConfigService,
    private aiProvider: AIProviderService,
    private ragService: RAGService,
  ) {}

  onModuleInit() {
    if (this.aiProvider.isConfigured()) {
      this.logger.log('GeminiService inicializado con AIProvider');
    } else {
      this.logger.warn(
        'AIProvider no configurado. El servicio de chat no funcionará.',
      );
    }
  }

  /**
   * Genera el system prompt con instrucciones para el modelo
   */
  private getSystemPrompt(ragContext?: string): string {
    const basePrompt = `
Eres un asistente experto del Jardín Botánico Reinaldo Espinoza de Loja, Ecuador (JBRE).
Tu rol es ayudar a los usuarios con información sobre:

1. PLANTAS: Identificación, taxonomía, morfología, cuidados y cultivo
2. JARDÍN: Información sobre las secciones, ubicaciones y recorridos
3. CONSERVACIÓN: Estados de conservación, especies endémicas y protegidas
4. EDUCACIÓN: Información botánica general, terminología científica

Directrices:
- Responde siempre en español
- Sé preciso con la terminología botánica
- Si el usuario sube una imagen de una planta, intenta identificarla
- Si no estás seguro, indícalo claramente
- Mantén respuestas concisas pero informativas
`;

    let finalPrompt = basePrompt;

    // Si hay contexto RAG, agregar instrucciones especiales y el contexto
    if (ragContext) {
      finalPrompt += `

INSTRUCCIONES IMPORTANTES SOBRE LA INFORMACIÓN DE LA BASE DE DATOS:
- A continuación se te proporciona información EXACTA de la base de datos del jardín botánico.
- DEBES basar tu respuesta estricta y EXCLUSIVAMENTE en la información proporcionada a continuación.
- NO inventes nombres comunes ni ubicaciones que no estén textualmente escritas en la información a continuación.
- OBLIGATORIO: Redacta tu respuesta de manera natural, conversacional y fluida. 
- NUNCA uses listas numeradas o viñetas a menos que el usuario te pida explícitamente una lista.
- Si el contexto tiene la respuesta (ej. un nombre común como "Pena-pena"), da la respuesta directamente sin agregar comentarios adicionales sobre lo que "no se menciona".
- OBLIGATORIO: Si todo el contexto extraído NO contiene información para responder a la pregunta, entonces (y solo entonces) responde que no tienes esa información registrada en la base de datos.

CONTEXTO EXTRAÍDO DE LA BASE DE DATOS:
${ragContext}
`;
    } else {
      // Sin contexto RAG, instrucción para fallback
      finalPrompt += `

INSTRUCCIÓN ESPECIAL:
Si la pregunta es sobre una planta específica del jardín y no tienes información en tu contexto,
responde exactamente: La informacion requerida no se encuentra registrada en la base de datos.
`;
    }

    return finalPrompt;
  }

  /**
   * Genera respuesta en streaming usando RAG + AI Provider
   */
  async *generateStreamResponse(
    history: { role: string; content: string }[],
    userMessage: string,
    attachments?: { mimeType: string; data: Buffer }[],
  ): AsyncGenerator<string> {
    if (!this.aiProvider.isConfigured()) {
      yield 'Error: El servicio de IA no está configurado. Por favor, contacte al administrador.';
      return;
    }

    try {
      // Buscar contexto relevante en la base de datos (RAG)
      const ragContext = await this.ragService.buildContext(userMessage);

      // Construir historial en formato ChatMessage
      const chatHistory: ChatMessage[] = history.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Generar respuesta con el contexto RAG
      const systemPrompt = this.getSystemPrompt(ragContext);

      for await (const chunk of this.aiProvider.generateStreamResponse(
        chatHistory,
        userMessage,
        systemPrompt,
        attachments,
      )) {
        yield chunk;
      }
    } catch (error) {
      this.logger.error('Error al generar respuesta:', error);
      yield `Error al procesar la solicitud: ${error instanceof Error ? error.message : 'Error desconocido'}`;
    }
  }

  /**
   * Genera respuesta completa (no streaming)
   */
  async generateResponse(
    history: { role: string; content: string }[],
    userMessage: string,
  ): Promise<string> {
    let fullResponse = '';
    for await (const chunk of this.generateStreamResponse(
      history,
      userMessage,
    )) {
      fullResponse += chunk;
    }
    return fullResponse;
  }
}
