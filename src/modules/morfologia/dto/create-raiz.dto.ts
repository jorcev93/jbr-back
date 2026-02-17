import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateRaizDto {
  @ApiProperty({ example: 'Pivotante', required: false })
  @IsOptional()
  @IsString()
  tipo?: string;
}
