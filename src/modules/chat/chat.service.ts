import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Conversation } from './entities/conversation.entity';
import { Message, MessageRole } from './entities/message.entity';
import { AssistantService } from './assistant.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Cuenta } from '../usuarios/entities/cuenta.entity';

@Injectable()
export class ChatService {
  private readonly maxMessagesStored: number;
  private readonly contextMessages: number;

  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private assistantService: AssistantService,
    private configService: ConfigService,
  ) {
    this.maxMessagesStored = this.configService.get(
      'CHAT_MAX_MESSAGES_STORED',
      50,
    );
    this.contextMessages = this.configService.get('CHAT_CONTEXT_MESSAGES', 10);
  }

  async createConversation(
    user: Cuenta,
    dto: CreateConversationDto,
  ): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      userId: user.id,
      title: dto.title || 'Nueva conversación',
      isActive: true,
    });
    return this.conversationRepository.save(conversation);
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { userId, isActive: true, estado: true, messageCount: MoreThan(0) },
      order: { updatedAt: 'DESC' },
      take: 50,
    });
  }

  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, estado: true },
      relations: ['messages'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta conversación');
    }

    // Filtrar solo mensajes activos y ordenar por fecha
    conversation.messages = conversation.messages
      .filter((m) => m.estado)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

    return conversation;
  }

  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const conversation = await this.getConversation(conversationId, userId);
    conversation.estado = false;
    await this.conversationRepository.save(conversation);
  }

  async deleteAllConversations(userId: string): Promise<void> {
    const conversations = await this.conversationRepository.find({
      where: { userId, estado: true },
    });

    if (conversations.length > 0) {
      const conversationsToUpdate = conversations.map(c => ({
        ...c,
        estado: false,
      }));
      await this.conversationRepository.save(conversationsToUpdate);
    }
  }

  async saveUserMessage(
    conversationId: string,
    content: string,
    attachments?: { type: string; url: string; name: string }[],
  ): Promise<Message> {
    const message = this.messageRepository.create({
      conversationId,
      role: MessageRole.USER,
      content,
      attachments,
    });

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    const updateData: any = { messageCount: () => '"messageCount" + 1' };
    
    // Si es el primer mensaje o el título es el por defecto, actualizamos el título
    if (conversation && conversation.title === 'Nueva conversación') {
      updateData.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
    }

    await this.conversationRepository.update(
      { id: conversationId },
      updateData
    );

    return this.messageRepository.save(message);
  }

  async saveAssistantMessage(
    conversationId: string,
    content: string,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      conversationId,
      role: MessageRole.ASSISTANT,
      content,
    });

    await this.conversationRepository.increment(
      { id: conversationId },
      'messageCount',
      1,
    );

    // Limpiar mensajes antiguos si excede el límite
    await this.cleanOldMessages(conversationId);

    return this.messageRepository.save(message);
  }

  async getContextMessages(
    conversationId: string,
  ): Promise<{ role: string; content: string }[]> {
    const messages = await this.messageRepository.find({
      where: { conversationId, estado: true },
      order: { createdAt: 'DESC' },
      take: this.contextMessages,
    });

    return messages.reverse().map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }

  private async cleanOldMessages(conversationId: string): Promise<void> {
    const count = await this.messageRepository.count({
      where: { conversationId, estado: true },
    });

    if (count > this.maxMessagesStored) {
      const toDelete = count - this.maxMessagesStored;
      const oldMessages = await this.messageRepository.find({
        where: { conversationId, estado: true },
        order: { createdAt: 'ASC' },
        take: toDelete,
      });

      // Soft delete
      await this.messageRepository.update(
        { id: In(oldMessages.map((m) => m.id)) },
        { estado: false },
      );
    }
  }

  async *streamResponse(
    conversationId: string,
    userMessage: string,
    attachments?: { mimeType: string; data: Buffer }[],
  ): AsyncGenerator<string> {
    const context = await this.getContextMessages(conversationId);

    for await (const chunk of this.assistantService.generateStreamResponse(
      context,
      userMessage,
      attachments,
    )) {
      yield chunk;
    }
  }
}
