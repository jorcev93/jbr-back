import { Logger } from '@nestjs/common';
import {
  IAIProvider,
  IEmbeddingsProvider,
  ChatMessage,
  MessageAttachment,
} from '../interfaces/ai-provider.interface';

/**
 * Clase base abstracta para proveedores de IA
 * Proporciona funcionalidad común y logging
 */
export abstract class BaseAIProvider implements IAIProvider {
  protected readonly logger: Logger;
  protected configured = false;

  constructor(providerName: string) {
    this.logger = new Logger(providerName);
  }

  abstract generateResponse(
    history: ChatMessage[],
    userMessage: string,
    systemPrompt?: string,
  ): Promise<string>;

  abstract generateStreamResponse(
    history: ChatMessage[],
    userMessage: string,
    systemPrompt?: string,
    attachments?: MessageAttachment[],
  ): AsyncGenerator<string>;

  abstract getProviderName(): string;

  isConfigured(): boolean {
    return this.configured;
  }

  protected setConfigured(value: boolean): void {
    this.configured = value;
    if (value) {
      this.logger.log(`${this.getProviderName()} configurado correctamente`);
    }
  }
}

/**
 * Clase base para proveedores de embeddings
 */
export abstract class BaseEmbeddingsProvider implements IEmbeddingsProvider {
  protected readonly logger: Logger;
  protected configured = false;
  protected dimensions: number;

  constructor(providerName: string, dimensions: number) {
    this.logger = new Logger(providerName);
    this.dimensions = dimensions;
  }

  abstract generateEmbedding(text: string): Promise<number[]>;

  abstract generateEmbeddings(texts: string[]): Promise<number[][]>;

  getDimensions(): number {
    return this.dimensions;
  }

  isConfigured(): boolean {
    return this.configured;
  }

  protected setConfigured(value: boolean): void {
    this.configured = value;
    if (value) {
      this.logger.log(
        `Embeddings provider configurado (${this.dimensions} dimensiones)`,
      );
    }
  }
}
