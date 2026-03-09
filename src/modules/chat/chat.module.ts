import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { GeminiService } from './gemini.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { AIProviderModule } from '../ai-provider';
import { RAGModule } from '../rag';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    AIProviderModule,
    RAGModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, GeminiService],
  exports: [ChatService],
})
export class ChatModule {}
