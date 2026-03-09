import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantEmbedding } from './entities/plant-embedding.entity';
import { RAGService } from './rag.service';
import { RAGController } from './rag.controller';
import { PlantSyncSubscriber } from './subscribers/plant-sync.subscriber';
import { Planta } from '../plantas/entities/planta.entity';
import { AIProviderModule } from '../ai-provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlantEmbedding, Planta]),
    AIProviderModule,
  ],
  controllers: [RAGController],
  providers: [RAGService, PlantSyncSubscriber],
  exports: [RAGService, PlantSyncSubscriber],
})
export class RAGModule implements OnModuleInit {
  private readonly logger = new Logger(RAGModule.name);

  constructor(
    private ragService: RAGService,
    private plantSyncSubscriber: PlantSyncSubscriber,
  ) {}

  onModuleInit() {
    // Conectar el subscriber con el servicio RAG
    this.plantSyncSubscriber.setSyncCallback(
      this.ragService.syncPlantEmbedding.bind(this.ragService),
    );
    this.logger.log('RAGModule inicializado');
  }
}
