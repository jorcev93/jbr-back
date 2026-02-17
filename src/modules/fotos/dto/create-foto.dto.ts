import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class CreateFotoDto {
  @ApiProperty({ example: 'Flor en plena floración', required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    example: 'flor',
    enum: ['flor', 'hoja', 'fruto', 'tallo', 'raiz', 'general'],
    required: false,
  })
  @IsOptional()
  @IsIn(['flor', 'hoja', 'fruto', 'tallo', 'raiz', 'general'])
  tipo?: string;
}
