import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseUUIDPipe,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RAGService } from './rag.service';

@ApiTags('RAG - Embeddings')
@ApiBearerAuth()
@Controller('rag')
export class RAGController {
  private readonly logger = new Logger(RAGController.name);

  constructor(private ragService: RAGService) {}

  @Post('sync')
  @ApiOperation({
    summary: 'Sincroniza embeddings de todas las plantas',
    description:
      'Regenera los vectores de embeddings para todas las plantas activas. Útil para la carga inicial o corrección de datos.',
  })
  async syncAll() {
    this.logger.log('Iniciando sincronización completa de embeddings...');
    const result = await this.ragService.syncAllPlantEmbeddings();
    return {
      message: 'Sincronización completada',
      ...result,
    };
  }

  @Post('sync/:plantaId')
  @ApiOperation({
    summary: 'Sincroniza embedding de una planta específica',
    description: 'Regenera el vector de embedding para una planta.',
  })
  async syncOne(@Param('plantaId', ParseUUIDPipe) plantaId: string) {
    await this.ragService.syncPlantEmbedding(plantaId);
    return {
      message: 'Embedding sincronizado',
      plantaId,
    };
  }

  @Get('search')
  @ApiOperation({
    summary: 'Busca plantas por similitud semántica',
    description: 'Busca plantas usando el sistema RAG.',
  })
  async search(@Param('query') query: string) {
    const results = await this.ragService.search(query);
    return {
      query,
      results,
    };
  }

  @Post('chat')
  @ApiOperation({
    summary: 'Probar el chat RAG con Llama 3.2 local',
    description: 'Envía una pregunta para probar el flujo completo: Vector Search + LLM Generation',
  })
  async testChat(@Body('question') question: string) {
    // 1. Obtiene el contexto de PostgreSQL
    const context = await this.ragService.buildContext(question);

    // 2. Llama al LLM usando el AIProviderService (que ahora usa Ollama)
    // Para simplificar la prueba en este endpoint, accedemos directo al AIProviderService 
    // inyectado dentro del módulo de chat o podemos inyectarlo aquí
    const response = await this.ragService['aiProvider'].generateResponse(
      [], // Sin historial previo para la prueba
      question,
      `Eres un bot experto en jardinería. Responde a la pregunta basándote estrictamente en el siguiente contexto:\n\n${context}`
    );

    return {
      question,
      respuestaDelModelo: response,
      contextoUsado: context
    };
  }
}

