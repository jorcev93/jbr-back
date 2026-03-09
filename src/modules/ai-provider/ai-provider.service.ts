import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IAIProvider,
  IEmbeddingsProvider,
  ChatMessage,
  MessageAttachment,
  AIProviderType,
} from './interfaces/ai-provider.interface';
import {
  OpenAICompatibleProvider,
  OpenAICompatibleEmbeddingsProvider,
} from './providers/openai-compatible.provider';
import {
  GoogleAIProvider,
  GoogleAIEmbeddingsProvider,
} from './providers/google-ai.provider';

/**
 * Servicio principal que gestiona los proveedores de IA
 * Soporta cambio de proveedor mediante variables de entorno
 */
@Injectable()
export class AIProviderService implements OnModuleInit {
  private readonly logger = new Logger(AIProviderService.name);

  private primaryProvider: IAIProvider | null = null;
  private fallbackProvider: IAIProvider | null = null;
  private embeddingsProvider: IEmbeddingsProvider | null = null;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initializePrimaryProvider();
    this.initializeFallbackProvider();
    this.initializeEmbeddingsProvider();
    this.logConfiguration();
  }

  /**
   * Inicializa el proveedor principal de chat
   */
  private initializePrimaryProvider(): void {
    const providerType = this.configService.get<AIProviderType>(
      'AI_PROVIDER',
      'azure',
    );
    const baseUrl = this.configService.get<string>('AI_BASE_URL', '');
    const apiKey = this.configService.get<string>('AI_API_KEY', '');
    const modelName = this.configService.get<string>(
      'AI_MODEL_NAME',
      'gemma-3-4b-it',
    );

    this.primaryProvider = this.createProvider(
      providerType,
      baseUrl,
      apiKey,
      modelName,
    );
  }

  /**
   * Inicializa el proveedor de fallback (respaldo)
   */
  private initializeFallbackProvider(): void {
    const fallbackEnabled = this.configService.get<boolean>(
      'FALLBACK_ENABLED',
      false,
    );

    if (!fallbackEnabled) {
      this.logger.log('Fallback deshabilitado');
      return;
    }

    const providerType = this.configService.get<AIProviderType>(
      'FALLBACK_PROVIDER',
      'google',
    );
    const baseUrl = this.configService.get<string>('FALLBACK_BASE_URL', '');
    const apiKey = this.configService.get<string>('FALLBACK_API_KEY', '');
    const modelName = this.configService.get<string>(
      'FALLBACK_MODEL_NAME',
      'gemini-1.5-flash',
    );

    this.fallbackProvider = this.createProvider(
      providerType,
      baseUrl,
      apiKey,
      modelName,
    );
  }

  /**
   * Inicializa el proveedor de embeddings
   */
  private initializeEmbeddingsProvider(): void {
    const providerType = this.configService.get<AIProviderType>(
      'EMBEDDINGS_PROVIDER',
      'azure',
    );
    const baseUrl = this.configService.get<string>('EMBEDDINGS_BASE_URL', '');
    const apiKey = this.configService.get<string>('EMBEDDINGS_API_KEY', '');
    const modelName = this.configService.get<string>(
      'EMBEDDINGS_MODEL_NAME',
      'text-embedding-3-small',
    );
    const dimensions = this.configService.get<number>(
      'EMBEDDINGS_DIMENSIONS',
      1536,
    );

    this.embeddingsProvider = this.createEmbeddingsProvider(
      providerType,
      baseUrl,
      apiKey,
      modelName,
      dimensions,
    );
  }

  /**
   * Crea un proveedor de chat según el tipo
   */
  private createProvider(
    type: AIProviderType,
    baseUrl: string,
    apiKey: string,
    modelName: string,
  ): IAIProvider {
    switch (type) {
      case 'google':
        return new GoogleAIProvider(apiKey, modelName);

      case 'azure':
      case 'ollama':
      default:
        // Ambos usan API compatible con OpenAI
        return new OpenAICompatibleProvider(type, baseUrl, apiKey, modelName);
    }
  }

  /**
   * Crea un proveedor de embeddings según el tipo
   */
  private createEmbeddingsProvider(
    type: AIProviderType,
    baseUrl: string,
    apiKey: string,
    modelName: string,
    dimensions: number,
  ): IEmbeddingsProvider {
    switch (type) {
      case 'google':
        return new GoogleAIEmbeddingsProvider(apiKey, modelName, dimensions);

      case 'azure':
      case 'ollama':
      default:
        return new OpenAICompatibleEmbeddingsProvider(
          type,
          baseUrl,
          apiKey,
          modelName,
          dimensions,
        );
    }
  }

  /**
   * Log de configuración actual
   */
  private logConfiguration(): void {
    const primaryName = this.primaryProvider?.getProviderName() || 'ninguno';
    const fallbackName = this.fallbackProvider?.getProviderName() || 'ninguno';
    const embeddingsConfigured = this.embeddingsProvider?.isConfigured()
      ? 'configurado'
      : 'no configurado';

    this.logger.log(`Proveedor principal: ${primaryName}`);
    this.logger.log(`Proveedor fallback: ${fallbackName}`);
    this.logger.log(`Embeddings: ${embeddingsConfigured}`);
  }

  /**
   * Genera respuesta de chat con fallback automático
   */
  async generateResponse(
    history: ChatMessage[],
    userMessage: string,
    systemPrompt?: string,
  ): Promise<string> {
    // Intentar con proveedor principal
    if (this.primaryProvider?.isConfigured()) {
      try {
        const response = await this.primaryProvider.generateResponse(
          history,
          userMessage,
          systemPrompt,
        );

        // Verificar si necesita fallback
        if (this.needsFallback(response) && this.fallbackProvider?.isConfigured()) {
          this.logger.log('Activando fallback por respuesta FALLBACK_REQUIRED');
          return this.fallbackProvider.generateResponse(
            history,
            userMessage,
            systemPrompt,
          );
        }

        return response;
      } catch (error) {
        this.logger.error('Error en proveedor principal:', error);

        // Intentar fallback si está disponible
        if (this.fallbackProvider?.isConfigured()) {
          this.logger.log('Activando fallback por error en proveedor principal');
          return this.fallbackProvider.generateResponse(
            history,
            userMessage,
            systemPrompt,
          );
        }

        throw error;
      }
    }

    // Si no hay proveedor principal, usar fallback
    if (this.fallbackProvider?.isConfigured()) {
      return this.fallbackProvider.generateResponse(
        history,
        userMessage,
        systemPrompt,
      );
    }

    throw new Error('No hay proveedores de IA configurados');
  }

  /**
   * Genera respuesta en streaming con fallback automático
   */
  async *generateStreamResponse(
    history: ChatMessage[],
    userMessage: string,
    systemPrompt?: string,
    attachments?: MessageAttachment[],
  ): AsyncGenerator<string> {
    // Intentar con proveedor principal
    if (this.primaryProvider?.isConfigured()) {
      let fullResponse = '';
      let useFallback = false;

      try {
        for await (const chunk of this.primaryProvider.generateStreamResponse(
          history,
          userMessage,
          systemPrompt,
          attachments,
        )) {
          fullResponse += chunk;

          // Si detectamos FALLBACK_REQUIRED, no emitimos más y activamos fallback
          if (this.needsFallback(fullResponse)) {
            useFallback = true;
            break;
          }

          yield chunk;
        }

        // Si se necesita fallback, usar el proveedor secundario
        if (useFallback && this.fallbackProvider?.isConfigured()) {
          this.logger.log('Activando fallback en streaming');
          for await (const chunk of this.fallbackProvider.generateStreamResponse(
            history,
            userMessage,
            systemPrompt,
            attachments,
          )) {
            yield chunk;
          }
        }

        return;
      } catch (error) {
        this.logger.error('Error en streaming principal:', error);

        if (this.fallbackProvider?.isConfigured()) {
          this.logger.log('Activando fallback por error en streaming');
          for await (const chunk of this.fallbackProvider.generateStreamResponse(
            history,
            userMessage,
            systemPrompt,
            attachments,
          )) {
            yield chunk;
          }
          return;
        }

        yield `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        return;
      }
    }

    // Si no hay proveedor principal, usar fallback
    if (this.fallbackProvider?.isConfigured()) {
      for await (const chunk of this.fallbackProvider.generateStreamResponse(
        history,
        userMessage,
        systemPrompt,
        attachments,
      )) {
        yield chunk;
      }
      return;
    }

    yield 'Error: No hay proveedores de IA configurados';
  }

  /**
   * Detecta si la respuesta requiere fallback
   */
  private needsFallback(response: string): boolean {
    const trimmed = response.trim().toUpperCase();
    return (
      trimmed === 'FALLBACK_REQUIRED' ||
      trimmed.includes('FALLBACK_REQUIRED')
    );
  }

  /**
   * Genera embedding para un texto
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.embeddingsProvider?.isConfigured()) {
      throw new Error('Proveedor de embeddings no configurado');
    }
    return this.embeddingsProvider.generateEmbedding(text);
  }

  /**
   * Genera embeddings para múltiples textos
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.embeddingsProvider?.isConfigured()) {
      throw new Error('Proveedor de embeddings no configurado');
    }
    return this.embeddingsProvider.generateEmbeddings(texts);
  }

  /**
   * Obtiene las dimensiones del modelo de embeddings
   */
  getEmbeddingDimensions(): number {
    return this.embeddingsProvider?.getDimensions() || 1536;
  }

  /**
   * Verifica si el servicio está configurado
   */
  isConfigured(): boolean {
    return (
      this.primaryProvider?.isConfigured() ||
      this.fallbackProvider?.isConfigured() ||
      false
    );
  }

  /**
   * Verifica si embeddings está configurado
   */
  isEmbeddingsConfigured(): boolean {
    return this.embeddingsProvider?.isConfigured() || false;
  }
}
