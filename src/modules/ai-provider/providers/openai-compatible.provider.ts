import {
  ChatMessage,
  MessageAttachment,
} from '../interfaces/ai-provider.interface';
import { BaseAIProvider, BaseEmbeddingsProvider } from './base.provider';

/**
 * Proveedor compatible con API OpenAI
 * Funciona con: Azure OpenAI, Ollama, vLLM, LocalAI, etc.
 */
export class OpenAICompatibleProvider extends BaseAIProvider {
  private baseUrl: string;
  private apiKey: string;
  private modelName: string;
  private providerType: string;

  constructor(
    providerType: string,
    baseUrl: string,
    apiKey: string,
    modelName: string,
  ) {
    super(`OpenAICompatible-${providerType}`);
    this.providerType = providerType;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    this.modelName = modelName;

    // Validar configuración
    if (baseUrl && modelName) {
      this.setConfigured(true);
    } else {
      this.logger.warn(
        `${providerType}: Configuración incompleta (baseUrl o modelName faltante)`,
      );
    }
  }

  getProviderName(): string {
    return this.providerType;
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
    if (!this.isConfigured()) {
      yield `Error: Proveedor ${this.providerType} no configurado.`;
      return;
    }

    const messages = this.buildMessages(history, userMessage, systemPrompt);

    // Agregar imágenes si hay attachments (solo para modelos que soporten visión)
    if (attachments && attachments.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        const content: Array<
          { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
        > = [{ type: 'text', text: lastMessage.content as string }];

        for (const attachment of attachments) {
          content.push({
            type: 'image_url',
            image_url: {
              url: `data:${attachment.mimeType};base64,${attachment.data.toString('base64')}`,
            },
          });
        }

        messages[messages.length - 1] = {
          role: 'user',
          content: content as unknown as string,
        };
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          // Para Azure OpenAI
          ...(this.providerType === 'azure' && { 'api-key': this.apiKey }),
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Error de API: ${response.status} - ${errorText}`);
        yield `Error del servicio de IA: ${response.status}`;
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        yield 'Error: No se pudo obtener el stream de respuesta';
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch {
              // Ignorar líneas que no son JSON válido
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Error al generar respuesta:', error);
      yield `Error al procesar la solicitud: ${error instanceof Error ? error.message : 'Error desconocido'}`;
    }
  }

  private buildMessages(
    history: ChatMessage[],
    userMessage: string,
    systemPrompt?: string,
  ): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of history) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    messages.push({ role: 'user', content: userMessage });

    return messages;
  }
}

/**
 * Proveedor de embeddings compatible con OpenAI API
 */
export class OpenAICompatibleEmbeddingsProvider extends BaseEmbeddingsProvider {
  private baseUrl: string;
  private apiKey: string;
  private modelName: string;
  private providerType: string;

  constructor(
    providerType: string,
    baseUrl: string,
    apiKey: string,
    modelName: string,
    dimensions: number,
  ) {
    super(`OpenAICompatibleEmbeddings-${providerType}`, dimensions);
    this.providerType = providerType;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.modelName = modelName;

    if (baseUrl && modelName) {
      this.setConfigured(true);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const results = await this.generateEmbeddings([text]);
    return results[0];
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.isConfigured()) {
      throw new Error(`Embeddings provider ${this.providerType} no configurado`);
    }

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          ...(this.providerType === 'azure' && { 'api-key': this.apiKey }),
        },
        body: JSON.stringify({
          model: this.modelName,
          input: texts,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error de API: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.data.map(
        (item: { embedding: number[] }) => item.embedding,
      );
    } catch (error) {
      this.logger.error('Error al generar embeddings:', error);
      throw error;
    }
  }
}
