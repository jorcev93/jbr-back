/**
 * Interfaz base para todos los proveedores de IA
 * Permite intercambiar entre Azure, Ollama, Google, etc.
 */
export interface IAIProvider {
  /**
   * Genera una respuesta de texto basada en el historial y mensaje actual
   */
  generateResponse(
    history: ChatMessage[],
    userMessage: string,
    systemPrompt?: string,
  ): Promise<string>;

  /**
   * Genera una respuesta en streaming
   */
  generateStreamResponse(
    history: ChatMessage[],
    userMessage: string,
    systemPrompt?: string,
    attachments?: MessageAttachment[],
  ): AsyncGenerator<string>;

  /**
   * Verifica si el proveedor está configurado correctamente
   */
  isConfigured(): boolean;

  /**
   * Nombre del proveedor para logging
   */
  getProviderName(): string;
}

/**
 * Interfaz para proveedores de embeddings
 */
export interface IEmbeddingsProvider {
  /**
   * Genera un vector de embeddings para un texto
   */
  generateEmbedding(text: string): Promise<number[]>;

  /**
   * Genera embeddings para múltiples textos (batch)
   */
  generateEmbeddings(texts: string[]): Promise<number[][]>;

  /**
   * Dimensiones del vector de embeddings
   */
  getDimensions(): number;

  /**
   * Verifica si el proveedor está configurado
   */
  isConfigured(): boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MessageAttachment {
  mimeType: string;
  data: Buffer;
}

/**
 * Tipos de proveedores soportados
 */
export type AIProviderType = 'azure' | 'ollama' | 'google';
export type EmbeddingsProviderType = 'azure' | 'ollama' | 'google';

/**
 * Configuración para proveedores de IA
 */
export interface AIProviderConfig {
  type: AIProviderType;
  baseUrl: string;
  apiKey?: string;
  modelName: string;
}

export interface EmbeddingsProviderConfig {
  type: EmbeddingsProviderType;
  baseUrl: string;
  apiKey?: string;
  modelName: string;
  dimensions: number;
}
