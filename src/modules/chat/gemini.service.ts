import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private genAI!: GoogleGenAI;
  private modelName = 'gemini-2.5-flash-lite';

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY no configurada. El servicio de chat no funcionará.',
      );
      return;
    }
    this.genAI = new GoogleGenAI({ apiKey });
    this.logger.log('GeminiService inicializado correctamente');
  }

  private getSystemPrompt(): string {
    return `
Eres un asistente experto del Jardín Botánico Real del Ecuador (JBRE).
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
  }

  async *generateStreamResponse(
    history: { role: string; content: string }[],
    userMessage: string,
    attachments?: { mimeType: string; data: Buffer }[],
  ): AsyncGenerator<string> {
    if (!this.genAI) {
      yield 'Error: El servicio de IA no está configurado. Por favor, contacte al administrador.';
      return;
    }

    const contents: Array<{
      role: string;
      parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
    }> = [];

    // Agregar historial
    for (const msg of history) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    // Preparar el mensaje actual con posibles adjuntos
    const currentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
      { text: userMessage },
    ];

    // Agregar imágenes si existen
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

    try {
      const response = await this.genAI.models.generateContentStream({
        model: this.modelName,
        contents,
        config: {
          systemInstruction: this.getSystemPrompt(),
        },
      });

      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      this.logger.error('Error al generar respuesta de Gemini:', error);
      yield `Error al procesar la solicitud: ${error instanceof Error ? error.message : 'Error desconocido'}`;
    }
  }

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
