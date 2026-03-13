import { GoogleGenAI } from '@google/genai';
import {
  ChatMessage,
  MessageAttachment,
} from '../interfaces/ai-provider.interface';
import { BaseAIProvider, BaseEmbeddingsProvider } from './base.provider';

/**
 * Proveedor para Google AI Studio (Gemini API)
 * Usa el SDK oficial de Google
 */
export class GoogleAIProvider extends BaseAIProvider {
  private genAI: GoogleGenAI | null = null;
  private modelName: string;

  constructor(apiKey: string, modelName: string) {
    super('GoogleAI');
    this.modelName = modelName;

    if (apiKey) {
      this.genAI = new GoogleGenAI({ apiKey });
      this.setConfigured(true);
    } else {
      this.logger.warn('Google AI: API Key no configurada');
    }
  }

  getProviderName(): string {
    return 'Google AI Studio';
  }

  async generateResponse(
    history: ChatMessage[],
    userMessage: string,
    systemPrompt?: string,
  ): Promise<string> {
    let fullResponse = '';
    for await (const chunk of this.generateStreamResponse(
      history,
      userMessage,
      systemPrompt,
    )) {
      fullResponse += chunk;
    }
    return fullResponse;
  }

  async *generateStreamResponse(
    history: ChatMessage[],
    userMessage: string,
    systemPrompt?: string,
    attachments?: MessageAttachment[],
  ): AsyncGenerator<string> {
    if (!this.genAI) {
      yield 'Error: Google AI no está configurado.';
      return;
    }

    const contents = this.buildContents(history, userMessage, attachments);

    try {
      const response = await this.genAI.models.generateContentStream({
        model: this.modelName,
        contents,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      this.logger.error('Error al generar respuesta de Google AI:', error);
      yield `Error al procesar la solicitud: ${error instanceof Error ? error.message : 'Error desconocido'}`;
    }
  }

  private buildContents(
    history: ChatMessage[],
    userMessage: string,
    attachments?: MessageAttachment[],
  ): Array<{
    role: string;
    parts: Array<{
      text?: string;
      inlineData?: { mimeType: string; data: string };
    }>;
  }> {
    const contents: Array<{
      role: string;
      parts: Array<{
        text?: string;
        inlineData?: { mimeType: string; data: string };
      }>;
    }> = [];

    // Agregar historial
    for (const msg of history) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    // Preparar mensaje actual con adjuntos
    const currentParts: Array<{
      text?: string;
      inlineData?: { mimeType: string; data: string };
    }> = [{ text: userMessage }];

    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        currentParts.push({
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.data.toString('base64'),
          },
        });
      }
    }

    contents.push({
      role: 'user',
      parts: currentParts,
    });

    return contents;
  }
}

/**
 * Proveedor de embeddings para Google AI
 * Usa el modelo text-embedding de Google
 */
export class GoogleAIEmbeddingsProvider extends BaseEmbeddingsProvider {
  private genAI: GoogleGenAI | null = null;
  private modelName: string;

  constructor(apiKey: string, modelName: string, dimensions: number) {
    super('GoogleAIEmbeddings', dimensions);
    this.modelName = modelName;

    if (apiKey) {
      this.genAI = new GoogleGenAI({ apiKey });
      this.setConfigured(true);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.genAI) {
      throw new Error('Google AI Embeddings no configurado');
    }

    try {
      const response = await this.genAI.models.embedContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text }] }],
      });

      return response.embeddings?.[0]?.values || [];
    } catch (error) {
      this.logger.error('Error al generar embedding:', error);
      throw error;
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Google AI no soporta batch nativo, procesamos secuencialmente
    const results: number[][] = [];
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      results.push(embedding);
    }
    return results;
  }
}
