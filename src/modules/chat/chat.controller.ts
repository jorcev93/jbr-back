import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Res,
  Header,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';
import { Cuenta } from '../usuarios/entities/cuenta.entity';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Crear nueva conversación' })
  createConversation(
    @GetUser() user: Cuenta,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.createConversation(user, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Listar conversaciones del usuario' })
  getConversations(@GetUser() user: Cuenta) {
    return this.chatService.getConversations(user.id);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Obtener conversación con mensajes' })
  getConversation(
    @Param('id', UuidValidationPipe) id: string,
    @GetUser() user: Cuenta,
  ) {
    return this.chatService.getConversation(id, user.id);
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Eliminar conversación' })
  deleteConversation(
    @Param('id', UuidValidationPipe) id: string,
    @GetUser() user: Cuenta,
  ) {
    return this.chatService.deleteConversation(id, user.id);
  }

  @Delete('conversations')
  @ApiOperation({ summary: 'Eliminar todas las conversaciones del usuario' })
  deleteAllConversations(@GetUser() user: Cuenta) {
    return this.chatService.deleteAllConversations(user.id);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Enviar mensaje (sin streaming)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 5))
  async sendMessage(
    @Param('id', UuidValidationPipe) conversationId: string,
    @Body() dto: CreateMessageDto,
    @GetUser() user: Cuenta,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Verificar acceso
    await this.chatService.getConversation(conversationId, user.id);

    // Procesar archivos adjuntos
    let attachments: { mimeType: string; data: Buffer }[] | undefined;
    if (files && files.length > 0) {
      attachments = files.map((file) => ({
        mimeType: file.mimetype,
        data: file.buffer,
      }));
    }

    // Guardar mensaje del usuario
    await this.chatService.saveUserMessage(conversationId, dto.content);

    // Generar respuesta completa
    let fullResponse = '';
    for await (const chunk of this.chatService.streamResponse(
      conversationId,
      dto.content,
      attachments,
    )) {
      fullResponse += chunk;
    }

    // Guardar respuesta
    const assistantMessage = await this.chatService.saveAssistantMessage(
      conversationId,
      fullResponse,
    );

    return assistantMessage;
  }

  @Post('conversations/:id/stream')
  @ApiOperation({ summary: 'Enviar mensaje con streaming SSE' })
  @ApiConsumes('multipart/form-data')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @UseInterceptors(FilesInterceptor('files', 5))
  async streamMessage(
    @Param('id', UuidValidationPipe) conversationId: string,
    @Body() dto: CreateMessageDto,
    @GetUser() user: Cuenta,
    @Res() res: Response,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    try {
      // Verificar acceso
      await this.chatService.getConversation(conversationId, user.id);

      // Procesar archivos adjuntos
      let attachments: { mimeType: string; data: Buffer }[] | undefined;
      if (files && files.length > 0) {
        attachments = files.map((file) => ({
          mimeType: file.mimetype,
          data: file.buffer,
        }));
      }

      // Guardar mensaje del usuario
      await this.chatService.saveUserMessage(conversationId, dto.content);

      // Stream de respuesta
      let fullResponse = '';
      for await (const chunk of this.chatService.streamResponse(
        conversationId,
        dto.content,
        attachments,
      )) {
        fullResponse += chunk;
        res.write(chunk);
      }

      // Guardar respuesta completa
      await this.chatService.saveAssistantMessage(conversationId, fullResponse);

      res.end();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      res.write(`Error: ${errorMessage}`);
      res.end();
    }
  }
}
