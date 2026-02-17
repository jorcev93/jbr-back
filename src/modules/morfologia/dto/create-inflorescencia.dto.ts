import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateInflorescenciaDto {
  @ApiProperty({ example: 'Racimo', required: false })
  @IsOptional()
  @IsString()
  tipo?: string;
}
