import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiPropertyOptional({ description: 'Título opcional de la conversación' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;
}
